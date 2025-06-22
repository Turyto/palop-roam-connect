
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Processing order:', orderId);
      
      // Get order details first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Check inventory availability
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('available')
        .eq('country', 'Cape Verde') // Default mapping
        .eq('carrier', 'CVMóvel')
        .single();

      if (inventoryError) throw inventoryError;
      if (inventory.available < 1) {
        throw new Error('Insufficient inventory available');
      }

      // Generate activation URL
      const activationUrl = `https://esim.activate/${orderId}`;

      // Create QR code entry
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .insert({
          order_id: orderId,
          user_id: order.user_id,
          activation_url: activationUrl,
          qr_image_url: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`, // Placeholder
          status: 'active'
        })
        .select()
        .single();

      if (qrError) throw qrError;

      // Create eSIM activation entry
      const { data: esimActivation, error: esimError } = await supabase
        .from('esim_activations')
        .insert({
          order_id: orderId,
          user_id: order.user_id,
          status: 'pending',
          provisioning_status: 'pending',
          activation_url: activationUrl
        })
        .select()
        .single();

      if (esimError) throw esimError;

      // Deduct inventory
      const { error: inventoryUpdateError } = await supabase
        .from('inventory')
        .update({ 
          available: inventory.available - 1,
          updated_at: new Date().toISOString()
        })
        .eq('country', 'Cape Verde')
        .eq('carrier', 'CVMóvel');

      if (inventoryUpdateError) throw inventoryUpdateError;

      // Update order status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'in_progress',
          payment_status: 'confirmed',
          esim_delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      return { order: updatedOrder, qrCode, esimActivation };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Order Processed",
        description: "Order has been successfully processed and eSIM provisioning initiated.",
      });
    },
    onError: (error: any) => {
      console.error('Order processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process order",
        variant: "destructive",
      });
    }
  });

  const retryProvisioningMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Retrying provisioning for order:', orderId);
      
      const { data, error } = await supabase
        .from('esim_activations')
        .update({
          provisioning_status: 'in_progress',
          provisioning_log: {
            retry_attempt: true,
            retry_at: new Date().toISOString()
          }
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Provisioning Retried",
        description: "eSIM provisioning has been retried.",
      });
    },
    onError: (error: any) => {
      console.error('Retry provisioning error:', error);
      toast({
        title: "Retry Failed",
        description: error.message || "Failed to retry provisioning",
        variant: "destructive",
      });
    }
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Marking order as complete:', orderId);
      
      // Update eSIM activation
      const { error: esimError } = await supabase
        .from('esim_activations')
        .update({
          status: 'active',
          provisioning_status: 'completed',
          activated_at: new Date().toISOString(),
          delivered_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (esimError) throw esimError;

      // Update order
      const { data, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          esim_delivered_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Order Completed",
        description: "Order has been marked as completed.",
      });
    },
    onError: (error: any) => {
      console.error('Mark complete error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to mark order as complete",
        variant: "destructive",
      });
    }
  });

  const checkInventoryAvailability = async (country = 'Cape Verde', carrier = 'CVMóvel') => {
    const { data, error } = await supabase
      .from('inventory')
      .select('available')
      .eq('country', country)
      .eq('carrier', carrier)
      .single();

    if (error) {
      console.error('Error checking inventory:', error);
      return false;
    }

    return data.available > 0;
  };

  return {
    processOrder: processOrderMutation.mutate,
    retryProvisioning: retryProvisioningMutation.mutate,
    markComplete: markCompleteMutation.mutate,
    checkInventoryAvailability,
    isProcessing: processOrderMutation.isPending,
    isRetrying: retryProvisioningMutation.isPending,
    isMarkingComplete: markCompleteMutation.isPending
  };
};
