
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
  payment_intent_id?: string;
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
      if (!user) throw new Error('No active session. Please try again.');

      // Use the explicitly passed email, or fall back to the signed-in user's email
      const customerEmail = orderData.customerEmail || user.email || '';

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
            customerEmail: customerEmail,
            customerName: user.user_metadata?.full_name || customerEmail,
            referenceId: `temp-${Date.now()}` // Temporary reference
          });

          if (esimResponse.success && esimResponse.data) {
            esimOrderData = esimResponse.data;
            console.log('eSIM order created successfully:', esimOrderData);
            console.log('Full eSIM response data:', JSON.stringify(esimOrderData, null, 2));
            
            // Log all URL fields to understand the structure
            console.log('🔍 Available URL fields in eSIM response after order creation:');
            console.log('- shortUrl:', esimOrderData.shortUrl);
            console.log('- downloadUrl:', esimOrderData.downloadUrl);
            console.log('- url:', esimOrderData.url);
            console.log('- qrCodeUrl:', esimOrderData.qrCodeUrl);
            console.log('- activationUrl:', esimOrderData.activationUrl);
            console.log('- activationCode (LPA):', esimOrderData.activationCode);
            console.log('- iccid:', esimOrderData.iccid);
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
        status: orderData.payment_intent_id ? 'active' : 'pending',
        payment_status: orderData.payment_intent_id ? 'paid' : 'pending',
        payment_intent_id: orderData.payment_intent_id,
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

      // If we have eSIM data, create the activation record with proper URL handling
      if (esimOrderData && packageData) {
        console.log('Creating eSIM activation with enhanced URL mapping:', esimOrderData);
        
        // Priority order: shortUrl > downloadUrl > url > qrCodeUrl > activationUrl
        const webActivationUrl = esimOrderData.shortUrl || 
                                 esimOrderData.downloadUrl || 
                                 esimOrderData.url ||
                                 esimOrderData.qrCodeUrl ||
                                 esimOrderData.activationUrl;
        
        // The activationCode contains the LPA string for QR code scanning
        const lpaActivationCode = esimOrderData.activationCode;
        
        console.log('🎯 Selected URLs and Codes:');
        console.log('- Web URL (for browser):', webActivationUrl);
        console.log('- LPA Code (for QR):', lpaActivationCode);
        console.log('- ICCID:', esimOrderData.iccid);
        
        const { error: activationError } = await supabase
          .from('esim_activations')
          .insert({
            order_id: orderResult.id,
            user_id: user.id,
            status: 'pending',
            provisioning_status: 'completed',
            activation_url: webActivationUrl, // Web URL for browser access
            iccid: esimOrderData.iccid,
            activation_code: lpaActivationCode, // LPA string for QR code
            qr_code_data: lpaActivationCode, // QR code should contain LPA string
            provisioning_log: {
              esim_order_id: esimOrderData.id || esimOrderData.orderId,
              created_at: new Date().toISOString(),
              api_response: esimOrderData,
              selected_web_url: webActivationUrl,
              lpa_code: lpaActivationCode,
              url_selection_priority: {
                shortUrl: esimOrderData.shortUrl,
                downloadUrl: esimOrderData.downloadUrl,
                url: esimOrderData.url,
                qrCodeUrl: esimOrderData.qrCodeUrl,
                activationUrl: esimOrderData.activationUrl,
                selected: webActivationUrl
              }
            }
          });

        if (activationError) {
          console.error('Error creating eSIM activation:', activationError);
          // Don't throw here - order was created successfully
        } else {
          console.log('✅ eSIM activation record created successfully');
        }

        // Create QR code with LPA activation code (for device scanning)
        const { error: qrError } = await supabase
          .from('qr_codes')
          .insert({
            order_id: orderResult.id,
            user_id: user.id,
            esim_id: null, // Will be linked later
            activation_url: lpaActivationCode, // QR code contains LPA string
            qr_image_url: esimOrderData.qrCodeUrl,
            status: 'active'
          });

        if (qrError) {
          console.error('Error creating QR code:', qrError);
          // Don't throw here - order was created successfully
        } else {
          console.log('✅ QR code record created successfully');
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
