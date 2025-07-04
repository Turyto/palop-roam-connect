
import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Globe, AlertTriangle, RefreshCw, Plus } from "lucide-react";
import RestockModal from "../RestockModal";
import type { InventoryItem } from "@/hooks/useInventory";

const CarrierInventoryTab = () => {
  const { inventory, isLoading, restock, isRestocking, getStatusInfo } = useInventory();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const getProgressValue = (available: number, thresholdLow: number) => {
    const maxExpected = thresholdLow * 3; // Assume healthy stock is 3x low threshold
    return Math.min((available / maxExpected) * 100, 100);
  };

  const quickRestockAmounts = [5, 10, 25, 50];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading carriers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => {
          const statusInfo = getStatusInfo(item.available, item.threshold_low, item.threshold_critical);
          const progressValue = getProgressValue(item.available, item.threshold_low);
          
          return (
            <Card key={item.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.country}</h3>
                      <p className="text-sm text-gray-600">{item.carrier}</p>
                    </div>
                  </div>
                  <Badge className={statusInfo.color} variant="secondary">
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{item.available}</span>
                    <span className="text-sm text-gray-500">eSIMs</span>
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
                        onClick={() => restock(item.id, amount)}
                        disabled={isRestocking}
                      >
                        +{amount}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-6"
                      onClick={() => setSelectedItem(item)}
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

      {inventory.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No carrier inventory data available.</p>
        </div>
      )}

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

export default CarrierInventoryTab;
