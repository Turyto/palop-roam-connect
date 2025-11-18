
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlans, useSupplierRates } from "@/hooks/usePlans";
import { Package, TrendingUp, AlertTriangle, Clock, DollarSign, Globe } from "lucide-react";
import { useState } from "react";

const CatalogMetrics = () => {
  const { plans } = usePlans();
  const { supplierRates } = useSupplierRates();
  const [showLowMarginPlans, setShowLowMarginPlans] = useState(false);

  const activePlans = plans.filter(plan => plan.status === 'active').length;
  const totalPlans = plans.length;
  
  // Calculate average margin
  const marginsWithCosts = plans.map(plan => {
    const planRates = supplierRates.filter(rate => rate.plan_id === plan.id);
    if (planRates.length === 0) return 0;
    const lowestCost = Math.min(...planRates.map(rate => rate.wholesale_cost));
    return ((plan.retail_price - lowestCost) / plan.retail_price) * 100;
  }).filter(margin => margin > 0);
  
  const averageMargin = marginsWithCosts.length > 0 
    ? marginsWithCosts.reduce((a, b) => a + b, 0) / marginsWithCosts.length 
    : 0;

  // Count low margin plans (< 20%)
  const lowMarginPlans = plans.filter(plan => {
    const planRates = supplierRates.filter(rate => rate.plan_id === plan.id);
    if (planRates.length === 0) return false;
    const lowestCost = Math.min(...planRates.map(rate => rate.wholesale_cost));
    const margin = ((plan.retail_price - lowestCost) / plan.retail_price) * 100;
    return margin < 20;
  }).length;

  // Latest update time
  const latestUpdate = supplierRates.length > 0 
    ? Math.max(...supplierRates.map(rate => new Date(rate.last_checked).getTime()))
    : 0;

  // Total countries covered
  const allCountries = new Set();
  plans.forEach(plan => {
    plan.coverage?.forEach(country => allCountries.add(country));
  });

  // Total revenue potential (sum of all active plan retail prices)
  const totalRevenuePotential = plans
    .filter(plan => plan.status === 'active')
    .reduce((sum, plan) => sum + plan.retail_price, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activePlans}</div>
          <p className="text-xs text-muted-foreground">
            of {totalPlans} total plans
          </p>
          <div className="mt-2">
            <Badge variant={activePlans > totalPlans * 0.8 ? 'default' : 'secondary'}>
              {Math.round((activePlans / totalPlans) * 100)}% active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${averageMargin >= 30 ? 'text-green-600' : averageMargin >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
            {averageMargin.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            across {marginsWithCosts.length} plans
          </p>
          <div className="mt-2">
            <Badge variant={averageMargin >= 25 ? 'default' : 'secondary'}>
              {averageMargin >= 25 ? 'Healthy' : 'Needs attention'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className={lowMarginPlans > 0 ? 'border-red-200 bg-red-50' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Margin Alerts</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${lowMarginPlans > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${lowMarginPlans > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {lowMarginPlans}
          </div>
          <p className="text-xs text-muted-foreground">
            plans below 20% margin
          </p>
          {lowMarginPlans > 0 && (
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-6 px-2"
                onClick={() => setShowLowMarginPlans(true)}
              >
                Review Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coverage</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{allCountries.size}</div>
          <p className="text-xs text-muted-foreground">
            countries covered
          </p>
          <div className="mt-2">
            <Badge variant={allCountries.size >= 10 ? 'default' : 'secondary'}>
              {allCountries.size >= 10 ? 'Global' : 'Regional'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{totalRevenuePotential.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            total catalog value
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {activePlans} active plans
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {latestUpdate ? new Date(latestUpdate).toLocaleDateString() : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            supplier rates sync
          </p>
          <div className="mt-2">
            <Badge variant={Date.now() - latestUpdate < 86400000 ? 'default' : 'secondary'}>
              {Date.now() - latestUpdate < 86400000 ? 'Recent' : 'Needs sync'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogMetrics;
