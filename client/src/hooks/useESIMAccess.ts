import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ESIMAccessOrder {
  packageId: string;
  customerEmail: string;
  customerName?: string;
  referenceId?: string;
  planName?: string;
  dataAmount?: string;
}

interface ESIMAccessResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const useESIMAccess = () => {
  const { toast } = useToast();

  const callESIMAccessAPI = async (action: string, data?: any): Promise<ESIMAccessResponse> => {
    try {
      const { data: response, error } = await supabase.functions.invoke('esim-access', {
        body: { action, ...data }
      });

      if (error) {
        console.error('eSIM Access API error:', error);
        throw new Error(error.message || 'API call failed');
      }

      return response;
    } catch (error) {
      console.error('eSIM Access hook error:', error);
      throw error;
    }
  };

  const testConnectionMutation = useMutation({
    mutationFn: () => callESIMAccessAPI('test-connection'),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Connection test successful",
          description: "eSIM Access API is responding correctly",
        });
      } else {
        toast({
          title: "Connection test failed",
          description: response.error || "API connection failed",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Connection test failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getPackagesMutation = useMutation({
    mutationFn: () => callESIMAccessAPI('get-packages'),
    onError: (error: any) => {
      toast({
        title: "Failed to fetch packages",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: ESIMAccessOrder) => callESIMAccessAPI('create-order', orderData),
    onError: (error: any) => {
      toast({
        title: "Failed to create eSIM order",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getOrderMutation = useMutation({
    mutationFn: (orderId: string) => callESIMAccessAPI('get-order', { orderId }),
    onError: (error: any) => {
      toast({
        title: "Failed to get order status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const downloadESIMMutation = useMutation({
    mutationFn: (orderId: string) => callESIMAccessAPI('download-esim', { orderId }),
    onError: (error: any) => {
      toast({
        title: "Failed to download eSIM",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    testConnection: testConnectionMutation.mutate,
    testConnectionAsync: testConnectionMutation.mutateAsync,
    isTestingConnection: testConnectionMutation.isPending,
    
    getPackages: getPackagesMutation.mutate,
    getPackagesAsync: getPackagesMutation.mutateAsync,
    isGettingPackages: getPackagesMutation.isPending,
    
    createOrder: createOrderMutation.mutate,
    createOrderAsync: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
    
    getOrder: getOrderMutation.mutate,
    getOrderAsync: getOrderMutation.mutateAsync,
    isGettingOrder: getOrderMutation.isPending,
    
    downloadESIM: downloadESIMMutation.mutate,
    downloadESIMAsync: downloadESIMMutation.mutateAsync,
    isDownloadingESIM: downloadESIMMutation.isPending,
  };
};
