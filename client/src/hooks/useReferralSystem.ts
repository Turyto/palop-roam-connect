
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  uses_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  reward_type: 'discount' | 'credit' | 'free_plan';
  reward_amount: number;
  status: 'pending' | 'claimed' | 'expired';
  created_at: string;
  updated_at: string;
}

export const useReferralSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's referral code
  const { data: referralCode, isLoading: codeLoading } = useQuery({
    queryKey: ['referral-code', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching referral code:', error);
        throw error;
      }

      return data as ReferralCode | null;
    },
    enabled: !!user,
  });

  // Fetch user's referral rewards
  const { data: referralRewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['referral-rewards', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral rewards:', error);
        throw error;
      }

      return (data as ReferralReward[]) || [];
    },
    enabled: !!user,
  });

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Generate a unique code based on user email + random string
      const baseCode = user.email?.split('@')[0]?.toUpperCase() || 'USER';
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${baseCode}${randomSuffix}`;

      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: code,
          is_active: true,
          uses_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating referral code:', error);
        throw error;
      }

      return data as ReferralCode;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['referral-code'] });
      toast({
        title: "Referral Code Generated!",
        description: `Your referral code ${data.code} is ready to share.`,
      });
    },
    onError: (error: any) => {
      console.error('Referral code generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate referral code",
        variant: "destructive",
      });
    }
  });

  // Check loyalty status based on order count
  const { data: loyaltyStatus, isLoading: loyaltyLoading } = useQuery({
    queryKey: ['loyalty-status', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching orders for loyalty:', error);
        throw error;
      }

      const orderCount = orders?.length || 0;
      
      // Determine loyalty tier
      let tier = 'Bronze';
      let nextTier = 'Silver';
      let ordersToNext = 3 - orderCount;
      
      if (orderCount >= 10) {
        tier = 'Platinum';
        nextTier = null;
        ordersToNext = 0;
      } else if (orderCount >= 5) {
        tier = 'Gold';
        nextTier = 'Platinum';
        ordersToNext = 10 - orderCount;
      } else if (orderCount >= 3) {
        tier = 'Silver';
        nextTier = 'Gold';
        ordersToNext = 5 - orderCount;
      }

      return {
        orderCount,
        tier,
        nextTier,
        ordersToNext,
        eligibleForReferral: orderCount >= 2
      };
    },
    enabled: !!user,
  });

  return {
    referralCode,
    referralRewards,
    loyaltyStatus,
    codeLoading,
    rewardsLoading,
    loyaltyLoading,
    generateReferralCode: generateCodeMutation.mutate,
    isGenerating: generateCodeMutation.isPending,
  };
};
