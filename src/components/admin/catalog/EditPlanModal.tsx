
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { usePlans, type Plan } from "@/hooks/usePlans";
import SupplierInfoSection from "./edit-plan-modal/SupplierInfoSection";
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
}

const PALOP_DEFAULT_COUNTRIES = [
  ...PALOP_CORE_COUNTRIES,
  ...PALOP_REGIONAL_COUNTRIES,
  ...PALOP_DIASPORA_COUNTRIES,
  ...PALOP_CPLP_COUNTRIES,
];

const EditPlanModal = ({ plan, isOpen, onClose }: EditPlanModalProps) => {
  const { updatePlan, isUpdating } = usePlans();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

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

  // Check if plan is PALOP-focused
  const isPalopPlan = (planName: string, planTags: string[]) => {
    const nameIncludesPalop = planName.toLowerCase().includes('palop') || planName.toLowerCase().includes('essential palop');
    const tagsIncludePalop = planTags.some(tag => tag.toLowerCase().includes('palop'));
    return nameIncludesPalop || tagsIncludePalop;
  };

  useEffect(() => {
    if (plan && isOpen) {
      reset({
        name: plan.name,
        retail_price: plan.retail_price,
        description: plan.description || '',
        tags: plan.tags || [],
        coverage: plan.coverage || []
      });
      
      setSelectedTags(plan.tags || []);
      
      // Smart coverage pre-population for PALOP plans
      const existingCoverage = plan.coverage || [];
      const shouldPrePopulate = isPalopPlan(plan.name, plan.tags || []) && existingCoverage.length === 0;
      
      if (shouldPrePopulate) {
        setSelectedCountries(PALOP_DEFAULT_COUNTRIES);
        setValue('coverage', PALOP_DEFAULT_COUNTRIES);
      } else {
        setSelectedCountries(existingCoverage);
      }
    }
  }, [plan, isOpen, reset, setValue]);

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setValue('tags', newTags);

    // Auto-populate coverage when PALOP tag is added
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

  const onSubmit = async (data: EditPlanFormData) => {
    if (!plan) return;

    try {
      const updates = {
        name: data.name,
        retail_price: Number(data.retail_price),
        description: data.description,
        tags: selectedTags,
        coverage: selectedCountries
      };

      updatePlan({ id: plan.id, updates });
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
          {/* Supplier Info (Read-only) */}
          <SupplierInfoSection plan={plan} watchedPrice={watchedPrice} />

          <Separator />

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Plan Name */}
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

            {/* Retail Price */}
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

            {/* Margin Alert Override */}
            <div>
              <Label htmlFor="margin_alert_threshold">Margin Alert Threshold (%) - Optional</Label>
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
