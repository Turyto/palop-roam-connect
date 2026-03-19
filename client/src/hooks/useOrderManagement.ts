import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retryProvisioningMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from('esim_activations')
        .update({
          provisioning_status: 'pending',
          provisioning_log: {
            retry_attempt: true,
            retry_at: new Date().toISOString(),
          },
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
        title: 'Status Reset',
        description: 'Order provisioning status has been reset to pending.',
      });
    },
    onError: (error: any) => {
      console.error('Retry provisioning error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to reset provisioning status',
        variant: 'destructive',
      });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error: esimError } = await supabase
        .from('esim_activations')
        .update({
          status: 'delivered',
          provisioning_status: 'completed',
          activated_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (esimError) throw esimError;

      const { data, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
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
        title: 'Order Completed',
        description: 'Order has been marked as completed.',
      });
    },
    onError: (error: any) => {
      console.error('Mark complete error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to mark order as complete',
        variant: 'destructive',
      });
    },
  });

  return {
    retryProvisioning: retryProvisioningMutation.mutate,
    markComplete: markCompleteMutation.mutate,
    isRetrying: retryProvisioningMutation.isPending,
    isMarkingComplete: markCompleteMutation.isPending,
  };
};
