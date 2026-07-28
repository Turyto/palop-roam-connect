import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for "a customer paid and did not get what they paid for".
 *
 * - Failed delivery (order): payment succeeded, eSIM provisioning failed,
 *   and the order was never completed or cancelled.
 * - Failed top-up: payment succeeded but the top-up was never applied
 *   to the eSIM (not completed, not cancelled).
 *
 * The Orders-tab banner, the "Failed deliveries" KPI card and the global
 * alert bar must ALL read from this module so the numbers never diverge.
 */

export interface ProblemOrder {
  id: string;
  customer_email: string | null;
  plan_name: string;
  price: number;
  currency: string;
  created_at: string;
  esim_failure_reason?: string | null;
}

export interface ProblemTopup {
  id: string;
  parent_order_id: string;
  data_amount: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  failure_reason: string | null;
}

// Predicate shared with AdminOrdersTable's "Needs attention" filter.
export const isFailedDelivery = (order: {
  esim_status: string | null;
  payment_status: string;
  status: string;
}) =>
  order.esim_status === "failed" &&
  order.payment_status === "succeeded" &&
  order.status !== "completed" &&
  order.status !== "cancelled";

export const DELIVERY_PROBLEMS_QUERY_KEY = ["admin-delivery-problems"];

export const useDeliveryProblems = () => {
  return useQuery({
    queryKey: DELIVERY_PROBLEMS_QUERY_KEY,
    queryFn: async () => {
      const [ordersRes, topupsRes] = await Promise.all([
        supabase
          .from("orders")
          .select(
            "id, customer_email, plan_name, price, currency, created_at, esim_failure_reason"
          )
          .eq("esim_status", "failed")
          .eq("payment_status", "succeeded")
          // Include legacy rows with NULL status — NOT IN would drop them.
          .or('status.is.null,status.not.in.("completed","cancelled")')
          .order("created_at", { ascending: false }),
        supabase
          .from("topup_orders")
          .select(
            "id, parent_order_id, data_amount, price, currency, status, created_at, failure_reason"
          )
          .eq("payment_status", "succeeded")
          .or('status.is.null,status.not.in.("completed","cancelled")')
          .order("created_at", { ascending: false }),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (topupsRes.error) throw topupsRes.error;

      const failedOrders = (ordersRes.data ?? []) as ProblemOrder[];
      const failedTopups = (topupsRes.data ?? []) as ProblemTopup[];

      return {
        failedOrders,
        failedTopups,
        totalProblems: failedOrders.length + failedTopups.length,
      };
    },
    refetchInterval: 60_000, // keep the alert bar fresh while the dashboard is open
  });
};
