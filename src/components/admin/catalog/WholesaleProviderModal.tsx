
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Package, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";

interface SupplierSummary {
  supplier: string;
  avgWholesale: number;
  plansCount: number;
  lowestPrice: number;
  highestPrice: number;
  compliance: boolean;
  lastSync: string;
  plans: any[];
}

interface WholesaleProviderModalProps {
  supplier: SupplierSummary | null;
  isOpen: boolean;
  onClose: () => void;
  pricingRules: any;
}

const WholesaleProviderModal = ({ supplier, isOpen, onClose, pricingRules }: WholesaleProviderModalProps) => {
  if (!supplier) return null;

  const calculateMargin = (retailPrice: number, wholesaleCost: number) => {
    if (retailPrice <= 0) return 0;
    return ((retailPrice - wholesaleCost) / retailPrice) * 100;
  };

  const getComplianceStatus = (marginPercent: number) => {
    const threshold = pricingRules?.margin_alert_threshold || 20;
    if (marginPercent >= threshold) {
      return { status: 'compliant', color: 'text-green-600', icon: CheckCircle };
    } else {
      return { status: 'at-risk', color: 'text-amber-600', icon: AlertTriangle };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 -m-6 mb-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8" />
              <div>
                <DialogTitle className="text-xl font-bold text-white">{supplier.supplier}</DialogTitle>
                <p className="text-blue-100 text-sm mt-1">Wholesale Provider Details</p>
              </div>
            </div>
            <div className="text-right">
              <Badge 
                className={`${supplier.compliance ? 'bg-green-500' : 'bg-amber-500'} text-white border-0`}
              >
                {supplier.compliance ? 'Compliant' : 'At Risk'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Plans</p>
                    <p className="text-2xl font-bold">{supplier.plansCount}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Wholesale</p>
                    <p className="text-2xl font-bold">€{supplier.avgWholesale.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Price Range</p>
                    <p className="text-lg font-bold">€{supplier.lowestPrice.toFixed(2)} - €{supplier.highestPrice.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Sync</p>
                    <p className="text-lg font-bold">{supplier.lastSync}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plans Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Plan-Level Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Wholesale Cost</TableHead>
                      <TableHead>Retail Price</TableHead>
                      <TableHead>Margin %</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplier.plans.map((plan) => {
                      const retailPrice = plan.plans?.retail_price || 0;
                      const marginPercent = calculateMargin(retailPrice, plan.wholesale_cost);
                      const compliance = getComplianceStatus(marginPercent);
                      const ComplianceIcon = compliance.icon;
                      
                      return (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">
                            {plan.plans?.name || 'Unknown Plan'}
                          </TableCell>
                          <TableCell>€{plan.wholesale_cost.toFixed(2)}</TableCell>
                          <TableCell>€{retailPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={marginPercent >= (pricingRules?.margin_alert_threshold || 20) ? 'text-green-600' : 'text-amber-600'}>
                              {marginPercent.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${compliance.color}`}>
                              <ComplianceIcon className="h-4 w-4" />
                              <span className="text-sm">{compliance.status === 'compliant' ? 'Good' : 'Risk'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {new Date(plan.last_checked).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WholesaleProviderModal;
