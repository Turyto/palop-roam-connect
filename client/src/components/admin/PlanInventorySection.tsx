
import { useState } from "react";
import { usePlanInventory } from "@/hooks/usePlanInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, ShoppingCart, Loader2, Bug } from "lucide-react";
import RestockModal from "./RestockModal";
import type { PlanInventoryItem } from "@/hooks/usePlanInventory";
import { useToast } from "@/hooks/use-toast";

const PlanInventorySection = () => {
  const { 
    planInventory, 
    isLoading, 
    restockPlan, 
    adjustPlanInventory,
    isRestocking, 
    isAdjusting,
    getStatusInfo,
    refetch 
  } = usePlanInventory();
  const [selectedPlan, setSelectedPlan] = useState<PlanInventoryItem | null>(null);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPlanIcon = (planId: string) => {
    const iconClass = "h-6 w-6";
    switch (planId) {
      case 'lite':
        return <ShoppingCart className={`${iconClass} text-palop-blue`} />;
      case 'core':
        return <Package className={`${iconClass} text-palop-green`} />;
      case 'plus':
        return <TrendingUp className={`${iconClass} text-palop-yellow`} />;
      default:
        return <Package className={`${iconClass} text-gray-600`} />;
    }
  };

  const getPlanDescription = (planId: string) => {
    switch (planId) {
      case 'lite':
        return 'Perfect for tourists • 1-2 GB • 7 days';
      case 'core':
        return 'Ideal for diaspora • 3-5 GB • 30 days';
      case 'plus':
        return 'Business travelers • 10 GB • 30 days';
      default:
        return 'eSIM Plan';
    }
  };

  const handleTestDecrease = (planId: string, currentAmount: number) => {
    const newAmount = Math.max(currentAmount - 1, 0);
    adjustPlanInventory(planId, newAmount);
    toast({
      title: "Test Decrease",
      description: `Manually decreased ${planId} plan inventory by 1 for testing`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading plan inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Plan Inventory Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Real-Time Plan Stock Management</h4>
                <p className="text-blue-800 text-sm mt-1">
                  Track Lite, Core, and Plus plan inventory with automatic stock reduction on completed orders.
                  Monitor stock levels and get alerts when plans are running low.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {planInventory.map((plan) => {
              const statusInfo = getStatusInfo(plan.available, plan.threshold_low, plan.threshold_critical);
              
              return (
                <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gray-50">
                      {getPlanIcon(plan.plan_id)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{plan.plan_name} Plan</h4>
                      <p className="text-sm text-gray-600">{getPlanDescription(plan.plan_id)}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Thresholds: Low ≤ {plan.threshold_low}, Critical ≤ {plan.threshold_critical}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{plan.available}</p>
                      <p className="text-xs text-gray-500">plans available</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusInfo.status)}
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPlan(plan)}
                        disabled={isRestocking || isAdjusting}
                      >
                        {isRestocking ? "..." : "Restock"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestDecrease(plan.plan_id, plan.available)}
                        disabled={isRestocking || isAdjusting}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <Bug className="h-3 w-3 mr-1" />
                        Test -1
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {planInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No plan inventory data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restock Modal */}
      <RestockModal
        item={selectedPlan ? {
          id: selectedPlan.id,
          country: selectedPlan.plan_name,
          carrier: 'Plan',
          available: selectedPlan.available,
          threshold_low: selectedPlan.threshold_low,
          threshold_critical: selectedPlan.threshold_critical,
          created_at: selectedPlan.created_at,
          updated_at: selectedPlan.updated_at
        } : null}
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onRestock={(itemId: string, amount: number) => {
          if (selectedPlan) {
            restockPlan(selectedPlan.plan_id, amount);
          }
        }}
        isRestocking={isRestocking}
      />
    </div>
  );
};

export default PlanInventorySection;
