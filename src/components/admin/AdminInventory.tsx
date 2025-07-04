
import { useInventory } from "@/hooks/useInventory";
import { usePlanInventory } from "@/hooks/usePlanInventory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Package, Globe } from "lucide-react";
import InventoryMetrics from "./inventory/InventoryMetrics";
import PlanInventoryTab from "./inventory/PlanInventoryTab";
import CarrierInventoryTab from "./inventory/CarrierInventoryTab";

const AdminInventory = () => {
  const { inventory, isLoading: inventoryLoading, refetch: refetchInventory, getStatusInfo } = useInventory();
  const { planInventory, isLoading: planLoading, refetch: refetchPlans, getStatusInfo: getPlanStatusInfo } = usePlanInventory();

  const handleRefreshAll = () => {
    refetchInventory();
    refetchPlans();
  };

  // Calculate metrics
  const planMetrics = {
    totalPlans: planInventory.reduce((sum, plan) => sum + plan.available, 0),
    lowStockPlans: planInventory.filter(plan => 
      getPlanStatusInfo(plan.available, plan.threshold_low, plan.threshold_critical).status === 'low'
    ).length,
    criticalStockPlans: planInventory.filter(plan => 
      getPlanStatusInfo(plan.available, plan.threshold_low, plan.threshold_critical).status === 'critical'
    ).length
  };

  const carrierMetrics = {
    totalCarriers: inventory.reduce((sum, item) => sum + item.available, 0),
    lowStockCarriers: inventory.filter(item => 
      getStatusInfo(item.available, item.threshold_low, item.threshold_critical).status === 'low'
    ).length,
    criticalStockCarriers: inventory.filter(item => 
      getStatusInfo(item.available, item.threshold_low, item.threshold_critical).status === 'critical'
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Monitor and manage eSIM stock levels</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshAll}
          disabled={inventoryLoading || planLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(inventoryLoading || planLoading) ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Metrics Overview */}
      <InventoryMetrics 
        planMetrics={planMetrics}
        carrierMetrics={carrierMetrics}
      />

      {/* Tabbed Interface */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="carriers" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Carriers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <PlanInventoryTab />
        </TabsContent>

        <TabsContent value="carriers">
          <CarrierInventoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInventory;
