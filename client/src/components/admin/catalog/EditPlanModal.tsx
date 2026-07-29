
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { usePlans, useSupplierRates, type Plan } from "@/hooks/usePlans";
import { supabase } from "@/integrations/supabase/client";
import SupplierInfoSection from "./edit-plan-modal/SupplierInfoSection";
import StorefrontFields from "./create-plan-modal/StorefrontFields";
import { buildStorefrontPlanFields, type StorefrontSettings } from "@/hooks/useCreatePlan";
import TagsSection from "./edit-plan-modal/TagsSection";
import CountrySelectionSection, {
  PALOP_CORE_COUNTRIES,
  PALOP_REGIONAL_COUNTRIES,
  PALOP_DIASPORA_COUNTRIES,
  PALOP_CPLP_COUNTRIES
} from "./edit-plan-modal/CountrySelectionSection";

interface EditPlanModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EditPlanFormData {
  name: string;
  retail_price: number;
  description: string;
  tags: string[];
  coverage: string[];
  margin_alert_threshold?: number;
  wholesale_cost?: number;
  supplier_name?: string;
  esim_access_package_id?: string;
}

const PALOP_DEFAULT_COUNTRIES = [
  ...PALOP_CORE_COUNTRIES,
  ...PALOP_REGIONAL_COUNTRIES,
  ...PALOP_DIASPORA_COUNTRIES,
  ...PALOP_CPLP_COUNTRIES,
];

