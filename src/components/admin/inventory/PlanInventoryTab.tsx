
import { useState } from "react";
import { usePlanInventory } from "@/hooks/usePlanInventory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, AlertTriangle, TrendingUp, ShoppingCart, RefreshCw, Plus } from "lucide-react";
import RestockModal from "../RestockModal";
import type { PlanInventoryItem } from "@/hooks/usePlanInventory";

const PlanInventoryTab = () => {
  const { 
    planInventory, 
    isLoading, 
    restockPlan, 
    isRestocking, 
    getStatusInfo,
    refetch 
  } = usePlanInventory();
  const [selectedPlan, setSelectedPlan] = useState<PlanInventoryItem | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getProgressValue = (available: number, thresholdLow: number) => {
    const maxExpected = thresholdLow * 3; // Assume healthy stock is 3x low threshold
    return Math.min((available / maxExpected) * 100, 100);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'lite': return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'core': return <Package className="h-5 w-5 text-green-600" />;  
      case 'plus': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default: return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const quickRestockAmounts = [10, 25, 50, 100];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planInventory.map((plan) => {
          const statusInfo = getStatusInfo(plan.available, plan.threshold_low, plan.threshold_critical);
          const progressValue = getProgressValue(plan.available, plan.threshold_low);
          
          return (
            <Card key={plan.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getPlanIcon(plan.plan_id)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.plan_name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{plan.plan_id} Plan</p>
                    </div>
                  </div>
                  <Badge className={statusInfo.color} variant="secondary">
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{plan.available}</span>
                    <span className="text-sm text-gray-500">available</span>
                  </div>

                  <Progress 
                    value={progressValue} 
                    className="h-2"
                    style={{ 
                      backgroundColor: '#f3f4f6',
                    }}
                  />

                  <div className="flex gap-2">
                    {quickRestockAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-6"
                        onClick={() => restockPlan(plan.plan_id, amount)}
                        disabled={isRestocking}
                      >
                        +{amount}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-6"
                      onClick={() => setSelectedPlan(plan)}
                      disabled={isRestocking}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {statusInfo.status !== 'healthy' && (
                  <div className="absolute top-2 right-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {planInventory.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No plan inventory data available.</p>
        </div>
      )}

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

export default PlanInventoryTab;
