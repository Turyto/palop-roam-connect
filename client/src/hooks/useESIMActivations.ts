
import { useQuery } from '@tanstack/react-query';
import { fetchESIMActivations } from '@/api/esimActivations';
import { useESIMActivationMutations } from '@/hooks/mutations/useESIMActivationMutations';
import type { ESIMActivation } from '@/types/esimActivations';

export type { ESIMActivation };

export const useESIMActivations = () => {
  const { data: activations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-esim-activations'],
    queryFn: fetchESIMActivations,
  });

  const mutations = useESIMActivationMutations();

  return {
    activations,
    isLoading,
    error,
    refetch,
    ...mutations
  };
};
