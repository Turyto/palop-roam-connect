
import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, Globe, Loader2, RefreshCw } from "lucide-react";
import RestockModal from "./RestockModal";
import PlanInventorySection from "./PlanInventorySection";
import type { InventoryItem } from "@/hooks/useInventory";

const AdminInventory = () => {
  const { inventory, isLoading, restock, isRestocking, getStatusInfo, refetch } = useInventory();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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

  const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0);
  const criticalItems = inventory.filter(item => 
    getStatusInfo(item.available, item.threshold_low, item.threshold_critical).status === 'critical'
  ).length;
  const lowItems = inventory.filter(item => 
    getStatusInfo(item.available, item.threshold_low, item.threshold_critical).status === 'low'
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Inventory Management</h2>
          <p className="text-gray-600 mt-1">Live eSIM stock levels with automatic adjustment</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Plan Inventory Section */}
      <PlanInventorySection />

      {/* Development Notice */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Live Inventory System Active</h4>
                <p className="text-green-800 text-sm mt-1">
                  Real-time inventory tracking with automatic stock adjustment on eSIM provisioning. 
                  Inventory decreases automatically when eSIMs are successfully provisioned.
                </p>
                <div className="mt-3 text-xs text-green-700">
                  <strong>Features:</strong> Auto-adjustment on provisioning, threshold alerts, manual restocking
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carrier Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Available (Carriers)</p>
                <p className="text-2xl font-bold text-gray-900">{totalAvailable}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Low Stock Carriers</p>
                <p className="text-2xl font-bold text-gray-900">{lowItems}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Critical Stock Carriers</p>
                <p className="text-2xl font-bold text-gray-900">{criticalItems}</p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carrier Inventory Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Carrier Stock by Country & Carrier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.map((item) => {
              const statusInfo = getStatusInfo(item.available, item.threshold_low, item.threshold_critical);
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.country}</h4>
                    <p className="text-sm text-gray-600">{item.carrier}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Thresholds: Low ≤ {item.threshold_low}, Critical ≤ {item.threshold_critical}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.available}</p>
                      <p className="text-xs text-gray-500">available</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusInfo.status)}
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedItem(item)}
                      disabled={isRestocking}
                    >
                      {isRestocking ? "..." : "Restock"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {inventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No carrier inventory data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restock Modal */}
      <RestockModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onRestock={restock}
        isRestocking={isRestocking}
      />
    </div>
  );
};

export default AdminInventory;
