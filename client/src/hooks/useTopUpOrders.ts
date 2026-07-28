import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface TopUpOption {
  id: string;
  type: 'data' | 'validity' | 'both';
  name: string;
  data_amount?: string | null;
  validity_days?: number | null;
  price: number;
  currency: string;
  sort_order: number;
}

export interface TopUpOptionsResponse {
  supported: boolean;
  reason: string | null;
  options: TopUpOption[];
}

export interface TopUpOrder {
  id: string;
  parent_order_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  failure_reason?: string | null;
  completed_at?: string | null;
}

// Options are resolved SERVER-SIDE for a specific parent order: the edge
// function checks ownership, supplier support, and region match. The client
// never decides what can be bought or at what price.
export const useTopUpOptions = (parentOrderId: string | null, enabled: boolean) => {
  return useQuery<TopUpOptionsResponse>({
    queryKey: ['topup-options', parentOrderId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-topup-options', {
        body: { parent_order_id: parentOrderId },
      });
      if (error) throw error;
      return data as TopUpOptionsResponse;
    },
    enabled: enabled && !!parentOrderId,
    staleTime: 60_000,
  });
};

export interface TopUpIntent {
  clientSecret: string;
  paymentIntentId: string;
  topUpOrderId: string;
  amount: number;
  currency: string;
}

export const useCreateTopUpIntent = () => {
  return useMutation<TopUpIntent, Error, { parentOrderId: string; optionId: string }>({
    mutationFn: async ({ parentOrderId, optionId }) => {
      const { data, error } = await supabase.functions.invoke('create-topup-payment-intent', {
        body: { parent_order_id: parentOrderId, topup_option_id: optionId },
      });
      if (error) {
        // Surface the server's message when available
        const ctx = (error as any)?.context;
        let msg = error.message;
        try {
          const body = await ctx?.json?.();
          if (body?.error) msg = body.error;
        } catch { /* keep default */ }
        throw new Error(msg);
      }
      if (!data?.clientSecret) throw new Error('Could not start the top-up payment.');
      return data as TopUpIntent;
    },
  });
};

// After payment, the Stripe webhook applies the top-up. Poll the row until it
// reaches a terminal state so the customer sees the REAL outcome, never a
// simulated one.
export const useTopUpOrderStatus = (topUpOrderId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useQuery<TopUpOrder | null>({
    queryKey: ['topup-order-status', topUpOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topup_orders')
        .select('id, parent_order_id, status, payment_status, failure_reason, completed_at')
        .eq('id', topUpOrderId!)
        .maybeSingle();
      if (error) throw error;
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        queryClient.invalidateQueries({ queryKey: ['topup-orders'] });
      }
      return data as TopUpOrder | null;
    },
    enabled: !!topUpOrderId && !!user,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'completed' || s === 'failed' || s === 'cancelled' ? false : 3000;
    },
  });
};
