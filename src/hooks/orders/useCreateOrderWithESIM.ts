
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useESIMAccess } from '@/hooks/useESIMAccess';
import type { CreateOrderData } from './types';

// Define the order insert type with eSIM fields
interface OrderInsertWithESIM {
  user_id: string;
  plan_id: string;
  plan_name: string;
  data_amount: string;
  duration_days: number;
  price: number;
  currency: string;
  status: string;
  payment_status: string;
  esim_package_id?: string;
  esim_status?: string;
}

export const useCreateOrderWithESIM = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createOrderAsync: createESIMOrder } = useESIMAccess();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating order with eSIM integration:', orderData);

      let esimPackageId: string | null = null;
      
      // Try to get the eSIM package mapping using the new function
      try {
        const { data: packageResponse, error: packageError } = await supabase.functions.invoke('get-esim-package', {
          body: { planId: orderData.plan_id }
        });

        if (!packageError && packageResponse) {
          esimPackageId = packageResponse.esim_access_package_id;
          console.log('Found eSIM package mapping:', esimPackageId);
        } else {
          console.log('No eSIM package mapping found for plan:', orderData.plan_id);
        }
      } catch (error) {
        console.log('Error fetching eSIM package mapping:', error);
        // Continue without eSIM integration
      }

      // Create the local order first
      const order: OrderInsertWithESIM = {
        user_id: user.id,
        plan_id: orderData.plan_id,
        plan_name: orderData.plan_name,
        data_amount: orderData.data_amount,
        duration_days: orderData.duration_days,
        price: orderData.price,
        currency: orderData.currency || 'EUR',
        status: 'pending',
        payment_status: 'pending',
        ...(esimPackageId && {
          esim_package_id: esimPackageId,
          esim_status: 'pending'
        })
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(order as any) // Use any to bypass type checking temporarily
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

      // Create eSIM order with eSIM Access API if we have a package ID
      if (esimPackageId) {
        try {
          const esimOrderResponse = await createESIMOrder({
            packageId: esimPackageId,
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
              } as any) // Use any to bypass type checking temporarily
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
        }
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
