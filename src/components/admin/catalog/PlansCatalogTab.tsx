
import { useState } from "react";
import { usePlans, useSupplierRates } from "@/hooks/usePlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, Edit, RefreshCw } from "lucide-react";
import PlanDetailsDrawer from "./PlanDetailsDrawer";
import type { Plan } from "@/hooks/usePlans";

const PlansCatalogTab = () => {
  const { plans, isLoading, updatePlan } = usePlans();
  const { supplierRates } = useSupplierRates();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const calculateMargin = (plan: Plan) => {
    const planRates = supplierRates.filter(rate => rate.plan_id === plan.id);
    if (planRates.length === 0) return 0;
    
    const lowestCost = Math.min(...planRates.map(rate => rate.wholesale_cost));
    return ((plan.retail_price - lowestCost) / plan.retail_price) * 100;
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return "text-green-600";
    if (margin >= 20) return "text-yellow-600";
    return "text-red-600";
  };

  const togglePlanStatus = (plan: Plan) => {
    updatePlan({
      id: plan.id,
      updates: { status: plan.status === 'active' ? 'inactive' : 'active' }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Suppliers</TableHead>
              <TableHead>Wholesale Cost</TableHead>
              <TableHead>Retail Price</TableHead>
              <TableHead>Margin %</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => {
              const planRates = supplierRates.filter(rate => rate.plan_id === plan.id);
              const lowestCost = planRates.length > 0 
                ? Math.min(...planRates.map(rate => rate.wholesale_cost))
                : 0;
              const margin = calculateMargin(plan);
              
              return (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {planRates.map((rate, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {rate.supplier_name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lowestCost > 0 ? `€${lowestCost.toFixed(2)}` : 'N/A'}
                  </TableCell>
                  <TableCell>€{plan.retail_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={getMarginColor(margin)}>
                      {margin.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.coverage.slice(0, 2).map((country, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                      {plan.coverage.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{plan.coverage.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={plan.status === 'active'}
                      onCheckedChange={() => togglePlanStatus(plan)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No plans available. Add your first plan to get started.</p>
        </div>
      )}

      <PlanDetailsDrawer
        plan={selectedPlan}
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />
    </div>
  );
};

export default PlansCatalogTab;
