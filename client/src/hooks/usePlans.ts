
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
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
  storefront_slug: string | null;
  coverage_tab: string | null;
  is_hot_deal: boolean;
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
    // Optimistic update: flip the row in the cache immediately, roll back on error.
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["plans"] });
      const previous = queryClient.getQueryData<Plan[]>(["plans"]);
      queryClient.setQueryData<Plan[]>(["plans"], (old = []) =>
        old.map(p => (p.id === id ? { ...p, ...updates } : p))
      );
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["plans"], context.previous);
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from("plans")
        .update({ status })
        .in("id", ids);
      if (error) throw error;
    },
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: ["plans"] });
      const previous = queryClient.getQueryData<Plan[]>(["plans"]);
      const idSet = new Set(ids);
      queryClient.setQueryData<Plan[]>(["plans"], (old = []) =>
        old.map(p => (idSet.has(p.id) ? { ...p, status } : p))
      );
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["plans"], context.previous);
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (_data, { ids, status }) => {
      toast({
        title: "Success",
        description: `${ids.length} plan${ids.length !== 1 ? "s" : ""} ${status === "active" ? "activated" : "deactivated"}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
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

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      // Orders store the storefront slug in plan_id, not the plan UUID, so
      // the safety check must cover both keys.
      const plan = plans.find(p => p.id === id);
      const keys = [id, ...(plan?.storefront_slug ? [plan.storefront_slug] : [])];

      const { count, error: countError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('plan_id', keys);

      if (countError) throw countError;

      if (count && count > 0) {
        const err: any = new Error(
          `This plan has ${count} order${count === 1 ? '' : 's'} and cannot be permanently deleted.`
        );
        err.code = 'HAS_ORDERS';
        err.orderCount = count;
        throw err;
      }

      // Cascade: remove provisioning mappings (both UUID and slug keys),
      // supplier rates, then the plan
      const { error: pkgError } = await supabase.from('esim_packages').delete().in('plan_id', keys);
      if (pkgError) throw pkgError;
      const { error: rateError } = await supabase.from('supplier_rates').delete().in('plan_id', keys);
      if (rateError) throw rateError;

      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-rates'] });
    },
    onError: (error: any) => {
      if (error.code !== 'HAS_ORDERS') {
        toast({
          title: 'Delete failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  return {
    plans,
    isLoading,
    error,
    refetch,
    updatePlan: updatePlanMutation.mutate,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutate,
    createPlan: createPlanMutation.mutate,
    deletePlan: deletePlanMutation.mutateAsync,
    isUpdating: updatePlanMutation.isPending,
    isCreating: createPlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  };
};

export const useSupplierRates = () => {
  const queryClient = useQueryClient();

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

  const acceptRateMutation = useMutation({
    mutationFn: async ({ planId, livePrice, supplierName }: { planId: string; livePrice: number; supplierName: string }) => {
      const now = new Date().toISOString();
      const existing = supplierRates.find(r => r.plan_id === planId);
      if (existing) {
        const { error } = await supabase
          .from('supplier_rates')
          .update({ wholesale_cost: livePrice, supplier_name: supplierName, last_checked: now, updated_at: now })
          .eq('plan_id', planId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('supplier_rates')
          .insert({ plan_id: planId, wholesale_cost: livePrice, supplier_name: supplierName, last_checked: now });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-rates'] });
    },
  });

  return {
    supplierRates,
    isLoading,
    refetch,
    acceptRate: acceptRateMutation.mutateAsync,
    isAccepting: acceptRateMutation.isPending,
  };
};

// ---------------------------------------------------------------------------
// Live supplier rates — fetches real-time prices from eSIM Access API
// ---------------------------------------------------------------------------
export type LiveRate = {
  plan_id: string;
  plan_name: string;
  package_code: string | null;
  supplier?: 'esim_access' | 'esimcard';
  live_price: number | null;
  live_currency: string | null;
  live_price_found: boolean;
};

export type ComparisonRow = {
  plan_id: string;
  plan_name: string;
  package_code: string | null;
  supplier?: 'esim_access' | 'esimcard';
  stored_cost: number | null;
  live_price: number | null;
  live_currency: string | null;
  delta: number | null;
  status: 'up' | 'down' | 'same' | 'no_data' | 'no_package';
};

export const useLiveSupplierRates = () => {
  const [liveRates, setLiveRates] = useState<LiveRate[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [usdToEur, setUsdToEur] = useState<number | null>(null);
  const [usdToEurFetchedAt, setUsdToEurFetchedAt] = useState<string | null>(null);

  const fetchLive = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      // Ensure session is fresh before calling the edge function
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error(`Session error: ${sessionError.message}`);
      if (!sessionData.session) throw new Error('Not authenticated — please log out and log back in');

      const { data, error } = await supabase.functions.invoke('fetch-supplier-rates');
      if (error) {
        const detail = (error as any)?.context?.error ?? (error as any)?.message ?? String(error);
        throw new Error(`Edge function error: ${detail}`);
      }
      if (!data?.success) throw new Error(data?.error ?? 'Unknown error from edge function');
      setLiveRates(data.rates ?? []);
      setUsdToEur(typeof data.usd_to_eur === 'number' ? data.usd_to_eur : null);
      setUsdToEurFetchedAt(data.usd_to_eur_fetched_at ?? null);
      setLastFetched(new Date());
    } catch (e: any) {
      console.error('[useLiveSupplierRates]', e);
      setFetchError(e.message ?? 'Failed to fetch live rates');
    } finally {
      setIsFetching(false);
    }
  }, []);

  return { liveRates, isFetching, lastFetched, fetchError, fetchLive, usdToEur, usdToEurFetchedAt };
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
