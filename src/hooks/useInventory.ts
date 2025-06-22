
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  country: string;
  carrier: string;
  available: number;
  threshold_low: number;
  threshold_critical: number;
  created_at: string;
  updated_at: string;
}

export const useInventory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      console.log('Fetching inventory data...');
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('country', { ascending: true });

      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }

      console.log('Inventory data:', data);
      return data as InventoryItem[];
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ inventoryId, amount }: { inventoryId: string; amount: number }) => {
      console.log('Restocking inventory:', inventoryId, 'amount:', amount);
      
      const { data, error } = await supabase
        .from('inventory')
        .update({ 
          available: supabase.sql`available + ${amount}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId)
        .select()
        .single();

      if (error) {
        console.error('Error restocking inventory:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: "Inventory Restocked",
        description: `${variables.amount} eSIMs added to ${data.country} / ${data.carrier}`,
      });
    },
    onError: (error) => {
      console.error('Restock error:', error);
      toast({
        title: "Restock Failed",
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
    inventory,
    isLoading,
    error,
    refetch,
    restock: restockMutation.mutate,
    isRestocking: restockMutation.isPending,
    getStatusInfo
  };
};
