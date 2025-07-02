
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
  esim_order_id?: string;
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

      // Check if this plan has eSIM Access integration using edge function
      const { data: packageResponse, error: packageError } = await supabase.functions.invoke('get-esim-package', {
        body: { plan_id: orderData.plan_id }
      });

      const packageData = packageResponse?.data;
      let esimOrderData = null;
      let esimError = null;

      if (packageData && !packageError) {
        console.log('Found eSIM package mapping:', packageData);
        
        try {
          // Try to create eSIM order
          const esimResponse = await createESIMOrder({
            packageId: packageData.esim_access_package_id,
            customerEmail: user.email || '',
            customerName: user.user_metadata?.full_name || user.email || '',
            referenceId: `temp-${Date.now()}` // Temporary reference
          });

          if (esimResponse.success && esimResponse.data) {
            esimOrderData = esimResponse.data;
            console.log('eSIM order created successfully:', esimOrderData);
          } else {
            console.error('eSIM order creation failed:', esimResponse);
            esimError = esimResponse.error || 'Failed to create eSIM order';
          }
        } catch (error) {
          console.error('eSIM order creation error:', error);
          esimError = error.message || 'eSIM provisioning failed';
        }
      } else {
        console.log('No eSIM package mapping found or error:', packageError);
      }

      // Create the local order regardless of eSIM status
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
        ...(packageData && {
          esim_package_id: packageData.esim_access_package_id,
          esim_status: esimOrderData ? 'provisioned' : 'failed',
          esim_order_id: esimOrderData?.id || esimOrderData?.orderId
        })
      };

      console.log('Inserting order into database:', order);

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error(`Database error: ${orderError.message}`);
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
        throw new Error(`Order item creation failed: ${itemError.message}`);
      }

      // If we have eSIM data, create the activation record with real data
      if (esimOrderData && packageData) {
        console.log('Creating eSIM activation with real data:', esimOrderData);
        
        // Use the real activation code from eSIM Access as the activation URL
        const realActivationUrl = esimOrderData.activationCode || esimOrderData.downloadUrl || esimOrderData.qrCodeUrl;
        
        const { error: activationError } = await supabase
          .from('esim_activations')
          .insert({
            order_id: orderResult.id,
            user_id: user.id,
            status: 'pending',
            provisioning_status: 'completed',
            activation_url: realActivationUrl,
            iccid: esimOrderData.iccid,
            activation_code: esimOrderData.activationCode,
            qr_code_data: esimOrderData.qrCodeUrl,
            provisioning_log: {
              esim_order_id: esimOrderData.id || esimOrderData.orderId,
              created_at: new Date().toISOString(),
              api_response: esimOrderData
            }
          });

        if (activationError) {
          console.error('Error creating eSIM activation:', activationError);
          // Don't throw here - order was created successfully
        }

        // Create QR code with real activation code as the URL
        const { error: qrError } = await supabase
          .from('qr_codes')
          .insert({
            order_id: orderResult.id,
            user_id: user.id,
            esim_id: null, // Will be linked later
            activation_url: realActivationUrl,
            qr_image_url: esimOrderData.qrCodeUrl,
            status: 'active'
          });

        if (qrError) {
          console.error('Error creating QR code:', qrError);
          // Don't throw here - order was created successfully
        }
      } else if (packageData && esimError) {
        // Create a failed eSIM activation record for debugging
        const { error: activationError } = await supabase
          .from('esim_activations')
          .insert({
            order_id: orderResult.id,
            user_id: user.id,
            status: 'pending',
            provisioning_status: 'failed',
            provisioning_log: {
              error: esimError,
              failed_at: new Date().toISOString(),
              package_id: packageData.esim_access_package_id
            }
          });

        if (activationError) {
          console.error('Error creating failed eSIM activation record:', activationError);
          // Don't throw here - order was created successfully
        }
      }

      console.log('Order creation completed successfully');
      
      // Return both the order and any eSIM error for user feedback
      return { 
        order: orderResult, 
        esimError: esimError,
        esimSuccess: !!esimOrderData
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-qr-codes'] });
      
      if (result.esimSuccess) {
        toast({
          title: "Order Created Successfully!",
          description: `Order ${result.order.id} has been created with real eSIM provisioning.`,
        });
      } else if (result.esimError) {
        toast({
          title: "Order Created with eSIM Warning",
          description: `Order was created, but eSIM provisioning failed: ${result.esimError}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order Created",
          description: `Order ${result.order.id} has been created successfully.`,
        });
      }
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
