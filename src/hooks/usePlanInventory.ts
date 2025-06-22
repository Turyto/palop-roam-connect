
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      console.log('Fetching plan inventory data...');
      
      const { data, error } = await supabase
        .from('plan_inventory')
        .select('*')
        .order('plan_id', { ascending: true });

      if (error) {
        console.error('Error fetching plan inventory:', error);
        throw error;
      }

      console.log('Plan inventory data:', data);
      return data as PlanInventoryItem[];
    },
  });

  const restockPlanMutation = useMutation({
    mutationFn: async ({ planId, amount }: { planId: string; amount: number }) => {
      console.log('Restocking plan inventory:', planId, 'amount:', amount);
      
      // First get the current available amount
      const { data: currentData, error: fetchError } = await supabase
        .from('plan_inventory')
        .select('available')
        .eq('plan_id', planId)
        .single();

      if (fetchError) {
        console.error('Error fetching current plan inventory:', fetchError);
        throw fetchError;
      }

      // Update with the new amount
      const newAvailable = currentData.available + amount;
      
      const { data, error } = await supabase
        .from('plan_inventory')
        .update({ 
          available: newAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', planId)
        .select()
        .single();

      if (error) {
        console.error('Error restocking plan inventory:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan-inventory'] });
      toast({
        title: "Plan Inventory Restocked",
        description: `${variables.amount} ${data.plan_name} plans added to inventory`,
      });
    },
    onError: (error) => {
      console.error('Plan restock error:', error);
      toast({
        title: "Plan Restock Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Manual inventory adjustment for troubleshooting
  const adjustPlanInventoryMutation = useMutation({
    mutationFn: async ({ planId, newAmount }: { planId: string; newAmount: number }) => {
      console.log('Manually adjusting plan inventory:', planId, 'to:', newAmount);
      
      const { data, error } = await supabase
        .from('plan_inventory')
        .update({ 
          available: Math.max(newAmount, 0), // Ensure non-negative
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', planId)
        .select()
        .single();

      if (error) {
        console.error('Error adjusting plan inventory:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plan-inventory'] });
      toast({
        title: "Plan Inventory Adjusted",
        description: `${data.plan_name} plan inventory updated to ${data.available}`,
      });
    },
    onError: (error) => {
      console.error('Plan inventory adjustment error:', error);
      toast({
        title: "Plan Inventory Adjustment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusInfo = (available: number, thresholdLow: number, thresholdCritical: number) => {
    if (available <= thresholdCritical) {
      return { status: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' };
    }
    if (available <= thresholdLow) {
      return { status: 'low', label: 'Low', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { status: 'healthy', label: 'Healthy', color: 'bg-green-100 text-green-800' };
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
