
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CreatePlanFormData } from "@/hooks/useCreatePlan";

interface PlanBasicInfoFieldsProps {
  register: UseFormRegister<CreatePlanFormData>;
  errors: FieldErrors<CreatePlanFormData>;
  retailPrice: number;
  currentMargin: number;
  getMarginColor: (margin: number) => string;
}

const PlanBasicInfoFields = ({ 
  register, 
  errors, 
  retailPrice, 
  currentMargin, 
  getMarginColor 
}: PlanBasicInfoFieldsProps) => {
  return (
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

      {/* Margin Preview */}
      <div>
        <Label>Projected Margin</Label>
        <div className={`text-2xl font-bold ${getMarginColor(currentMargin)}`}>
          {currentMargin.toFixed(1)}%
        </div>
        <p className="text-sm text-gray-600">
          Based on lowest wholesale cost
        </p>
      </div>

      {/* Description */}
      <div className="col-span-2">
        <Label htmlFor="description">Plan Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter plan description..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default PlanBasicInfoFields;
