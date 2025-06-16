
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, Globe } from "lucide-react";

// Mock inventory data - will be replaced with real inventory system
const mockInventory = [
  {
    country: "Cape Verde",
    carrier: "CVMóvel",
    available: 245,
    threshold: 50,
    status: "healthy",
  },
  {
    country: "Angola",
    carrier: "Unitel",
    available: 89,
    threshold: 100,
    status: "low",
  },
  {
    country: "Mozambique",
    carrier: "Vodacom",
    available: 156,
    threshold: 50,
    status: "healthy",
  },
  {
    country: "Guinea-Bissau",
    carrier: "Orange",
    available: 23,
    threshold: 50,
    status: "critical",
  },
  {
    country: "São Tomé and Príncipe",
    carrier: "CST",
    available: 78,
    threshold: 30,
    status: "healthy",
  },
];

const AdminInventory = () => {
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      healthy: "default",
      low: "secondary",
      critical: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const totalAvailable = mockInventory.reduce((sum, item) => sum + item.available, 0);
  const criticalItems = mockInventory.filter(item => item.status === 'critical').length;
  const lowItems = mockInventory.filter(item => item.status === 'low').length;

  return (
    <div className="space-y-6">
      {/* Development Notice */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Inventory Management System</h4>
                <p className="text-blue-800 text-sm mt-1">
                  Real-time eSIM inventory tracking system ready for carrier integration. 
                  Data shown below is mock data for demonstration.
                </p>
                <div className="mt-3 text-xs text-blue-700">
                  <strong>Future Integration:</strong> Carrier APIs, automatic restocking alerts, bulk provisioning
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Available</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Low Stock</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Critical Stock</p>
                <p className="text-2xl font-bold text-gray-900">{criticalItems}</p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Stock by Country & Carrier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInventory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.country}</h4>
                  <p className="text-sm text-gray-600">{item.carrier}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.available}</p>
                    <p className="text-xs text-gray-500">available</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {getStatusBadge(item.status)}
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Restock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInventory;
