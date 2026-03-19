import { useState } from 'react';
import { useSupplierInventory, SupplierInventoryFilters, SupplierItemStatus } from '@/hooks/useSupplierInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  RefreshCw, AlertTriangle, Package, Wifi, Ban, Clock, Info, CheckCircle, XCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status presentation helpers (read-only display layer only)
// Mapping logic lives in sync-supplier-inventory/index.ts
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<SupplierItemStatus, { label: string; className: string; icon: React.ReactNode }> = {
  available: {
    label: 'Available',
    className: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  active: {
    label: 'Active',
    className: 'bg-blue-100 text-blue-800',
    icon: <Wifi className="h-3 w-3" />,
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-3 w-3" />,
  },
  disabled: {
    label: 'Disabled',
    className: 'bg-gray-100 text-gray-600',
    icon: <Ban className="h-3 w-3" />,
  },
};

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes === 0) return '0 B';
  const gb = bytes / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(0)} MB`;
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'today';
  return `in ${diffDays}d`;
}

function formatSyncAge(iso: string | null): string {
  if (!iso) return 'Never synced';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isSyncStale(iso: string | null): boolean {
  if (!iso) return true;
  return Date.now() - new Date(iso).getTime() > 2 * 60 * 60 * 1000;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SupplierStockTab = () => {
  const [filters, setFilters] = useState<SupplierInventoryFilters>({
    status: 'all',
    matched: 'all',
    search: '',
  });

  const {
    items,
    summary,
    latestSync,
    expiringAvailable,
    isLoading,
    triggerSync,
    isSyncing,
  } = useSupplierInventory(filters);

  const syncedAt = latestSync?.completed_at ?? null;
  const stale = isSyncStale(syncedAt);

  return (
    <div className="space-y-5" data-testid="supplier-stock-tab">

      {/* Info callout */}
      <div className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          This shows eSIMs held in your supplier account — not the public plan catalog.
          It does not affect customer checkout or provisioning.
        </span>
      </div>

      {/* Staleness warning */}
      {stale && (
        <div className="flex items-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Stock data may be stale — {syncedAt ? `last synced ${formatSyncAge(syncedAt)}` : 'never synced'}.
            Click <strong>Sync Now</strong> to refresh.
          </span>
        </div>
      )}

      {/* Expiry warning */}
      {expiringAvailable.length > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{expiringAvailable.length} available eSIM{expiringAvailable.length > 1 ? 's' : ''}</strong> expire
            within 7 days — unused stock at risk.
          </span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold" data-testid="stock-total">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-500">Available</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-green-700" data-testid="stock-available">{summary.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-blue-700" data-testid="stock-active">{summary.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-500">Expired / Disabled</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-red-700" data-testid="stock-dead">
              {summary.expired + summary.disabled}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-500">Unmatched</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-2xl font-bold text-orange-600" data-testid="stock-unmatched">{summary.unmatched}</div>
            <p className="text-xs text-gray-400 mt-0.5">no plan match</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Last Synced
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-sm font-semibold">{formatSyncAge(syncedAt)}</div>
            {latestSync?.status === 'failed' && (
              <p className="text-xs text-red-600 mt-0.5">Last sync failed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(v) => setFilters(f => ({ ...f, status: v as any }))}
          >
            <SelectTrigger className="w-36" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>

          {/* Matched filter */}
          <Select
            value={filters.matched ?? 'all'}
            onValueChange={(v) => setFilters(f => ({ ...f, matched: v as any }))}
          >
            <SelectTrigger className="w-36" data-testid="filter-matched">
              <SelectValue placeholder="Match" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              <SelectItem value="matched">Matched only</SelectItem>
              <SelectItem value="unmatched">Unmatched only</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <Input
            placeholder="Search ICCID / package…"
            className="w-56"
            value={filters.search ?? ''}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            data-testid="filter-search"
          />
        </div>

        <Button
          onClick={() => triggerSync()}
          disabled={isSyncing}
          data-testid="button-sync-now"
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing…' : 'Sync Now'}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No items found</p>
          <p className="text-sm mt-1">
            {summary.total === 0
              ? 'Click "Sync Now" to fetch eSIMs from your supplier account.'
              : 'Try changing the filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">ICCID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="min-w-[160px]">Package</TableHead>
                <TableHead className="min-w-[120px]">Matched Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[110px]">Data</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Last Synced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const cfg = STATUS_CONFIG[item.status];
                const expiryLabel = formatRelativeDate(item.expires_at);
                const isExpiringWarn =
                  item.status === 'available' &&
                  item.expires_at &&
                  new Date(item.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                return (
                  <TableRow key={item.id} data-testid={`row-stock-${item.id}`}>
                    <TableCell className="font-mono text-xs">
                      {item.iccid ? (
                        <span title={item.iccid}>
                          {item.iccid.length > 16
                            ? `${item.iccid.slice(0, 8)}…${item.iccid.slice(-6)}`
                            : item.iccid}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.supplier_name === 'esim_access' ? 'eSIM Access' : item.supplier_name}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium">{item.package_name ?? '—'}</div>
                      {item.supplier_package_code && (
                        <div className="text-xs text-gray-400 font-mono">{item.supplier_package_code}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      {item.matched_plan_name ? (
                        <span className="text-sm text-gray-900">{item.matched_plan_name}</span>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                          Unmatched
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge className={`${cfg.className} flex items-center gap-1 w-fit text-xs`}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {item.total_bytes ? (
                        <div className="text-sm">
                          <span className="font-medium">{formatBytes(item.remaining_bytes)}</span>
                          <span className="text-gray-400"> / {formatBytes(item.total_bytes)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {item.expires_at ? (
                        <span className={`text-sm ${isExpiringWarn ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                          {expiryLabel}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-gray-500">
                      {formatSyncAge(item.last_synced_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer: showing count */}
      {items.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {items.length} item{items.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default SupplierStockTab;
