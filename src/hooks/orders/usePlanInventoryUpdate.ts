
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePlanInventoryUpdate = () => {
  const queryClient = useQueryClient();

  const updatePlanInventory = async (planId: string) => {
    console.log('Manually decreasing plan inventory for plan:', planId);
    
    // First get current inventory
    const { data: currentInventory, error: fetchError } = await supabase
      .from('plan_inventory')
      .select('available')
      .eq('plan_id', planId)
      .single();

    if (fetchError) {
      console.error('Error fetching current plan inventory:', fetchError);
    } else {
      // Update with decreased amount
      const newAvailable = Math.max(currentInventory.available - 1, 0);
      
      const { error: inventoryError } = await supabase
        .from('plan_inventory')
        .update({ 
          available: newAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', planId);

      if (inventoryError) {
        console.error('Error updating plan inventory:', inventoryError);
        // Don't throw here to avoid blocking order completion
      } else {
        console.log('Plan inventory updated successfully');
        // Invalidate plan inventory queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['plan-inventory'] });
      }
    }
  };

  return { updatePlanInventory };
};
