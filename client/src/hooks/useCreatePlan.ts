
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

interface CreatePlanFormData {
  name: string;
  retail_price: number;
  description: string;
  tags: string[];
  coverage: string[];
  supplier_rates: SupplierRate[];
}

const isESIMAccessSupplier = (name: string) =>
  name.toLowerCase().replace(/[\s_-]/g, '').includes('esimaccess');

export const useCreatePlan = (onSuccess: () => void) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [supplierRates, setSupplierRates] = useState<SupplierRate[]>([
    { supplier_name: '', wholesale_cost: 0, supplier_plan_id: '', supplier_link: '', esim_access_package_id: '' }
  ]);
  const [isCreating, setIsCreating] = useState(false);

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
      const newPlan = {
        name: data.name,
        retail_price: Number(data.retail_price),
        description: data.description,
        tags: selectedTags,
        coverage: selectedCountries,
        status: 'active' as const
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

      // Upsert esim_packages row for the first eSIM Access supplier that has a package code.
      // esim_packages uses plan_id as the unique key (no supplier column).
      const esimAccessRate = supplierRates.find(
        rate => isESIMAccessSupplier(rate.supplier_name) && rate.esim_access_package_id?.trim()
      );

      if (esimAccessRate) {
        const { error: pkgError } = await supabase
          .from('esim_packages')
          .upsert(
            {
              plan_id: createdPlan.id,
              plan_name: data.name,
              esim_access_package_id: esimAccessRate.esim_access_package_id!.trim(),
            },
            { onConflict: 'plan_id' }
          );

        if (pkgError) {
          console.error('Error creating esim_packages row:', pkgError);
          toast.error("Plan created but failed to save eSIM package code — provisioning will not work until this is fixed.");
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
    isCreating,
    handleClose
  };
};

export type { SupplierRate, CreatePlanFormData };
