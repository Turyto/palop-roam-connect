
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Package, DollarSign } from "lucide-react";
import { usePlans, useSupplierRates, usePricingRules } from "@/hooks/usePlans";

const CatalogMetrics = () => {
  const { plans } = usePlans();
  const { supplierRates } = useSupplierRates();
  const { pricingRules } = usePricingRules();

  const activePlans = plans.filter(plan => plan.status === 'active').length;
  
  // Calculate average margin
  const averageMargin = plans.length > 0 
    ? plans.reduce((sum, plan) => {
        const lowestCost = supplierRates
          .filter(rate => rate.plan_id === plan.id)
          .reduce((min, rate) => Math.min(min, rate.wholesale_cost), Infinity);
        
        if (lowestCost === Infinity) return sum;
        
        const margin = ((plan.retail_price - lowestCost) / plan.retail_price) * 100;
        return sum + margin;
      }, 0) / plans.length
    : 0;

  // Get latest update date
  const latestUpdate = supplierRates.length > 0
    ? new Date(Math.max(...supplierRates.map(rate => new Date(rate.last_checked).getTime())))
    : new Date();

  // Count plans with low margins
  const lowMarginPlans = plans.filter(plan => {
    const lowestCost = supplierRates
      .filter(rate => rate.plan_id === plan.id)
      .reduce((min, rate) => Math.min(min, rate.wholesale_cost), Infinity);
    
    if (lowestCost === Infinity) return false;
    
    const margin = ((plan.retail_price - lowestCost) / plan.retail_price) * 100;
    return margin < (pricingRules?.margin_alert_threshold || 20);
  }).length;

  const metrics = [
    {
      title: "Total Active Plans",
      value: activePlans,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Average Margin %",
      value: `${averageMargin.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Latest Update",
      value: latestUpdate.toLocaleDateString(),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Low Margin Alerts",
      value: lowMarginPlans,
      icon: AlertTriangle,
      color: lowMarginPlans > 0 ? "text-red-600" : "text-gray-600",
      bgColor: lowMarginPlans > 0 ? "bg-red-50" : "bg-gray-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CatalogMetrics;
