import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupplierItemStatus = 'available' | 'active' | 'expired_used' | 'expired_unused' | 'disabled';

export interface SupplierInventoryItem {
  id: string;
  supplier_name: string;
  supplier_item_id: string;
  order_no: string | null;
  supplier_package_code: string | null;
  package_name: string | null;
  iccid: string | null;
  lpa_code: string | null;
  esim_status: string | null;
  smdp_status: string | null;
  status: SupplierItemStatus;
  is_sellable: boolean;
  matched_plan_id: string | null;
  matched_plan_name: string | null;
  total_bytes: number | null;
  remaining_bytes: number | null;
  usage_bytes: number | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at_supplier: string | null;
  raw_payload: Record<string, any>;
  sync_id: string | null;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierInventorySync {
  id: string;
  supplier_name: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'completed' | 'failed';
  items_fetched: number | null;
  error_message: string | null;
  created_at: string;
}

export interface SupplierInventoryFilters {
  supplier?: string;
  status?: SupplierItemStatus | 'all';
  matched?: 'all' | 'matched' | 'unmatched';
  search?: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useSupplierInventory = (filters: SupplierInventoryFilters = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // All items query (no filters — for summary counts)
  const { data: allItems = [], isLoading: isLoadingAll } = useQuery<SupplierInventoryItem[]>({
    queryKey: ['supplier-inventory-items-all'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('supplier_inventory_items')
        .select('*')
        .order('last_synced_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Filtered items query
  const { data: filteredItems = [], isLoading: isLoadingFiltered, refetch } = useQuery<SupplierInventoryItem[]>({
    queryKey: ['supplier-inventory-items', filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from('supplier_inventory_items')
        .select('*')
        .order('last_synced_at', { ascending: false });

      if (filters.supplier && filters.supplier !== 'all') {
        query = query.eq('supplier_name', filters.supplier);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.matched === 'matched') {
        query = query.not('matched_plan_id', 'is', null);
      } else if (filters.matched === 'unmatched') {
        query = query.is('matched_plan_id', null);
      }
      if (filters.search) {
        query = query.or(
          `iccid.ilike.%${filters.search}%,supplier_package_code.ilike.%${filters.search}%,package_name.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  // Latest sync runs
  const { data: syncRuns = [], isLoading: isLoadingSyncs } = useQuery<SupplierInventorySync[]>({
    queryKey: ['supplier-inventory-syncs'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('supplier_inventory_syncs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Trigger a manual sync
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      console.log('[sync-hook] session token present=', !!token, 'prefix=', token?.slice(0, 30));

      // Direct fetch bypasses Supabase JS function client (avoids SDK header issues)
      const FUNCTION_URL = 'https://btallyhejhqfpqwaboee.supabase.co/functions/v1/sync-supplier-inventory';
      const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0YWxseWhlamhxZnBxd2Fib2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2Nzc4MjksImV4cCI6MjA4OTI1MzgyOX0.CB7TXgFgRx_CdaUmegCUl9woUFjk7x05CCYs4VNtL5Y';

      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token ?? ANON_KEY}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const responseText = await res.text();
      console.log('[sync-hook] status=', res.status, 'body=', responseText.slice(0, 300));

      let data: any;
      try { data = JSON.parse(responseText); } catch { data = { error: responseText }; }

      if (!res.ok) {
        const reason = data?.error
          ? `${data.error}${data.detail ? ` (${data.detail})` : ''}`
          : `HTTP ${res.status}`;
        throw new Error(reason);
      }
      if (!data?.success) throw new Error(data?.error ?? 'Sync returned failure');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-inventory-items-all'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-inventory-syncs'] });
      toast({
        title: 'Sync complete',
        description: `${data.itemsFetched ?? 0} eSIMs fetched from eSIM Access`,
      });
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-inventory-syncs'] });
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Derived summary counts from allItems
  const summary = {
    total:          allItems.length,
    available:      allItems.filter(i => i.status === 'available').length,
    active:         allItems.filter(i => i.status === 'active').length,
    expired_used:   allItems.filter(i => i.status === 'expired_used').length,
    expired_unused: allItems.filter(i => i.status === 'expired_unused').length,
    disabled:       allItems.filter(i => i.status === 'disabled').length,
    unmatched:      allItems.filter(i => !i.matched_plan_id).length,
  };

  const latestSync: SupplierInventorySync | null = syncRuns[0] ?? null;

  // Warn if available eSIMs expire within 7 days
  const now = Date.now();
  const expiringAvailable = allItems.filter(i => {
    if (i.status !== 'available' || !i.expires_at) return false;
    const msLeft = new Date(i.expires_at).getTime() - now;
    return msLeft > 0 && msLeft < 7 * 24 * 60 * 60 * 1000;
  });

  return {
    items: filteredItems,
    allItems,
    summary,
    syncRuns,
    latestSync,
    expiringAvailable,
    isLoading: isLoadingAll || isLoadingFiltered || isLoadingSyncs,
    refetch,
    triggerSync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
};
