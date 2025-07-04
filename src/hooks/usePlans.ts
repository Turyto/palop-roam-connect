
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  coverage: string[];
  status: string;
  retail_price: number;
  created_at: string;
  updated_at: string;
};

export type SupplierRate = {
  id: string;
  supplier_name: string;
  plan_id: string;
  wholesale_cost: number;
  supplier_plan_id: string | null;
  supplier_link: string | null;
  last_checked: string;
  created_at: string;
  updated_at: string;
};

export type PricingRule = {
  id: string;
  global_markup: number;
  margin_alert_threshold: number;
  exceptions: any;
  created_at: string;
  updated_at: string;
};

export const usePlans = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: plans = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Plan[];
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Plan> }) => {
      const { data, error } = await supabase
        .from("plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (newPlan: Omit<Plan, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("plans")
        .insert([newPlan])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    plans,
    isLoading,
    error,
    refetch,
    updatePlan: updatePlanMutation.mutate,
    createPlan: createPlanMutation.mutate,
    isUpdating: updatePlanMutation.isPending,
    isCreating: createPlanMutation.isPending,
  };
};

export const useSupplierRates = () => {
  const { toast } = useToast();

  const {
    data: supplierRates = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["supplier-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_rates")
        .select(`
          *,
          plans (
            name
          )
        `)
        .order("last_checked", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return {
    supplierRates,
    isLoading,
    refetch,
  };
};

export const usePricingRules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: pricingRules,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .single();

      if (error) throw error;
      return data as PricingRule;
    },
  });

  const updatePricingRulesMutation = useMutation({
    mutationFn: async (updates: Partial<PricingRule>) => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .update(updates)
        .eq("id", pricingRules?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast({
        title: "Success",
        description: "Pricing rules updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    pricingRules,
    isLoading,
    refetch,
    updatePricingRules: updatePricingRulesMutation.mutate,
    isUpdating: updatePricingRulesMutation.isPending,
  };
};
