
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Globe, Tag } from "lucide-react";
import { useSupplierRates, type Plan } from "@/hooks/usePlans";

interface PlanDetailsDrawerProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlanDetailsDrawer = ({ plan, isOpen, onClose }: PlanDetailsDrawerProps) => {
  const { supplierRates } = useSupplierRates();

  if (!plan) return null;

  const planRates = supplierRates.filter(rate => rate.plan_id === plan.id);
  const lowestCost = planRates.length > 0 
    ? Math.min(...planRates.map(rate => rate.wholesale_cost))
    : 0;
  const margin = lowestCost > 0 
    ? ((plan.retail_price - lowestCost) / plan.retail_price) * 100 
    : 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {plan.name}
            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
              {plan.status}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <Label className="text-sm font-medium text-gray-500">Description</Label>
            <p className="mt-1">{plan.description || 'No description available'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Retail Price</Label>
              <p className="text-2xl font-bold text-green-600">€{plan.retail_price.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Best Margin</Label>
              <p className={`text-2xl font-bold ${margin >= 30 ? 'text-green-600' : margin >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                {margin.toFixed(1)}%
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4" />
              Coverage Countries
            </Label>
            <div className="flex flex-wrap gap-2">
              {plan.coverage.map((country, index) => (
                <Badge key={index} variant="outline">
                  {country}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {plan.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium text-gray-500 mb-3">Supplier Rates</Label>
            <div className="space-y-3">
              {planRates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{rate.supplier_name}</p>
                    <p className="text-sm text-gray-500">
                      Updated: {new Date(rate.last_checked).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${rate.wholesale_cost === lowestCost ? 'text-green-600' : ''}`}>
                      €{rate.wholesale_cost.toFixed(2)}
                      {rate.wholesale_cost === lowestCost && (
                        <span className="text-xs text-green-600 block">Lowest</span>
                      )}
                    </p>
                    {rate.supplier_link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(rate.supplier_link, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="plan-status">Plan Active</Label>
            <Switch
              id="plan-status"
              checked={plan.status === 'active'}
              onCheckedChange={() => {}}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PlanDetailsDrawer;
