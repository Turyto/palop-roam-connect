
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCreatePlan } from "@/hooks/useCreatePlan";
import { useCreatePlanLogic } from "./create-plan-modal/CreatePlanFormLogic";
import TagsSection from "./edit-plan-modal/TagsSection";
import CountrySelectionSection from "./edit-plan-modal/CountrySelectionSection";
import SupplierRateFields from "./create-plan-modal/SupplierRateFields";
import PlanBasicInfoFields from "./create-plan-modal/PlanBasicInfoFields";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePlanModal = ({ isOpen, onClose }: CreatePlanModalProps) => {
  const {
    register,
    handleSubmit,
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
  } = useCreatePlan(onClose);

  const {
    getMarginColor,
    handleTagToggle,
    handleCountryToggle,
    showPalopInfo,
    currentMargin
  } = useCreatePlanLogic(
    selectedTags,
    selectedCountries,
    supplierRates,
    retailPrice,
    setValue,
    setSelectedTags,
    setSelectedCountries
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PlanBasicInfoFields
            register={register}
            errors={errors}
            retailPrice={retailPrice}
            currentMargin={currentMargin}
            getMarginColor={getMarginColor}
          />

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

          <Separator />

          {/* Supplier Rates */}
          <SupplierRateFields
            supplierRates={supplierRates}
            onSupplierRatesChange={setSupplierRates}
          />

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || isCreating}
              className="min-w-[100px]"
            >
              {isCreating ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanModal;
