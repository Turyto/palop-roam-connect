import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PartnerCommissionRow {
  id: string;
  order_id: string | null;
  customer_name: string | null;
  amount: number;
  currency: string;
  rate: number;
  status: 'owed' | 'paid' | 'cancelled';
  commission_date: string;
  paid_at: string | null;
}

export interface PartnerConsignmentRow {
  id: string;
  batch_id: string | null;
  plan_name: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface PartnerDashboardData {
  partner: {
    code: string;
    label: string;
    total_sales_count: number;
  };
  summary: {
    commission_total_earned: number;
    commission_total_paid: number;
    commission_total_pending: number;
    consignment_total_pending: number;
    consignment_total_paid: number;
  };
  commissions: PartnerCommissionRow[];
  consignment_orders: PartnerConsignmentRow[];
}

export const usePartnerDashboard = (enabled: boolean) =>
  useQuery<PartnerDashboardData>({
    queryKey: ['partner-dashboard'],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-partner-dashboard', {
        body: {},
      });
      if (error) {
        throw new Error(error.message ?? 'Failed to load partner data');
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      return data as PartnerDashboardData;
    },
  });

const eurFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
});

export const formatEUR = (value: number | null | undefined): string =>
  eurFormatter.format(Number(value) || 0);

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};
