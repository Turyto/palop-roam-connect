import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;
type OrderInsert = TablesInsert<'orders'>;
type OrderItem = Tables<'order_items'>;
type ESIMActivation = Tables<'esim_activations'>;

export const useOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's orders
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching orders for user:', user.id);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          esim_activations(*)
        `)
        .eq('user_id', user.id)
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

  // Create new order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      plan_id: string;
      plan_name: string;
      data_amount: string;
      duration_days: number;
      price: number;
      currency?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating order with data:', orderData);

      const order: OrderInsert = {
        user_id: user.id,
        plan_id: orderData.plan_id,
        plan_name: orderData.plan_name,
        data_amount: orderData.data_amount,
        duration_days: orderData.duration_days,
        price: orderData.price,
        currency: orderData.currency || 'EUR',
        status: 'pending',
        payment_status: 'pending'
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created:', orderResult);

      // Create order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderResult.id,
          plan_id: orderData.plan_id,
          plan_name: orderData.plan_name,
          data_amount: orderData.data_amount,
          duration_days: orderData.duration_days,
          unit_price: orderData.price,
          quantity: 1,
          total_price: orderData.price
        });

      if (itemError) {
        console.error('Error creating order item:', itemError);
        throw itemError;
      }

      console.log('Order item created successfully');
      return orderResult;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Order Created",
        description: `Order ${order.id} has been created successfully.`,
      });
    },
    onError: (error) => {
      console.error('Order creation error:', error);
      toast({
        title: "Order Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      paymentStatus, 
      paymentIntentId 
    }: {
      orderId: string;
      status?: string;
      paymentStatus?: string;
      paymentIntentId?: string;
    }) => {
      console.log('Updating order:', orderId, { status, paymentStatus, paymentIntentId });
      
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;
      if (paymentIntentId) updateData.payment_intent_id = paymentIntentId;
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }
      
      console.log('Order updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (error) => {
      console.error('Order update error:', error);
      toast({
        title: "Order Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    orders: orders || [],
    ordersLoading,
    ordersError,
    createOrder: createOrderMutation.mutate,
    createOrderAsync: createOrderMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending
  };
};
