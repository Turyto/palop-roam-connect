
import { useSupplierRates, useLiveSupplierRates, ComparisonRow } from "@/hooks/usePlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, TrendingDown, TrendingUp, Minus, AlertCircle, CheckCheck, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eSIM Access invoices in USD. Use a fixed EUR/USD rate for comparison.
// Update this when the rate drifts significantly.
const USD_TO_EUR = 0.92;

function toEur(price: number, currency: string | null): number {
  if (!currency || currency === 'EUR') return price;
  if (currency === 'USD') return price * USD_TO_EUR;
  return price; // fallback — show as-is
}

function buildComparisonRows(
  supplierRates: any[],
  liveRates: any[],
): ComparisonRow[] {
  // Build a map of plan_id → stored cost from supplier_rates
  const storedMap = new Map<string, { cost: number; supplier_name: string }>();
  for (const r of supplierRates) {
    storedMap.set(r.plan_id, { cost: r.wholesale_cost, supplier_name: r.supplier_name });
  }

  // Build rows from live rates (which only contain active plans with package codes)
  const rows: ComparisonRow[] = liveRates.map((lr) => {
    const stored = storedMap.get(lr.plan_id);
    const storedCost = stored?.cost ?? null;
    const livePrice = lr.live_price;
    // Convert live price to EUR for an apples-to-apples delta
    const livePriceEur = livePrice !== null ? toEur(livePrice, lr.live_currency) : null;

    let status: ComparisonRow['status'] = 'no_package';
    let delta: number | null = null;

    if (!lr.package_code) {
      status = 'no_package';
    } else if (!lr.live_price_found || livePrice === null) {
      status = 'no_data';
    } else if (storedCost === null) {
      status = 'no_data';
    } else {
      delta = livePriceEur! - storedCost;
      if (Math.abs(delta) < 0.005) status = 'same';
      else if (delta > 0) status = 'up';
      else status = 'down';
    }

    return {
      plan_id: lr.plan_id,
      plan_name: lr.plan_name,
      package_code: lr.package_code,
      supplier: lr.supplier,
      stored_cost: storedCost,
      live_price: livePriceEur,   // store the EUR-converted price for display
      live_currency: 'EUR',
      delta,
      status,
    };
  });

  // Also add any stored-rate rows that aren't in the live fetch (inactive plans, etc.)
  const liveIds = new Set(liveRates.map(lr => lr.plan_id));
  for (const r of supplierRates) {
    if (!liveIds.has(r.plan_id)) {
      rows.push({
        plan_id: r.plan_id,
        plan_name: r.plans?.name ?? 'Unknown',
        package_code: null,
        stored_cost: r.wholesale_cost,
        live_price: null,
        live_currency: null,
        delta: null,
        status: 'no_package',
      });
    }
  }

  return rows;
}

