
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePlanInventoryUpdate } from './usePlanInventoryUpdate';
import type { UpdateOrderData } from './types';

export const useUpdateOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updatePlanInventory } = usePlanInventoryUpdate();

  const updateOrderMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      paymentStatus, 
      paymentIntentId 
    }: UpdateOrderData) => {
      
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
      
      
      // Manually trigger plan inventory decrease for completed orders
      if (status === 'completed' && data.plan_id) {
        await updatePlanInventory(data.plan_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['plan-inventory'] });
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
    updateOrder: updateOrderMutation.mutate,
    isUpdatingOrder: updateOrderMutation.isPending
  };
};
