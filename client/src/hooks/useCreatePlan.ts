
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SupplierRate {
  supplier_name: string;
  wholesale_cost: number;
  supplier_plan_id?: string;
  supplier_link?: string;
  esim_access_package_id?: string;
}

interface StorefrontSettings {
  coverage_tab: string; // 'none' | 'europe' | 'south-africa' | 'americas' | 'palop'
  country_key: string;  // '' or a PALOP country key
  data_gb: string;
  validity_days: string;
  subtitle_pt: string;
  subtitle_en: string;
  // Americas is a multi-country tab, so the card coverage line is typed in
  coverage_line_pt: string;
  coverage_line_en: string;
  is_popular: boolean;
  is_hot_deal: boolean;
}

const DEFAULT_STOREFRONT: StorefrontSettings = {
  coverage_tab: 'none',
  country_key: '',
  data_gb: '',
  validity_days: '',
  subtitle_pt: '',
  subtitle_en: '',
  coverage_line_pt: '',
  coverage_line_en: '',
  is_popular: false,
  is_hot_deal: false,
};

// Coverage line shown on the store card, derived from the tab / PALOP country.
const COVERAGE_LABELS: Record<string, { pt: string; en: string }> = {
  'europe': { pt: 'Portugal + Europa', en: 'Portugal + Europe' },
  'south-africa': { pt: 'África do Sul', en: 'South Africa' },
  'mozambique': { pt: 'Moçambique', en: 'Mozambique' },
  'cabo-verde': { pt: 'Cabo Verde', en: 'Cabo Verde' },
  'guinea-bissau': { pt: 'Guiné-Bissau', en: 'Guinea-Bissau' },
  'angola': { pt: 'Angola', en: 'Angola' },
};

interface CreatePlanFormData {
  name: string;
  retail_price: number;
  description: string;
  tags: string[];
  coverage: string[];
  supplier_rates: SupplierRate[];
}

const normaliseSupplier = (name: string) => name.toLowerCase().replace(/[\s_-]/g, '');
const isESIMAccessSupplier = (name: string) => normaliseSupplier(name).includes('esimaccess');
const isESIMCardSupplier = (name: string) => normaliseSupplier(name).includes('esimcard');

