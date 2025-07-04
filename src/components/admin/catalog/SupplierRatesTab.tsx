
import { useSupplierRates } from "@/hooks/usePlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";

const SupplierRatesTab = () => {
  const { supplierRates, isLoading, refetch } = useSupplierRates();

  // Group rates by plan and find lowest cost
  const ratesByPlan = supplierRates.reduce((acc: any, rate) => {
    const planName = rate.plans?.name || 'Unknown Plan';
    if (!acc[planName]) {
      acc[planName] = [];
    }
    acc[planName].push(rate);
    return acc;
  }, {});

  const findLowestCost = (rates: any[]) => {
    return Math.min(...rates.map(rate => rate.wholesale_cost));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading supplier rates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Supplier Rates Comparison</h3>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Rates
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Wholesale Cost</TableHead>
              <TableHead>Supplier Plan ID</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(ratesByPlan).map(([planName, rates]: [string, any]) => {
              const lowestCost = findLowestCost(rates);
              
              return rates.map((rate: any, index: number) => (
                <TableRow key={rate.id}>
                  {index === 0 && (
                    <TableCell rowSpan={rates.length} className="font-medium border-r">
                      {planName}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline">{rate.supplier_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={rate.wholesale_cost === lowestCost ? 'text-green-600 font-semibold' : ''}>
                      €{rate.wholesale_cost.toFixed(2)}
                      {rate.wholesale_cost === lowestCost && (
                        <Badge className="ml-2 bg-green-100 text-green-800">Lowest</Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {rate.supplier_plan_id || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(rate.last_checked).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {rate.supplier_link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(rate.supplier_link, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </div>

      {supplierRates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No supplier rates available. Import rates to get started.</p>
        </div>
      )}
    </div>
  );
};

export default SupplierRatesTab;
