
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useFetchOrders = () => {
  const { user } = useAuth();

  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching orders for user:', user.id);

      // Rely on RLS to return all orders the user can access:
      // - orders.user_id = auth.uid()  (own orders by user_id)
      // - orders.customer_email = auth.email()  (guest orders accessed via magic link)
      // No client-side user_id filter needed; RLS handles both cases.
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          esim_activations(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
      }

      console.log('User orders data:', data);
      return data;
    },
    enabled: !!user,
  });

  return {
    orders: orders || [],
    ordersLoading,
    ordersError
  };
};
