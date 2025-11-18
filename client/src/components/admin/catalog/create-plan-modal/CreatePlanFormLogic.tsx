
import { SupplierRate } from "@/hooks/useCreatePlan";
import { 
  PALOP_CORE_COUNTRIES, 
  PALOP_REGIONAL_COUNTRIES, 
  PALOP_DIASPORA_COUNTRIES, 
  PALOP_CPLP_COUNTRIES 
} from "../edit-plan-modal/CountrySelectionSection";

const PALOP_DEFAULT_COUNTRIES = [
  ...PALOP_CORE_COUNTRIES,
  ...PALOP_REGIONAL_COUNTRIES,
  ...PALOP_DIASPORA_COUNTRIES,
  ...PALOP_CPLP_COUNTRIES,
];

export const useCreatePlanLogic = (
  selectedTags: string[],
  selectedCountries: string[],
  supplierRates: SupplierRate[],
  retailPrice: number,
  setValue: (name: any, value: any) => void,
  setSelectedTags: (tags: string[]) => void,
  setSelectedCountries: (countries: string[]) => void
) => {
  // Calculate margin for preview
  const calculateMargin = () => {
    const validRates = supplierRates.filter(rate => rate.wholesale_cost > 0);
    if (validRates.length === 0 || retailPrice <= 0) return 0;
    
    const lowestCost = Math.min(...validRates.map(rate => rate.wholesale_cost));
    return ((retailPrice - lowestCost) / retailPrice) * 100;
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return "text-green-600";
    if (margin >= 20) return "text-yellow-600";
    return "text-red-600";
  };

  // Check if plan is PALOP-focused
  const isPalopPlan = (planName: string, planTags: string[]) => {
    const nameIncludesPalop = planName.toLowerCase().includes('palop') || planName.toLowerCase().includes('essential palop');
    const tagsIncludePalop = planTags.some(tag => tag.toLowerCase().includes('palop'));
    return nameIncludesPalop || tagsIncludePalop;
  };

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

  return {
    calculateMargin,
    getMarginColor,
    isPalopPlan,
    handleTagToggle,
    handleCountryToggle,
    showPalopInfo: isPalopPlan('', selectedTags),
    currentMargin: calculateMargin()
  };
};