function DeltaBadge({ status, delta }: { status: ComparisonRow['status']; delta: number | null }) {
  if (status === 'no_package') {
    return <span className="text-xs text-gray-400 italic">No package code set</span>;
  }
  if (status === 'no_data') {
    return <Badge variant="outline" className="text-xs text-gray-400">No live data from supplier</Badge>;
  }
  if (status === 'same') {
    return (
      <Badge className="bg-gray-100 text-gray-600 text-xs gap-1">
        <Minus className="h-3 w-3" /> Unchanged
      </Badge>
    );
  }
  if (status === 'up' && delta !== null) {
    return (
      <Badge className="bg-red-100 text-red-700 text-xs gap-1">
        <TrendingUp className="h-3 w-3" /> +€{delta.toFixed(2)}
      </Badge>
    );
  }
  if (status === 'down' && delta !== null) {
    return (
      <Badge className="bg-green-100 text-green-700 text-xs gap-1">
        <TrendingDown className="h-3 w-3" /> −€{Math.abs(delta).toFixed(2)}
      </Badge>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const SupplierRatesTab = () => {
  const { supplierRates, isLoading, refetch, acceptRate, isAccepting } = useSupplierRates();
  const { liveRates, isFetching, lastFetched, fetchError, fetchLive } = useLiveSupplierRates();
  const { toast } = useToast();

  // Real delivery package codes live in esim_packages (keyed by plan id).
  const { data: packageCodes = new Map<string, string>() } = useQuery({
    queryKey: ["esim-package-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("esim_packages")
        .select("plan_id, esim_access_package_id, supplier_package_id");
      if (error) throw error;
      const map = new Map<string, string>();
      for (const row of data ?? []) {
        const code = row.esim_access_package_id ?? row.supplier_package_id;
        if (code) map.set(row.plan_id, code);
      }
      return map;
    },
  });

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptingAll, setAcceptingAll] = useState(false);

  const hasLiveData = liveRates.length > 0;

  const comparisonRows = useMemo(
    () => buildComparisonRows(supplierRates, hasLiveData ? liveRates : []),
    [supplierRates, liveRates, hasLiveData],
  );

  const changedRows = comparisonRows.filter(r => r.status === 'up' || r.status === 'down');

  // Summary stats
  const totalSuppliers = new Set(supplierRates.map(r => r.supplier_name)).size;
  const avgCost = supplierRates.length > 0
    ? supplierRates.reduce((s, r) => s + r.wholesale_cost, 0) / supplierRates.length
    : 0;
  const oldestUpdate = supplierRates.length > 0
    ? Math.min(...supplierRates.map(r => new Date(r.last_checked).getTime()))
    : 0;

  const handleRefresh = async () => {
    refetch();
    await fetchLive();
  };

  const handleAccept = async (row: ComparisonRow) => {
    if (row.live_price === null) return;
    setAcceptingId(row.plan_id);
    try {
      await acceptRate({ planId: row.plan_id, livePrice: row.live_price, supplierName: row.supplier === 'esimcard' ? 'eSIM Card' : 'eSIM Access' });
      toast({ title: 'Rate updated', description: `${row.plan_name} → €${row.live_price.toFixed(2)}` });
    } catch (e: any) {
      toast({ title: 'Failed to update rate', description: e.message, variant: 'destructive' });
    } finally {
      setAcceptingId(null);
    }
  };

  const handleAcceptAll = async () => {
    if (changedRows.length === 0) return;
    setAcceptingAll(true);
    let updated = 0;
    for (const row of changedRows) {
      if (row.live_price === null) continue;
      try {
        await acceptRate({ planId: row.plan_id, livePrice: row.live_price, supplierName: row.supplier === 'esimcard' ? 'eSIM Card' : 'eSIM Access' });
        updated++;
      } catch { /* continue with others */ }
    }
    setAcceptingAll(false);
    toast({ title: `${updated} rate${updated !== 1 ? 's' : ''} updated`, description: 'Stored costs now match live supplier prices.' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading supplier rates...</span>
      </div>
    );
  }

  // Display rows: if we have live data use comparison rows, otherwise fall back to stored only
  const displayRows: Array<{ planName: string; rate: any; compRow: ComparisonRow | null }> = hasLiveData
    ? comparisonRows.map(cr => ({
        planName: cr.plan_name,
        rate: supplierRates.find(r => r.plan_id === cr.plan_id),
        compRow: cr,
      }))
    : supplierRates.map(r => ({
        planName: r.plans?.name ?? 'Unknown',
        rate: r,
        compRow: null,
      }));

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
            <p className="text-xs text-muted-foreground">{supplierRates.length} total rates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Wholesale Cost</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{avgCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">across all plans</p>
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
            <p className="text-xs text-muted-foreground">oldest rate update</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Supplier Rates Comparison</h3>
          {lastFetched && (
            <span className="text-xs text-gray-400">
              Live data from {lastFetched.toLocaleTimeString()}
            </span>
          )}
          {changedRows.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-xs">
              {changedRows.length} price change{changedRows.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {changedRows.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleAcceptAll}
              disabled={acceptingAll}
              data-testid="button-accept-all-rates"
            >
              {acceptingAll
                ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                : <CheckCheck className="h-4 w-4 mr-2" />
              }
              Accept All Changes
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            data-testid="button-refresh-rates"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Fetching live prices…' : hasLiveData ? 'Refresh Rates' : 'Fetch Live Prices'}
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Live fetch failed: {fetchError}</span>
        </div>
      )}

      {/* Hint when no live data yet */}
      {!hasLiveData && !isFetching && (
        <div className="rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3">
          Click <strong>Fetch Live Prices</strong> to compare your stored costs against the current eSIM Access catalogue.
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Stored Cost</TableHead>
              {hasLiveData && <TableHead>Live Price</TableHead>}
              {hasLiveData && <TableHead>Change</TableHead>}
              <TableHead>Package Code</TableHead>
              <TableHead>Last Updated</TableHead>
              {hasLiveData && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map(({ planName, rate, compRow }) => {
              const isChanged = compRow?.status === 'up' || compRow?.status === 'down';
              return (
                <TableRow key={compRow?.plan_id ?? rate?.id} className={isChanged ? 'bg-amber-50/40' : ''}>
                  <TableCell className="font-medium">{planName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {compRow?.supplier === 'esimcard'
                        ? 'eSIM Card'
                        : compRow?.supplier === 'esim_access'
                          ? 'eSIM Access'
                          : rate?.supplier_name ?? 'eSIM Access'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rate ? (
                      <span className="font-semibold">€{rate.wholesale_cost.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400 italic text-sm">Not set</span>
                    )}
                  </TableCell>

                  {hasLiveData && (
                    <TableCell>
                      {isFetching ? (
                        <Skeleton className="h-5 w-16" />
                      ) : compRow?.live_price !== null && compRow?.live_price !== undefined ? (
                        <span className="font-semibold">
                          €{compRow.live_price.toFixed(2)}
                          {compRow.live_currency && compRow.live_currency !== 'EUR' && (
                            <span className="text-xs text-gray-400 ml-1">{compRow.live_currency}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">—</span>
                      )}
                    </TableCell>
                  )}

                  {hasLiveData && (
                    <TableCell>
                      {isFetching
                        ? <Skeleton className="h-5 w-20" />
                        : compRow
                          ? <DeltaBadge status={compRow.status} delta={compRow.delta} />
                          : null
                      }
                    </TableCell>
                  )}

                  <TableCell className="font-mono text-xs text-gray-500">
                    {packageCodes.get(compRow?.plan_id ?? rate?.plan_id) ?? compRow?.package_code ?? (
                      <span className="text-gray-400 italic">Not specified</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {rate ? (
                      <div className="flex flex-col">
                        <span className="text-sm">{new Date(rate.last_checked).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-400">
                          {Math.ceil((Date.now() - new Date(rate.last_checked).getTime()) / (1000 * 60 * 60 * 24))}d ago
                        </span>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </TableCell>

                  {hasLiveData && (
                    <TableCell>
                      {isChanged && compRow?.live_price !== null ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => compRow && handleAccept(compRow)}
                          disabled={acceptingId === compRow?.plan_id || isAccepting}
                          data-testid={`button-accept-rate-${compRow?.plan_id}`}
                        >
                          {acceptingId === compRow?.plan_id
                            ? <RefreshCw className="h-3 w-3 animate-spin" />
                            : 'Accept'
                          }
                        </Button>
                      ) : null}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {supplierRates.length === 0 && !hasLiveData && (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No supplier rates yet. Add rates via the Plans Catalog tab.</p>
        </div>
      )}
    </div>
  );
};

export default SupplierRatesTab;
