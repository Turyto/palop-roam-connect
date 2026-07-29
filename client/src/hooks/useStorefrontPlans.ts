import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CoverageTab, PlanCard } from '@/content/plansPageContent';

// Public storefront plans, driven by the plans table (admin panel).
// A plan appears on the store page when it is active AND has a coverage_tab.

export type StorefrontPlanRow = {
  id: string;
  name: string;
  retail_price: number;
  status: string;
  storefront_slug: string | null;
  name_pt: string | null;
  name_en: string | null;
  subtitle_pt: string | null;
  subtitle_en: string | null;
  coverage_label_pt: string | null;
  coverage_label_en: string | null;
  data_gb: number | null;
  validity_days: number | null;
  coverage_tab: string | null;
  country_key: string | null;
  is_popular: boolean;
  is_available: boolean;
  is_hot_deal: boolean;
  sort_order: number;
};

const fmtPrice = (n: number) => `€${Number(n).toFixed(2).replace('.', ',')}`;

const VALID_TABS: CoverageTab[] = ['europe', 'south-africa', 'americas', 'palop'];

export const rowToPlanCard = (row: StorefrontPlanRow): PlanCard => {
  const id = row.storefront_slug || row.id;
  const days = row.validity_days ?? 30;
  return {
    id,
    coverage: (VALID_TABS.includes(row.coverage_tab as CoverageTab)
      ? row.coverage_tab
      : 'europe') as CoverageTab,
    countryKey: (row.country_key as PlanCard['countryKey']) ?? undefined,
    name: { pt: row.name_pt || row.name, en: row.name_en || row.name },
    subtitle: { pt: row.subtitle_pt || '', en: row.subtitle_en || '' },
    data: row.data_gb != null ? `${Number(row.data_gb)} GB` : '',
    validityDays: String(days),
    validity: { pt: `${days} dias`, en: `${days} days` },
    price: fmtPrice(row.retail_price),
    coverageLabel: {
      pt: row.coverage_label_pt || '',
      en: row.coverage_label_en || '',
    },
    popular: row.is_popular,
    available: row.is_available,
    hotDeal: row.is_hot_deal,
    href: `/purchase?plan=${id}`,
  };
};

export const useStorefrontPlans = () => {
  const query = useQuery({
    queryKey: ['storefront-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select(
          'id, name, retail_price, status, storefront_slug, name_pt, name_en, subtitle_pt, subtitle_en, coverage_label_pt, coverage_label_en, data_gb, validity_days, coverage_tab, country_key, is_popular, is_available, is_hot_deal, sort_order'
        )
        .eq('status', 'active')
        .not('coverage_tab', 'is', null)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as StorefrontPlanRow[]).map(rowToPlanCard);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    planCards: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};

// Plans purchasable via /purchase?plan=<id> — retail price as a number.
export type PurchasablePlan = PlanCard & { priceNumber: number };

export const useAvailableStorefrontPlans = () => {
  const query = useQuery({
    queryKey: ['storefront-plans-purchase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select(
          'id, name, retail_price, status, storefront_slug, name_pt, name_en, subtitle_pt, subtitle_en, coverage_label_pt, coverage_label_en, data_gb, validity_days, coverage_tab, country_key, is_popular, is_available, is_hot_deal, sort_order'
        )
        .eq('status', 'active')
        .not('coverage_tab', 'is', null);

      if (error) throw error;
      return (data as StorefrontPlanRow[])
        .filter((row) => row.is_available)
        .map((row): PurchasablePlan => ({
          ...rowToPlanCard(row),
          priceNumber: Number(row.retail_price),
        }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    purchasablePlans: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