export const useCreatePlan = (onSuccess: () => void) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [supplierRates, setSupplierRates] = useState<SupplierRate[]>([
    { supplier_name: '', wholesale_cost: 0, supplier_plan_id: '', supplier_link: '', esim_access_package_id: '' }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [storefront, setStorefront] = useState<StorefrontSettings>(DEFAULT_STOREFRONT);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<CreatePlanFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      retail_price: 0,
      description: '',
      tags: [],
      coverage: [],
      supplier_rates: supplierRates
    }
  });

  const retailPrice = watch('retail_price');

  const onSubmit = async (data: CreatePlanFormData) => {
    setIsCreating(true);
    try {
      const onStore = storefront.coverage_tab !== 'none';
      if (onStore) {
        if (!storefront.data_gb || Number(storefront.data_gb) <= 0 || !storefront.validity_days || Number(storefront.validity_days) <= 0) {
          toast.error('To show the plan on the store page, fill in Data (GB) and Validity (days).');
          setIsCreating(false);
          return;
        }
        if (storefront.coverage_tab === 'palop' && !storefront.country_key) {
          toast.error('PALOP plans need a country so they appear under the right flag.');
          setIsCreating(false);
          return;
        }
        if (storefront.coverage_tab === 'americas' && (!storefront.coverage_line_pt.trim() || !storefront.coverage_line_en.trim())) {
          toast.error('Americas plans need the coverage line (PT and EN) so customers know which country the plan covers.');
          setIsCreating(false);
          return;
        }
      }

      const coverageLabel = !onStore
        ? null
        : storefront.coverage_tab === 'americas'
        ? { pt: storefront.coverage_line_pt.trim(), en: storefront.coverage_line_en.trim() }
        : COVERAGE_LABELS[storefront.coverage_tab === 'palop' ? storefront.country_key : storefront.coverage_tab] ?? null;

      const newPlan = {
        name: data.name,
        retail_price: Number(data.retail_price),
        description: data.description,
        tags: selectedTags,
        coverage: selectedCountries,
        status: 'active' as const,
        // Storefront fields — coverage_tab null keeps the plan off the store page
        coverage_tab: onStore ? storefront.coverage_tab : null,
        country_key: onStore && storefront.coverage_tab === 'palop' ? storefront.country_key : null,
        data_gb: onStore ? Number(storefront.data_gb) : null,
        validity_days: onStore ? Number(storefront.validity_days) : null,
        subtitle_pt: onStore ? storefront.subtitle_pt.trim() || null : null,
        subtitle_en: onStore ? storefront.subtitle_en.trim() || null : null,
        coverage_label_pt: coverageLabel?.pt ?? null,
        coverage_label_en: coverageLabel?.en ?? null,
        is_popular: onStore ? storefront.is_popular : false,
        is_hot_deal: onStore ? storefront.is_hot_deal : false,
        sort_order: 999, // new plans appear after the curated ones
      };

      const { data: createdPlan, error: planError } = await supabase
        .from('plans')
        .insert([newPlan])
        .select()
        .single();

      if (planError) throw planError;

      const validSupplierRates = supplierRates
        .filter(rate => rate.supplier_name.trim() && rate.wholesale_cost > 0)
        .map(rate => ({
          plan_id: createdPlan.id,
          supplier_name: rate.supplier_name.trim(),
          wholesale_cost: Number(rate.wholesale_cost),
          supplier_plan_id: rate.supplier_plan_id?.trim() || null,
          supplier_link: rate.supplier_link?.trim() || null,
        }));

      if (validSupplierRates.length > 0) {
        const { error: ratesError } = await supabase
          .from('supplier_rates')
          .insert(validSupplierRates);

        if (ratesError) {
          console.error('Error creating supplier rates:', ratesError);
          toast.error("Plan created but failed to add supplier rates");
        }
      }

      // Upsert esim_packages rows so provisioning can find the supplier package.
      // esim_packages is keyed on (plan_id, supplier). eSIM Access rows store the
      // code in esim_access_package_id; eSIM Card rows store it in supplier_package_id.
      const packageRows = supplierRates
        .filter(rate => rate.esim_access_package_id?.trim())
        .map(rate => {
          const code = rate.esim_access_package_id!.trim();
          if (isESIMCardSupplier(rate.supplier_name)) {
            return {
              plan_id: createdPlan.id,
              plan_name: data.name,
              supplier: 'esimcard',
              supplier_package_id: code,
            };
          }
          if (isESIMAccessSupplier(rate.supplier_name)) {
            return {
              plan_id: createdPlan.id,
              plan_name: data.name,
              supplier: 'esim_access',
              esim_access_package_id: code,
            };
          }
          return null;
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (packageRows.length > 0) {
        const { error: pkgError } = await supabase
          .from('esim_packages')
          .upsert(packageRows, { onConflict: 'plan_id,supplier' });

        if (pkgError) {
          console.error('Error creating esim_packages row:', pkgError);
          toast.error("Plan created but failed to save the supplier package code — provisioning will not work until this is fixed.");
        }
      }

      toast.success("Plan created successfully!");
      handleClose();
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create plan. Please try again.");
      console.error('Error creating plan:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setSelectedCountries([]);
    setSupplierRates([{ supplier_name: '', wholesale_cost: 0, supplier_plan_id: '', supplier_link: '', esim_access_package_id: '' }]);
    setStorefront(DEFAULT_STOREFRONT);
    onSuccess();
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isValid,
    setValue,
    retailPrice,
    selectedTags,
    setSelectedTags,
    selectedCountries,
    setSelectedCountries,
    supplierRates,
    setSupplierRates,
    storefront,
    setStorefront,
    isCreating,
    handleClose
  };
};

export type { SupplierRate, CreatePlanFormData, StorefrontSettings };
