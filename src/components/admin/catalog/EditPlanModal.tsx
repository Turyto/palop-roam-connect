
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X, DollarSign, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { usePlans, useSupplierRates, type Plan } from "@/hooks/usePlans";

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

const AVAILABLE_TAGS = [
  "PALOP", "CPLP", "Premium", "Business", "Tourist", "Local", "Regional", "Global"
];

const AVAILABLE_COUNTRIES = [
  "Cape Verde", "Guinea-Bissau", "São Tomé and Príncipe", "Angola", "Mozambique", 
  "Portugal", "Brazil", "Timor-Leste", "Macau", "Equatorial Guinea"
];

const EditPlanModal = ({ plan, isOpen, onClose }: EditPlanModalProps) => {
  const { updatePlan, isUpdating } = usePlans();
  const { supplierRates } = useSupplierRates();
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
      setSelectedCountries(plan.coverage || []);
    }
  }, [plan, isOpen, reset]);

  const planRates = plan ? supplierRates.filter(rate => rate.plan_id === plan.id) : [];
  const lowestCost = planRates.length > 0 
    ? Math.min(...planRates.map(rate => rate.wholesale_cost))
    : 0;
  const currentMargin = watchedPrice && lowestCost > 0 
    ? ((watchedPrice - lowestCost) / watchedPrice) * 100 
    : 0;

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setValue('tags', newTags);
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-sm font-medium text-gray-600 mb-3 block">
              Current Supplier Information (Read-only)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Lowest Wholesale Cost</p>
                  <p className="font-semibold">€{lowestCost.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Synced</p>
                  <p className="font-semibold">
                    {planRates.length > 0 
                      ? new Date(Math.max(...planRates.map(r => new Date(r.last_checked).getTime()))).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
            {planRates.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">Active Suppliers:</p>
                <div className="flex flex-wrap gap-2">
                  {planRates.map((rate, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {rate.supplier_name}: €{rate.wholesale_cost.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

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
              {watchedPrice && lowestCost > 0 && (
                <p className={`text-sm mt-1 ${currentMargin >= 30 ? 'text-green-600' : currentMargin >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                  Current margin: {currentMargin.toFixed(1)}%
                </p>
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
          <div>
            <Label>Plan Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AVAILABLE_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Coverage Countries */}
          <div>
            <Label>Coverage Countries</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AVAILABLE_COUNTRIES.map(country => (
                <Badge
                  key={country}
                  variant={selectedCountries.includes(country) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCountryToggle(country)}
                >
                  {country}
                  {selectedCountries.includes(country) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

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
