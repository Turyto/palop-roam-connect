
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export interface TopUpOption {
  id: string;
  type: 'data' | 'validity' | 'both';
  name: string;
  description: string;
  data_amount?: string;
  validity_days?: number;
  price: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
}

export interface TopUpOrder {
  id: string;
  parent_order_id: string;
  user_id: string;
  topup_type: 'data' | 'validity' | 'both';
  data_amount?: string;
  validity_days?: number;
  price: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  applied_at?: string;
}

export const useTopUpOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available top-up options
  const { data: topUpOptions = [], isLoading: optionsLoading } = useQuery({
    queryKey: ['topup-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topup_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching top-up options:', error);
        throw error;
      }

      return data as TopUpOption[];
    },
  });

  // Fetch user's top-up orders
  const { data: topUpOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['topup-orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('topup_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching top-up orders:', error);
        throw error;
      }

      return data as TopUpOrder[];
    },
    enabled: !!user,
  });

  // Create top-up order mutation
  const createTopUpOrderMutation = useMutation({
    mutationFn: async ({
      parentOrderId,
      optionId
    }: {
      parentOrderId: string;
      optionId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get the selected option
      const option = topUpOptions.find(opt => opt.id === optionId);
      if (!option) throw new Error('Top-up option not found');

      const topUpData = {
        parent_order_id: parentOrderId,
        user_id: user.id,
        topup_type: option.type,
        data_amount: option.data_amount,
        validity_days: option.validity_days,
        price: option.price,
        currency: option.currency,
      };

      const { data, error } = await supabase
        .from('topup_orders')
        .insert(topUpData)
        .select()
        .single();

      if (error) {
        console.error('Error creating top-up order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['topup-orders'] });
      toast({
        title: "Top-Up Order Created!",
        description: `Your ${data.topup_type} top-up has been ordered. Processing payment...`,
      });

      // Simulate payment processing (in real implementation, integrate with payment provider)
      setTimeout(() => {
        updateTopUpOrderMutation.mutate({
          topUpOrderId: data.id,
          status: 'completed',
          paymentStatus: 'succeeded'
        });
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Top-up order creation failed:', error);
      toast({
        title: "Top-Up Order Failed",
        description: error.message || "Failed to create top-up order",
        variant: "destructive",
      });
    }
  });

  // Update top-up order mutation
  const updateTopUpOrderMutation = useMutation({
    mutationFn: async ({
      topUpOrderId,
      status,
      paymentStatus
    }: {
      topUpOrderId: string;
      status?: string;
      paymentStatus?: string;
    }) => {
      const updateData: any = {};
      
      if (status) updateData.status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.applied_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('topup_orders')
        .update(updateData)
        .eq('id', topUpOrderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating top-up order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topup-orders'] });
      toast({
        title: "Top-Up Applied Successfully!",
        description: "Your eSIM has been recharged and is ready to use.",
      });
    },
    onError: (error: any) => {
      console.error('Top-up order update failed:', error);
      toast({
        title: "Top-Up Update Failed",
        description: error.message || "Failed to update top-up order",
        variant: "destructive",
      });
    }
  });

  return {
    topUpOptions,
    topUpOrders,
    optionsLoading,
    ordersLoading,
    createTopUpOrder: createTopUpOrderMutation.mutate,
    isCreatingTopUp: createTopUpOrderMutation.isPending,
  };
};
