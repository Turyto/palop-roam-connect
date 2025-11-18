
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";

interface InventoryMetricsProps {
  planMetrics: {
    totalPlans: number;
    lowStockPlans: number;
    criticalStockPlans: number;
  };
  carrierMetrics: {
    totalCarriers: number;
    lowStockCarriers: number;
    criticalStockCarriers: number;
  };
}

const InventoryMetrics = ({ planMetrics, carrierMetrics }: InventoryMetricsProps) => {
  const metrics = [
    {
      title: "Plan Stock",
      value: planMetrics.totalPlans,
      subtext: "plans available",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Low Stock Plans",
      value: planMetrics.lowStockPlans,
      subtext: "need attention",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Critical Plans",
      value: planMetrics.criticalStockPlans,
      subtext: "urgent restock",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Carrier Stock",
      value: carrierMetrics.totalCarriers,
      subtext: "eSIMs available",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Low Stock Carriers",
      value: carrierMetrics.lowStockCarriers,
      subtext: "need attention",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Critical Carriers",
      value: carrierMetrics.criticalStockCarriers,
      subtext: "urgent restock",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.subtext}</p>
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

export default InventoryMetrics;
