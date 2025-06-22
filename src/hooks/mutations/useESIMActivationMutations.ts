
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { retryProvisioningAPI, markAsCompleteAPI, bulkProvisionAPI } from '@/api/esimActivations';

export const useESIMActivationMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const retryProvisioningMutation = useMutation({
    mutationFn: retryProvisioningAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-esim-activations'] });
      // Also refresh inventory in case stock changed
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: "Provisioning Retry Started",
        description: "eSIM provisioning has been queued for retry.",
      });
    },
    onError: (error) => {
      console.error('Provisioning retry error:', error);
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const markAsCompleteMutation = useMutation({
    mutationFn: markAsCompleteAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-esim-activations'] });
      // Refresh inventory since stock should decrease automatically
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: "Marked as Complete",
        description: "eSIM activation completed. Inventory has been automatically adjusted.",
      });
    },
    onError: (error) => {
      console.error('Mark as complete error:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const bulkProvisionMutation = useMutation({
    mutationFn: bulkProvisionAPI,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-esim-activations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast({
        title: "Bulk Provisioning Started",
        description: result.message,
      });
    },
    onError: (error) => {
      console.error('Bulk provisioning error:', error);
      toast({
        title: "Bulk Provisioning Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    retryProvisioning: retryProvisioningMutation.mutate,
    markAsComplete: markAsCompleteMutation.mutate,
    bulkProvision: bulkProvisionMutation.mutate,
    isRetrying: retryProvisioningMutation.isPending,
    isMarkingComplete: markAsCompleteMutation.isPending,
    isBulkProvisioning: bulkProvisionMutation.isPending
  };
};
