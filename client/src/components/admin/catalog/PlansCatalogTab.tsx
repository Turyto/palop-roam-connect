import { useState } from "react";
import { usePlans, useSupplierRates } from "@/hooks/usePlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit, RefreshCw, Package, AlertTriangle, Plus } from "lucide-react";
import PlanDetailsDrawer from "./PlanDetailsDrawer";
import EditPlanModal from "./EditPlanModal";
import CreatePlanModal from "./CreatePlanModal";
import BulkActionsToolbar from "./BulkActionsToolbar";
import type { Plan } from "@/hooks/usePlans";

const PlansCatalogTab = () => {
  const { plans, isLoading, updatePlan } = usePlans();
  const { supplierRates } = useSupplierRates();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [showLowMarginOnly, setShowLowMarginOnly] = useState(false);

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

  const handleSelectPlan = (planId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlanIds([...selectedPlanIds, planId]);
    } else {
      setSelectedPlanIds(selectedPlanIds.filter(id => id !== planId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlanIds(filteredPlans.map(plan => plan.id));
    } else {
      setSelectedPlanIds([]);
    }
  };

  // Filter plans based on low margin setting
  const filteredPlans = showLowMarginOnly 
    ? plans.filter(plan => calculateMargin(plan) < 20)
    : plans;

  const lowMarginCount = plans.filter(plan => calculateMargin(plan) < 20).length;

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
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Plans Catalog</h3>
          {lowMarginCount > 0 && (
            <Button
              variant={showLowMarginOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowLowMarginOnly(!showLowMarginOnly)}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              {showLowMarginOnly ? 'Show All Plans' : `View ${lowMarginCount} Low Margin Plans`}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Plan
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedPlanIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedPlanIds.length}
          onActivateAll={() => {
            selectedPlanIds.forEach(planId => {
              const plan = plans.find(p => p.id === planId);
              if (plan && plan.status !== 'active') {
                updatePlan({ id: planId, updates: { status: 'active' } });
              }
            });
            setSelectedPlanIds([]);
          }}
          onDeactivateAll={() => {
            selectedPlanIds.forEach(planId => {
              const plan = plans.find(p => p.id === planId);
              if (plan && plan.status !== 'inactive') {
                updatePlan({ id: planId, updates: { status: 'inactive' } });
              }
            });
            setSelectedPlanIds([]);
          }}
          onClearSelection={() => setSelectedPlanIds([])}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedPlanIds.length === filteredPlans.length && filteredPlans.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
            {filteredPlans.map((plan) => {
              const planRates = supplierRates.filter(rate => rate.plan_id === plan.id);
              const lowestCost = planRates.length > 0 
                ? Math.min(...planRates.map(rate => rate.wholesale_cost))
                : 0;
              const margin = calculateMargin(plan);
              const isLowMargin = margin < 20;
              
              return (
                <TableRow 
                  key={plan.id}
                  className={`${isLowMargin ? 'bg-red-50 border-l-4 border-l-red-400' : ''} ${selectedPlanIds.includes(plan.id) ? 'bg-blue-50' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedPlanIds.includes(plan.id)}
                      onCheckedChange={(checked) => handleSelectPlan(plan.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {plan.name}
                      {isLowMargin && (
                        <span title="Low margin alert">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </span>
                      )}
                    </div>
                  </TableCell>
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
                      {plan.coverage?.slice(0, 2).map((country, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                      {plan.coverage && plan.coverage.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{plan.coverage.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.tags?.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {plan.tags && plan.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.tags.length - 2}
                        </Badge>
                      )}
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                      >
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

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>{showLowMarginOnly ? 'No low margin plans found.' : 'No plans available. Add your first plan to get started.'}</p>
        </div>
      )}

      <PlanDetailsDrawer
        plan={selectedPlan}
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />

      <EditPlanModal
        plan={editingPlan}
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
      />

      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default PlansCatalogTab;
