import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// This hook is now deprecated since we moved to dynamic plan catalog
// Keeping it for backward compatibility but it returns plan-based data

export interface PlanInventoryItem {
  id: string;
  plan_id: string;
  plan_name: string;
  available: number;
  threshold_low: number;
  threshold_critical: number;
  created_at: string;
  updated_at: string;
}

export const usePlanInventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: planInventory = [], isLoading, error, refetch } = useQuery({
    queryKey: ['plan-inventory'],
    queryFn: async () => {
      
      // Return plans data adapted to look like inventory
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        throw error;
      }

      // Transform plans to look like inventory items
      const adaptedData = data.map(plan => ({
        id: plan.id,
        plan_id: plan.id,
        plan_name: plan.name,
        available: 999, // Virtual availability - always available through suppliers
        threshold_low: 100,
        threshold_critical: 25,
        created_at: plan.created_at || new Date().toISOString(),
        updated_at: plan.updated_at || new Date().toISOString()
      }));

      return adaptedData as PlanInventoryItem[];
    },
  });

  const restockPlanMutation = useMutation({
    mutationFn: async ({ planId, amount }: { planId: string; amount: number }) => {
      
      // In dynamic catalog, we don't restock - we just ensure plan is active
      const { data, error } = await supabase
        .from('plans')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plan-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: "Plan Status Updated",
        description: `${data.name} plan is now active and available`,
      });
    },
    onError: (error) => {
      console.error('Plan update error:', error);
      toast({
        title: "Plan Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const adjustPlanInventoryMutation = useMutation({
    mutationFn: async ({ planId, newAmount }: { planId: string; newAmount: number }) => {
      
      // In dynamic catalog, we toggle plan status based on "amount"
      const status = newAmount > 0 ? 'active' : 'inactive';
      
      const { data, error } = await supabase
        .from('plans')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        console.error('Error adjusting plan status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plan-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: "Plan Status Adjusted",
        description: `${data.name} plan is now ${data.status}`,
      });
    },
    onError: (error) => {
      console.error('Plan status adjustment error:', error);
      toast({
        title: "Plan Status Adjustment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusInfo = (available: number, thresholdLow: number, thresholdCritical: number) => {
    // In dynamic catalog, status is always healthy since it's virtual
    return { status: 'healthy', label: 'Available', color: 'bg-green-100 text-green-800' };
  };

  return {
    planInventory,
    isLoading,
    error,
    refetch,
    restockPlan: (planId: string, amount: number) => 
      restockPlanMutation.mutate({ planId, amount }),
    adjustPlanInventory: (planId: string, newAmount: number) =>
      adjustPlanInventoryMutation.mutate({ planId, newAmount }),
    isRestocking: restockPlanMutation.isPending,
    isAdjusting: adjustPlanInventoryMutation.isPending,
    getStatusInfo
  };
};
