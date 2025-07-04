
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DollarSign, Clock } from "lucide-react";
import { useSupplierRates, type Plan } from "@/hooks/usePlans";

interface SupplierInfoSectionProps {
  plan: Plan;
  watchedPrice: number;
}

const SupplierInfoSection = ({ plan, watchedPrice }: SupplierInfoSectionProps) => {
  const { supplierRates } = useSupplierRates();
  
  const planRates = supplierRates.filter(rate => rate.plan_id === plan.id);
  const lowestCost = planRates.length > 0 
    ? Math.min(...planRates.map(rate => rate.wholesale_cost))
    : 0;
  const currentMargin = watchedPrice && lowestCost > 0 
    ? ((watchedPrice - lowestCost) / watchedPrice) * 100 
    : 0;

  return (
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
      {watchedPrice && lowestCost > 0 && (
        <div className="mt-3">
          <p className={`text-sm ${currentMargin >= 30 ? 'text-green-600' : currentMargin >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
            Current margin: {currentMargin.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default SupplierInfoSection;
