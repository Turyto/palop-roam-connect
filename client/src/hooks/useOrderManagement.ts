
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

      // Since we moved to dynamic catalog, we don't need to check physical inventory
      // Instead, we'll provision directly from our supplier network
      console.log('Using dynamic catalog - no inventory check needed');

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

      // Create eSIM activation entry - using correct status values from database
      const { data: esimActivation, error: esimError } = await supabase
        .from('esim_activations')
        .insert({
          order_id: orderId,
          user_id: order.user_id,
          status: 'pending', // This matches the database constraint
          provisioning_status: 'pending',
          activation_url: activationUrl
        })
        .select()
        .single();

      if (esimError) throw esimError;

      // Update order status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'pending', // Keep as pending until fully processed
          payment_status: 'succeeded',
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
      queryClient.invalidateQueries({ queryKey: ['plans'] });
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
          provisioning_status: 'pending', // Reset to pending for retry
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
      
      // Update eSIM activation to completed - using valid status values
      const { error: esimError } = await supabase
        .from('esim_activations')
        .update({
          status: 'delivered', // Using 'delivered' instead of 'active'
          provisioning_status: 'completed',
          activated_at: new Date().toISOString(),
          delivered_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (esimError) throw esimError;

      // Update order to completed
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

  const checkInventoryAvailability = async (planId?: string) => {
    // In the new dynamic catalog system, availability is determined by active plans
    // and supplier network connectivity rather than physical inventory
    if (!planId) return true;

    const { data, error } = await supabase
      .from('plans')
      .select('status')
      .eq('id', planId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error checking plan availability:', error);
      return false;
    }

    return data?.status === 'active';
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