const EditPlanModal = ({ plan, isOpen, onClose }: EditPlanModalProps) => {
  const { updatePlanAsync, isUpdating } = usePlans();
  const { supplierRates, refetch: refetchSupplierRates } = useSupplierRates();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [currentSupplierRate, setCurrentSupplierRate] = useState<any>(null);
  const [storefront, setStorefront] = useState<StorefrontSettings>({
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
    is_available: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<EditPlanFormData>({
    mode: 'onChange'
  });

  const watchedPrice = watch('retail_price');
  const watchedPackageId = watch('esim_access_package_id');

  const isPalopPlan = (planName: string, planTags: string[]) => {
    const nameIncludesPalop = planName.toLowerCase().includes('palop') || planName.toLowerCase().includes('essential palop');
    const tagsIncludePalop = planTags.some(tag => tag.toLowerCase().includes('palop'));
    return nameIncludesPalop || tagsIncludePalop;
  };

  useEffect(() => {
    if (plan && isOpen) {
      const existingRate = supplierRates.find(rate => rate.plan_id === plan.id);
      setCurrentSupplierRate(existingRate);

      // Load existing esim_packages row for this plan
      supabase
        .from('esim_packages')
        .select('esim_access_package_id')
        .eq('plan_id', plan.id)
        .maybeSingle()
        .then(({ data }) => {
          setValue('esim_access_package_id', data?.esim_access_package_id ?? '');
        });

      reset({
        name: plan.name,
        retail_price: plan.retail_price,
        description: plan.description || '',
        tags: plan.tags || [],
        coverage: plan.coverage || [],
        wholesale_cost: existingRate?.wholesale_cost || 0,
        supplier_name: existingRate?.supplier_name || '',
        esim_access_package_id: ''
      });

      setSelectedTags(plan.tags || []);

      // Load current storefront settings into the editable section
      setStorefront({
        coverage_tab: plan.coverage_tab ?? 'none',
        country_key: plan.country_key ?? '',
        data_gb: plan.data_gb != null ? String(plan.data_gb) : '',
        validity_days: plan.validity_days != null ? String(plan.validity_days) : '',
        subtitle_pt: plan.subtitle_pt ?? '',
        subtitle_en: plan.subtitle_en ?? '',
        coverage_line_pt: plan.coverage_label_pt ?? '',
        coverage_line_en: plan.coverage_label_en ?? '',
        is_popular: plan.is_popular ?? false,
        is_hot_deal: plan.is_hot_deal ?? false,
        is_available: plan.is_available ?? true,
      });

      const existingCoverage = plan.coverage || [];
      const shouldPrePopulate = isPalopPlan(plan.name, plan.tags || []) && existingCoverage.length === 0;

      if (shouldPrePopulate) {
        setSelectedCountries(PALOP_DEFAULT_COUNTRIES);
        setValue('coverage', PALOP_DEFAULT_COUNTRIES);
      } else {
        setSelectedCountries(existingCoverage);
      }
    }
  }, [plan, isOpen, reset, setValue, supplierRates]);

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setValue('tags', newTags);

    if (tag === 'PALOP' && !selectedTags.includes(tag) && selectedCountries.length === 0) {
      setSelectedCountries(PALOP_DEFAULT_COUNTRIES);
      setValue('coverage', PALOP_DEFAULT_COUNTRIES);
    }
  };

  const handleCountryToggle = (country: string) => {
    const newCountries = selectedCountries.includes(country)
      ? selectedCountries.filter(c => c !== country)
      : [...selectedCountries, country];
    setSelectedCountries(newCountries);
    setValue('coverage', newCountries);
  };

  const updateSupplierRate = async (planId: string, wholesaleCost: number, supplierName: string) => {
    if (currentSupplierRate) {
      const { error } = await supabase
        .from('supplier_rates')
        .update({
          wholesale_cost: wholesaleCost,
          supplier_name: supplierName || currentSupplierRate.supplier_name,
          last_checked: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSupplierRate.id);
      if (error) throw error;
    } else if (wholesaleCost > 0 && supplierName) {
      const { error } = await supabase
        .from('supplier_rates')
        .insert({
          plan_id: planId,
          wholesale_cost: wholesaleCost,
          supplier_name: supplierName,
          last_checked: new Date().toISOString()
        });
      if (error) throw error;
    }
    await refetchSupplierRates();
  };

  const upsertESIMPackage = async (planId: string, packageId: string, planName: string) => {
    if (!packageId.trim()) return;
    // Checkout resolves packages by the storefront slug, while the admin
    // catalog uses the plan UUID. Write BOTH keys so they can never drift.
    const keys = [planId, ...(plan?.storefront_slug ? [plan.storefront_slug] : [])];
    for (const key of keys) {
      const { error } = await supabase
        .from('esim_packages')
        .upsert(
          { plan_id: key, plan_name: planName, esim_access_package_id: packageId.trim(), supplier: 'esim_access' },
          { onConflict: 'plan_id' }
        );
      if (error) throw error;
    }
  };

  const onSubmit = async (data: EditPlanFormData) => {
    if (!plan) return;

    try {
      // Keep an existing coverage label when the tab/country didn't change,
      // so unrelated edits never silently overwrite a customized label.
      const tabUnchanged =
        storefront.coverage_tab === (plan.coverage_tab ?? 'none') &&
        (storefront.coverage_tab !== 'palop' || storefront.country_key === (plan.country_key ?? ''));
      const storefrontResult = buildStorefrontPlanFields(storefront, {
        preserveLabels: tabUnchanged
          ? { pt: plan.coverage_label_pt, en: plan.coverage_label_en }
          : undefined,
      });
      if (storefrontResult.error) {
        toast.error(storefrontResult.error);
        return;
      }

      const updates = {
        name: data.name,
        retail_price: Number(data.retail_price),
        description: data.description,
        tags: selectedTags,
        coverage: selectedCountries,
        ...storefrontResult.fields,
      };

      await updatePlanAsync({ id: plan.id, updates });

      if (data.wholesale_cost !== undefined && data.wholesale_cost >= 0) {
        await updateSupplierRate(plan.id, data.wholesale_cost, data.supplier_name || 'Manual Entry');
      }

      if (data.esim_access_package_id !== undefined) {
        await upsertESIMPackage(plan.id, data.esim_access_package_id, data.name);
      }

      toast.success("Plan updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update plan. Please try again.");
      console.error('Error updating plan:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setSelectedCountries([]);
    setCurrentSupplierRate(null);
    onClose();
  };

  if (!plan) return null;

  const showPalopInfo = isPalopPlan(plan.name, selectedTags);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Plan: {plan.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Supplier Info (Read-only summary) */}
          <SupplierInfoSection plan={plan} watchedPrice={watchedPrice} />

          <Separator />

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                {...register('name', {
                  required: 'Plan name is required',
                  maxLength: { value: 60, message: 'Plan name must be 60 characters or less' }
                })}
                placeholder="Enter plan name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="retail_price">Retail Price (€) *</Label>
              <Input
                id="retail_price"
                type="number"
                step="0.01"
                min="0"
                {...register('retail_price', {
                  required: 'Retail price is required',
                  min: { value: 0, message: 'Price must be 0 or greater' },
                  valueAsNumber: true
                })}
                placeholder="0.00"
              />
              {errors.retail_price && (
                <p className="text-sm text-red-600 mt-1">{errors.retail_price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="wholesale_cost">Wholesale Cost (€)</Label>
              <Input
                id="wholesale_cost"
                type="number"
                step="0.01"
                min="0"
                {...register('wholesale_cost', {
                  min: { value: 0, message: 'Cost must be 0 or greater' },
                  valueAsNumber: true
                })}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Update supplier wholesale cost</p>
            </div>

            <div>
              <Label htmlFor="supplier_name">Supplier Name</Label>
              <Input
                id="supplier_name"
                {...register('supplier_name')}
                placeholder="e.g., AirHub, eSIM Access"
              />
              <p className="text-xs text-gray-500 mt-1">Supplier providing this plan</p>
            </div>

            <div>
              <Label htmlFor="margin_alert_threshold">Margin Alert Threshold (%) — Optional</Label>
              <Input
                id="margin_alert_threshold"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register('margin_alert_threshold', { valueAsNumber: true })}
                placeholder="20.0"
              />
              <p className="text-xs text-gray-500 mt-1">Override global threshold for this plan</p>
            </div>
          </div>

          {/* eSIM Access Package Code */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <Label htmlFor="esim_access_package_id" className="text-sm font-medium">
                eSIM Access Package Code
              </Label>
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                Required for delivery
              </Badge>
            </div>
            <Input
              id="esim_access_package_id"
              {...register('esim_access_package_id')}
              placeholder="e.g. ESIM_PT_1GB_30D"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              The package code from your eSIM Access dashboard. Without this, customers who pay will not receive an eSIM.
            </p>
            {watchedPackageId === '' && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                ⚠ No package code set — this plan cannot provision eSIMs until one is added
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Plan Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter plan description..."
              rows={3}
            />
          </div>

          {/* Store page settings — tab, card details, availability */}
          <StorefrontFields storefront={storefront} onChange={setStorefront} />

          {/* Tags */}
          <TagsSection
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />

          {/* Coverage Countries */}
          <CountrySelectionSection
            selectedCountries={selectedCountries}
            onCountryToggle={handleCountryToggle}
            showPalopInfo={showPalopInfo}
          />

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isUpdating}
              className="min-w-[100px]"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanModal;
