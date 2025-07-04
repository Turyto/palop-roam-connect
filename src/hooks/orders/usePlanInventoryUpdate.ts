
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePlanInventoryUpdate = () => {
  const queryClient = useQueryClient();

  const updatePlanInventory = async (planId: string) => {
    console.log('Plan inventory update called for plan:', planId);
    
    // Since we moved to dynamic plan catalog, we don't need to decrease inventory
    // This is now handled by the supplier integration when orders are placed
    // We just need to invalidate relevant queries to refresh the UI
    
    console.log('Plan catalog uses dynamic provisioning - no inventory decrease needed');
    
    // Invalidate plan-related queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['plans'] });
    queryClient.invalidateQueries({ queryKey: ['supplier-rates'] });
  };

  return { updatePlanInventory };
};
