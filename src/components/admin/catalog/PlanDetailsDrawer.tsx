
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ExternalLink, Globe, Tag, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useSupplierRates, type Plan } from "@/hooks/usePlans";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

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

  // Mock cost history data - in real implementation, this would come from historical data
  const costHistoryData = [
    { date: '30d ago', cost: lowestCost * 1.1 },
    { date: '20d ago', cost: lowestCost * 1.05 },
    { date: '10d ago', cost: lowestCost * 0.98 },
    { date: 'Today', cost: lowestCost }
  ];

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              {plan.name}
              <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                {plan.status}
              </Badge>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Description */}
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="mt-1 text-sm">{plan.description || 'No description available for this plan.'}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                <p className="text-sm text-gray-500">Retail Price</p>
                <p className="text-xl font-bold text-green-600">€{plan.retail_price.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                <p className="text-sm text-gray-500">Best Margin</p>
                <p className={`text-xl font-bold ${margin >= 30 ? 'text-green-600' : margin >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {margin.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium">{new Date(plan.updated_at || '').toLocaleDateString()}</p>
              </div>
            </div>

            {/* Cost History Chart */}
            <div>
              <Label className="text-sm font-medium text-gray-500 mb-3 block">Cost History (30 Days)</Label>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Coverage Countries */}
            <div>
              <Label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4" />
                Coverage Countries ({plan.coverage?.length || 0})
              </Label>
              <div className="flex flex-wrap gap-2">
                {plan.coverage?.slice(0, 6).map((country, index) => (
                  <Badge key={index} variant="outline">
                    {country}
                  </Badge>
                ))}
                {plan.coverage && plan.coverage.length > 6 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        +{plan.coverage.length - 6} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium mb-2">Additional Countries:</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.coverage.slice(6).map((country, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {country}
                            </span>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4" />
                Plan Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {plan.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                )) || <span className="text-sm text-gray-400">No tags assigned</span>}
              </div>
            </div>

            <Separator />

            {/* Supplier Rates Details */}
            <div>
              <Label className="text-sm font-medium text-gray-500 mb-3 block">Supplier Rate Details</Label>
              <div className="space-y-3">
                {planRates.map((rate) => (
                  <div key={rate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">{rate.supplier_name}</p>
                        {rate.wholesale_cost === lowestCost && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Lowest Cost</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Supplier Plan ID: <span className="font-mono">{rate.supplier_plan_id || 'N/A'}</span></p>
                        <p>Last Checked: {new Date(rate.last_checked).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`text-lg font-bold ${rate.wholesale_cost === lowestCost ? 'text-green-600' : ''}`}>
                          €{rate.wholesale_cost.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(((plan.retail_price - rate.wholesale_cost) / plan.retail_price) * 100).toFixed(1)}% margin
                        </p>
                      </div>
                      {rate.supplier_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(rate.supplier_link, '_blank')}
                          className="shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {planRates.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No supplier rates available for this plan</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Plan Controls */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="plan-status" className="text-sm font-medium">Plan Status</Label>
                <Switch
                  id="plan-status"
                  checked={plan.status === 'active'}
                  onCheckedChange={() => {}}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit Plan
                </Button>
                <Button variant="outline" size="sm">
                  View History
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};

export default PlanDetailsDrawer;
