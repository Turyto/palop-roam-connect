
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Info } from "lucide-react";

// Comprehensive PALOP-focused coverage countries
const PALOP_CORE_COUNTRIES = [
  "Angola", "Mozambique", "Cape Verde", "Guinea-Bissau", "São Tomé and Príncipe",
];

const PALOP_REGIONAL_COUNTRIES = [
  "Namibia", "South Africa", "Botswana", "Republic of Congo", "DRC", 
  "Zambia", "Zimbabwe", "Senegal", "Guinea",
];

const PALOP_DIASPORA_COUNTRIES = [
  "Portugal", "France", "Spain", "UK", "Luxembourg", 
  "Netherlands", "Switzerland", "Brazil", "USA",
];

const PALOP_CPLP_COUNTRIES = [
  "Timor-Leste", "Macau", "Equatorial Guinea",
];

const ALL_AVAILABLE_COUNTRIES = [
  ...PALOP_CORE_COUNTRIES,
  ...PALOP_REGIONAL_COUNTRIES,
  "Morocco", "Tunisia", "Algeria", "Egypt", "Nigeria", "Ghana", "Kenya", "Tanzania", "Uganda", "Rwanda",
  ...PALOP_DIASPORA_COUNTRIES,
  "Canada", "Australia", "Germany", "Italy", "Belgium", "Austria",
  ...PALOP_CPLP_COUNTRIES,
  "India", "China", "Japan", "UAE", "Qatar", "Turkey", "Russia",
].sort();

interface CountrySelectionSectionProps {
  selectedCountries: string[];
  onCountryToggle: (country: string) => void;
  showPalopInfo: boolean;
}

const CountrySelectionSection = ({ selectedCountries, onCountryToggle, showPalopInfo }: CountrySelectionSectionProps) => {
  return (
    <div>
      <Label>Coverage Countries</Label>
      {showPalopInfo && (
        <div className="flex items-start gap-2 mt-1 mb-3 p-3 bg-blue-50 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            PALOP plans include default coverage for key home, regional, and diaspora countries to best serve your community.
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
        {ALL_AVAILABLE_COUNTRIES.map(country => (
          <Badge
            key={country}
            variant={selectedCountries.includes(country) ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => onCountryToggle(country)}
          >
            {country}
            {selectedCountries.includes(country) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Selected: {selectedCountries.length} countries
      </p>
    </div>
  );
};

export default CountrySelectionSection;
export { PALOP_CORE_COUNTRIES, PALOP_REGIONAL_COUNTRIES, PALOP_DIASPORA_COUNTRIES, PALOP_CPLP_COUNTRIES };
