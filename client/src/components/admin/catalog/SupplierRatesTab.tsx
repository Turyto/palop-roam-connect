
import { useSupplierRates } from "@/hooks/usePlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, TrendingDown, Clock } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SupplierRatesTab = () => {
  const { supplierRates, isLoading, refetch } = useSupplierRates();
  const [sortBy, setSortBy] = useState<'cost' | 'updated' | 'supplier'>('cost');

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

  // Calculate summary stats
  const totalSuppliers = new Set(supplierRates.map(rate => rate.supplier_name)).size;
  const avgCost = supplierRates.length > 0 
    ? supplierRates.reduce((sum, rate) => sum + rate.wholesale_cost, 0) / supplierRates.length 
    : 0;
  const oldestUpdate = supplierRates.length > 0 
    ? Math.min(...supplierRates.map(rate => new Date(rate.last_checked).getTime()))
    : 0;

  // Sort rates within each plan
  const sortRates = (rates: any[]) => {
    return [...rates].sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return a.wholesale_cost - b.wholesale_cost;
        case 'updated':
          return new Date(b.last_checked).getTime() - new Date(a.last_checked).getTime();
        case 'supplier':
          return a.supplier_name.localeCompare(b.supplier_name);
        default:
          return 0;
      }
    });
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {supplierRates.length} total rates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Wholesale Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{avgCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              across all plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {oldestUpdate ? Math.ceil((Date.now() - oldestUpdate) / (1000 * 60 * 60 * 24)) : 0}d
            </div>
            <p className="text-xs text-muted-foreground">
              oldest rate update
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Supplier Rates Comparison</h3>
          <div className="flex gap-2">
            <Button 
              variant={sortBy === 'cost' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSortBy('cost')}
            >
              Sort by Cost
            </Button>
            <Button 
              variant={sortBy === 'updated' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSortBy('updated')}
            >
              Sort by Updated
            </Button>
            <Button 
              variant={sortBy === 'supplier' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSortBy('supplier')}
            >
              Sort by Supplier
            </Button>
          </div>
        </div>
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
              const sortedRates = sortRates(rates);
              
              return sortedRates.map((rate: any, index: number) => (
                <TableRow key={rate.id}>
                  {index === 0 && (
                    <TableCell rowSpan={rates.length} className="font-medium border-r">
                      <div className="flex flex-col">
                        <span>{planName}</span>
                        <span className="text-xs text-gray-500 mt-1">
                          {rates.length} supplier{rates.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{rate.supplier_name}</Badge>
                      {Date.now() - new Date(rate.last_checked).getTime() > 7 * 24 * 60 * 60 * 1000 && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          Stale
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={rate.wholesale_cost === lowestCost ? 'text-green-600 font-semibold' : ''}>
                        €{rate.wholesale_cost.toFixed(2)}
                      </span>
                      {rate.wholesale_cost === lowestCost && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Best Price</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {rate.supplier_plan_id || (
                      <span className="text-gray-400 italic">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {new Date(rate.last_checked).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.ceil((Date.now() - new Date(rate.last_checked).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {rate.supplier_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(rate.supplier_link, '_blank')}
                          title="Open supplier portal"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
          <Button className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Sample Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default SupplierRatesTab;
