
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useSupplierRates, usePricingRules } from "@/hooks/usePlans";
import WholesaleProviderModal from "./WholesaleProviderModal";

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

const WholesaleProvidersOverview = () => {
  const { supplierRates, isLoading: ratesLoading } = useSupplierRates();
  const { pricingRules, isLoading: rulesLoading } = usePricingRules();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate supplier summaries from the existing data
  const supplierSummaries: SupplierSummary[] = supplierRates.reduce((acc: SupplierSummary[], rate) => {
    const existingSupplier = acc.find(s => s.supplier === rate.supplier_name);
    
    if (existingSupplier) {
      existingSupplier.plans.push(rate);
      existingSupplier.plansCount++;
      existingSupplier.avgWholesale = existingSupplier.plans.reduce((sum, p) => sum + p.wholesale_cost, 0) / existingSupplier.plans.length;
      existingSupplier.lowestPrice = Math.min(existingSupplier.lowestPrice, rate.wholesale_cost);
      existingSupplier.highestPrice = Math.max(existingSupplier.highestPrice, rate.wholesale_cost);
      existingSupplier.lastSync = new Date(Math.max(new Date(existingSupplier.lastSync).getTime(), new Date(rate.last_checked).getTime())).toISOString().split('T')[0];
    } else {
      acc.push({
        supplier: rate.supplier_name,
        avgWholesale: rate.wholesale_cost,
        plansCount: 1,
        lowestPrice: rate.wholesale_cost,
        highestPrice: rate.wholesale_cost,
        compliance: true, // Will be calculated below
        lastSync: new Date(rate.last_checked).toISOString().split('T')[0],
        plans: [rate]
      });
    }
    
    return acc;
  }, []);

  // Calculate compliance based on pricing rules
  if (pricingRules) {
    supplierSummaries.forEach(supplier => {
      supplier.compliance = supplier.plans.every(plan => {
        const retailPrice = plan.plans?.retail_price || 0;
        const marginPercent = retailPrice > 0 ? ((retailPrice - plan.wholesale_cost) / retailPrice) * 100 : 0;
        return marginPercent >= (pricingRules.margin_alert_threshold || 20);
      });
    });
  }

  const getComplianceBadge = (compliance: boolean) => {
    if (compliance) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Compliant
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          At Risk
        </Badge>
      );
    }
  };

  const getRowClassName = (compliance: boolean) => {
    if (compliance) {
      return "bg-green-50 hover:bg-green-100 cursor-pointer";
    } else {
      return "bg-amber-50 hover:bg-amber-100 cursor-pointer";
    }
  };

  const handleSupplierClick = (supplier: SupplierSummary) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  if (ratesLoading || rulesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Wholesale Providers Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading supplier data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Wholesale Providers Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {supplierSummaries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No supplier data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Avg. Wholesale Price</TableHead>
                    <TableHead className="text-center"># Plans</TableHead>
                    <TableHead>Lowest Plan Price</TableHead>
                    <TableHead>Highest Plan Price</TableHead>
                    <TableHead>Markup Compliance</TableHead>
                    <TableHead>Last Sync</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierSummaries.map((supplier) => (
                    <TableRow
                      key={supplier.supplier}
                      className={getRowClassName(supplier.compliance)}
                      onClick={() => handleSupplierClick(supplier)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {supplier.supplier}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">€{supplier.avgWholesale.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{supplier.plansCount}</Badge>
                      </TableCell>
                      <TableCell>€{supplier.lowestPrice.toFixed(2)}</TableCell>
                      <TableCell>€{supplier.highestPrice.toFixed(2)}</TableCell>
                      <TableCell>{getComplianceBadge(supplier.compliance)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{supplier.lastSync}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <WholesaleProviderModal
        supplier={selectedSupplier}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pricingRules={pricingRules}
      />
    </>
  );
};

export default WholesaleProvidersOverview;
