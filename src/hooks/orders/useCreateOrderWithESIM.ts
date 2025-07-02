
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useESIMAccess } from '@/hooks/useESIMAccess';
import type { CreateOrderData, OrderInsert } from './types';

export const useCreateOrderWithESIM = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createOrderAsync: createESIMOrder } = useESIMAccess();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating order with eSIM integration:', orderData);

      // First, get the eSIM package mapping
      const { data: esimPackage, error: packageError } = await supabase
        .from('esim_packages')
        .select('*')
        .eq('plan_id', orderData.plan_id)
        .eq('is_active', true)
        .single();

      if (packageError || !esimPackage) {
        console.error('eSIM package mapping not found:', packageError);
        throw new Error('Plan not available for eSIM provisioning');
      }

      // Create the local order first
      const order: OrderInsert = {
        user_id: user.id,
        plan_id: orderData.plan_id,
        plan_name: orderData.plan_name,
        data_amount: orderData.data_amount,
        duration_days: orderData.duration_days,
        price: orderData.price,
        currency: orderData.currency || 'EUR',
        status: 'pending',
        payment_status: 'pending',
        esim_package_id: esimPackage.esim_access_package_id,
        esim_status: 'pending'
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

      console.log('Local order created:', orderResult);

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

      // Create eSIM order with eSIM Access API
      try {
        const esimOrderResponse = await createESIMOrder({
          packageId: esimPackage.esim_access_package_id,
          customerEmail: user.email || '',
          customerName: user.user_metadata?.full_name || user.email || '',
          referenceId: orderResult.id
        });

        if (esimOrderResponse.success && esimOrderResponse.data) {
          // Update the order with eSIM order ID
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              esim_order_id: esimOrderResponse.data.id || esimOrderResponse.data.orderId,
              esim_status: esimOrderResponse.data.status || 'pending'
            })
            .eq('id', orderResult.id);

          if (updateError) {
            console.error('Error updating order with eSIM data:', updateError);
          }

          // Create eSIM activation record
          const { error: activationError } = await supabase
            .from('esim_activations')
            .insert({
              order_id: orderResult.id,
              user_id: user.id,
              status: 'pending',
              provisioning_status: 'pending',
              activation_url: esimOrderResponse.data.downloadUrl || null
            });

          if (activationError) {
            console.error('Error creating eSIM activation:', activationError);
          }
        } else {
          console.error('eSIM order creation failed:', esimOrderResponse);
          // Don't fail the entire order, just log the error
          toast({
            title: "eSIM provisioning delayed",
            description: "Your order was created but eSIM provisioning will be completed shortly.",
            variant: "default",
          });
        }
      } catch (esimError) {
        console.error('eSIM order creation error:', esimError);
        // Don't fail the entire order, just log the error
      }

      console.log('Order creation completed successfully');
      return orderResult;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Order Created",
        description: `Order ${order.id} has been created and eSIM provisioning initiated.`,
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

  return {
    createOrder: createOrderMutation.mutate,
    createOrderAsync: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending
  };
};
