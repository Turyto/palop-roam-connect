import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// This hook is now deprecated since we moved to dynamic plan catalog
// Keeping it for backward compatibility but it returns empty data

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

  // Return empty data since we moved to dynamic catalog
  const { data: inventory = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      console.log('Legacy inventory hook called - returning empty data');
      console.log('Use usePlans hook for dynamic catalog management');
      return [] as InventoryItem[];
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ inventoryId, amount }: { inventoryId: string; amount: number }) => {
      console.log('Legacy restock called - no action needed for dynamic catalog');
      return null;
    },
    onSuccess: () => {
      toast({
        title: "Notice",
        description: "This feature is deprecated. Use the dynamic plan catalog instead.",
      });
    },
    onError: () => {
      toast({
        title: "Notice",
        description: "This feature is deprecated. Use the dynamic plan catalog instead.",
        variant: "destructive",
      });
    }
  });

  const getStatusInfo = (available: number, thresholdLow: number, thresholdCritical: number) => {
    return { status: 'healthy', label: 'Healthy', color: 'bg-green-100 text-green-800' };
  };

  return {
    inventory,
    isLoading: false,
    error: null,
    refetch,
    restock: (inventoryId: string, amount: number) => 
      restockMutation.mutate({ inventoryId, amount }),
    isRestocking: restockMutation.isPending,
    getStatusInfo
  };
};
