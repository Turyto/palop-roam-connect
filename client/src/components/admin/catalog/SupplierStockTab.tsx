import { useState } from 'react';
import { useSupplierInventory, SupplierInventoryFilters, SupplierInventoryItem, SupplierItemStatus } from '@/hooks/useSupplierInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  RefreshCw, AlertTriangle, Package, Wifi, Ban, Clock, Info,
  CheckCircle, XCircle, Eye, HelpCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<SupplierItemStatus, { label: string; className: string; icon: React.ReactNode }> = {
  available: { label: 'Available', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
  active:    { label: 'Active',    className: 'bg-blue-100 text-blue-800',  icon: <Wifi className="h-3 w-3" /> },
  expired:   { label: 'Expired',   className: 'bg-red-100 text-red-800',   icon: <XCircle className="h-3 w-3" /> },
  disabled:  { label: 'Disabled',  className: 'bg-gray-100 text-gray-600', icon: <Ban className="h-3 w-3" /> },
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes === 0) return '0 B';
  const gb = bytes / 1073741824;
  if (gb >= 1) return `${gb.toFixed(2).replace(/\.?0+$/, '')} GB`;
  const mb = bytes / 1048576;
  if (mb >= 1) return `${mb.toFixed(0)} MB`;
  return `${bytes} B`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const diffMs = d.getTime() - Date.now();
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays < 0) return `Expired ${Math.abs(diffDays)}d ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays}d`;
  } catch { return iso!; }
}

function formatSyncAge(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isSyncStale(iso: string | null | undefined): boolean {
  if (!iso) return true;
  return Date.now() - new Date(iso).getTime() > 7200000;
}

// Fallback: read a field from DB column, then raw_payload
function getField<T>(dbVal: T, rawKey: string, item: SupplierInventoryItem): T | any {
  if (dbVal !== null && dbVal !== undefined) return dbVal;
  return (item.raw_payload as any)?.[rawKey] ?? null;
}

// Resolve data fields — prefer DB columns, fall back to raw_payload
function resolveData(item: SupplierInventoryItem) {
  const raw = item.raw_payload as any ?? {};
  const pkg0 = Array.isArray(raw.packageList) ? raw.packageList[0] : null;

  const totalBytes: number | null = item.total_bytes ?? raw.totalVolume ?? pkg0?.volume ?? null;
  const usageBytes: number | null = item.usage_bytes ?? raw.orderUsage ?? null;
  const remainingBytes: number | null =
    item.remaining_bytes ??
    (totalBytes !== null && usageBytes !== null ? Math.max(0, totalBytes - usageBytes) : totalBytes);

  const expiresAt: string | null    = item.expires_at ?? raw.expiredTime ?? null;
  const activatedAt: string | null  = item.activated_at ?? raw.activateTime ?? raw.installationTime ?? null;
  const packageName: string | null  = item.package_name ?? pkg0?.packageName ?? null;
  const packageCode: string | null  = item.supplier_package_code ?? pkg0?.packageCode ?? null;
  const lpaCode: string | null      = item.lpa_code ?? raw.ac ?? null;
  const esimStatus: string | null   = item.esim_status ?? raw.esimStatus ?? null;
  const smdpStatus: string | null   = item.smdp_status ?? raw.smdpStatus ?? null;
  const orderNo: string | null      = item.order_no ?? raw.orderNo ?? null;
  const createdAt: string | null    = item.created_at_supplier ?? pkg0?.createTime ?? null;

  const usagePct = totalBytes && usageBytes !== null
    ? Math.min(100, Math.round((usageBytes / totalBytes) * 100)) : null;

  return { totalBytes, usageBytes, remainingBytes, expiresAt, activatedAt, packageName, packageCode, lpaCode, esimStatus, smdpStatus, orderNo, createdAt, usagePct };
}

// ---------------------------------------------------------------------------
// Details drawer
// ---------------------------------------------------------------------------
function DetailsDrawer({ item, onClose }: { item: SupplierInventoryItem; onClose: () => void }) {
  const [rawOpen, setRawOpen] = useState(false);
  const d = resolveData(item);
  const cfg = STATUS_CONFIG[item.status];

  const Field = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 font-medium pt-0.5">{label}</span>
      <span className={`text-sm text-gray-900 break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value ?? <span className="text-gray-400 italic">—</span>}
      </span>
    </div>
  );

  return (
    <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-base">eSIM Details</SheetTitle>
        {d.packageName && <p className="text-sm text-gray-500">{d.packageName}</p>}
      </SheetHeader>

      <div className="space-y-5">
        {/* Status */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className={`${cfg.className} flex items-center gap-1 text-xs`}>
              {cfg.icon} {cfg.label}
            </Badge>
            {d.esimStatus && (
              <Badge variant="outline" className="text-xs">{d.esimStatus}</Badge>
            )}
            {d.smdpStatus && (
              <Badge variant="outline" className="text-xs text-gray-500">{d.smdpStatus}</Badge>
            )}
            <span className="text-xs text-gray-400">activeType={item.raw_payload ? (item.raw_payload as any).activeType ?? '—' : '—'}</span>
          </div>
        </div>

        {/* Identity */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Identity</h3>
          <Field label="ICCID" value={item.iccid} mono />
          <Field label="Supplier Ref" value={item.supplier_item_id} mono />
          <Field label="Order No" value={d.orderNo} mono />
          <Field label="Package Code" value={d.packageCode} mono />
          <Field label="Package Name" value={d.packageName} />
        </div>

        {/* Data */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Data Usage</h3>
          {d.totalBytes !== null ? (
            <>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{formatBytes(d.remainingBytes)}</span> left of {formatBytes(d.totalBytes)}
                </span>
                {d.usagePct !== null && (
                  <span className="text-gray-400">{d.usagePct}% used</span>
                )}
              </div>
              {d.usagePct !== null && (
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${d.usagePct > 90 ? 'bg-red-500' : d.usagePct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${d.usagePct}%` }}
                  />
                </div>
              )}
            </>
          ) : <p className="text-sm text-gray-400">No data usage info available</p>}
          <Field label="Total" value={formatBytes(d.totalBytes)} />
          <Field label="Used" value={formatBytes(d.usageBytes)} />
          <Field label="Remaining" value={formatBytes(d.remainingBytes)} />
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dates</h3>
          <Field label="Expires" value={d.expiresAt ? `${formatDate(d.expiresAt)} (${formatRelativeDate(d.expiresAt)})` : null} />
          <Field label="Activated" value={formatDate(d.activatedAt)} />
          <Field label="Created" value={formatDate(d.createdAt)} />
          <Field label="Last Synced" value={formatSyncAge(item.last_synced_at)} />
        </div>

        {/* Plan match */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Plan Match</h3>
          {item.matched_plan_name ? (
            <Field label="Matched Plan" value={item.matched_plan_name} />
          ) : (
            <p className="text-sm text-orange-600">
              Unmatched — this eSIM's package is not mapped to an active PALOP Connect plan.
            </p>
          )}
        </div>

        {/* LPA */}
        {d.lpaCode && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">LPA / Install Code</h3>
            <p className="text-xs font-mono bg-gray-50 border rounded p-2 break-all">{d.lpaCode}</p>
          </div>
        )}

        {/* Raw payload */}
        <div>
          <button
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
            onClick={() => setRawOpen(o => !o)}
          >
            <Eye className="h-3 w-3" />
            {rawOpen ? 'Hide' : 'Show'} raw supplier payload
          </button>
          {rawOpen && (
            <pre className="mt-2 text-xs bg-gray-50 border rounded p-3 overflow-x-auto max-h-80">
              {JSON.stringify(item.raw_payload, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </SheetContent>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const SupplierStockTab = () => {
  const [filters, setFilters] = useState<SupplierInventoryFilters>({
    status: 'all',
    matched: 'all',
    search: '',
  });
  const [selectedItem, setSelectedItem] = useState<SupplierInventoryItem | null>(null);

  const { items, summary, latestSync, expiringAvailable, isLoading, triggerSync, isSyncing } =
    useSupplierInventory(filters);

  const syncedAt = latestSync?.completed_at ?? null;
  const stale = isSyncStale(syncedAt);

  return (
    <div className="space-y-5" data-testid="supplier-stock-tab">

      {/* Info note */}
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
        {[
          { label: 'Total',    value: summary.total,                     color: 'text-gray-900',   testId: 'stock-total' },
          { label: 'Available',value: summary.available,                 color: 'text-green-700',  testId: 'stock-available' },
          { label: 'Active',   value: summary.active,                    color: 'text-blue-700',   testId: 'stock-active' },
          { label: 'Expired',  value: summary.expired,                   color: 'text-red-700',    testId: 'stock-expired' },
          { label: 'Disabled', value: summary.disabled,                  color: 'text-gray-500',   testId: 'stock-disabled' },
          { label: 'Unmatched',value: summary.unmatched,                 color: 'text-orange-600', testId: 'stock-unmatched' },
        ].map(({ label, value, color, testId }) => (
          <Card key={label}>
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-500">{label}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className={`text-2xl font-bold ${color}`} data-testid={testId}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unmatched explanation */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <HelpCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          <strong>Unmatched</strong> means this supplier eSIM/package is not currently mapped to one of the active public PALOP Connect plans.
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={filters.status ?? 'all'} onValueChange={(v) => setFilters(f => ({ ...f, status: v as any }))}>
            <SelectTrigger className="w-36" data-testid="filter-status"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.matched ?? 'all'} onValueChange={(v) => setFilters(f => ({ ...f, matched: v as any }))}>
            <SelectTrigger className="w-36" data-testid="filter-matched"><SelectValue placeholder="Match" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              <SelectItem value="matched">Matched only</SelectItem>
              <SelectItem value="unmatched">Unmatched only</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search ICCID / package…"
            className="w-56"
            value={filters.search ?? ''}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            data-testid="filter-search"
          />
        </div>

        <Button onClick={() => triggerSync()} disabled={isSyncing} data-testid="button-sync-now" className="shrink-0">
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing…' : 'Sync Now'}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No items found</p>
          <p className="text-sm mt-1">
            {summary.total === 0 ? 'Click "Sync Now" to fetch eSIMs from your supplier account.' : 'Try changing the filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Package Name</TableHead>
                <TableHead className="min-w-[140px]">ICCID</TableHead>
                <TableHead className="min-w-[110px]">Supplier Ref</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[130px]">Data Left</TableHead>
                <TableHead className="min-w-[110px]">Valid Until</TableHead>
                <TableHead className="min-w-[130px]">Matched Plan</TableHead>
                <TableHead className="w-16">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const d = resolveData(item);
                const cfg = STATUS_CONFIG[item.status];
                const isExpiringSoon =
                  d.expiresAt &&
                  item.status === 'available' &&
                  new Date(d.expiresAt).getTime() - Date.now() < 7 * 86400000;

                return (
                  <TableRow key={item.id} data-testid={`row-stock-${item.id}`}>

                    {/* Package Name */}
                    <TableCell>
                      <div className="text-sm font-medium leading-tight">
                        {d.packageName ?? <span className="text-gray-400 italic">—</span>}
                      </div>
                      {d.packageCode && (
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{d.packageCode}</div>
                      )}
                    </TableCell>

                    {/* ICCID */}
                    <TableCell className="font-mono text-xs text-gray-700">
                      {item.iccid ? (
                        <span title={item.iccid}>
                          {item.iccid.length > 16
                            ? `${item.iccid.slice(0, 6)}…${item.iccid.slice(-6)}`
                            : item.iccid}
                        </span>
                      ) : <span className="text-gray-400 italic">—</span>}
                    </TableCell>

                    {/* Supplier Ref */}
                    <TableCell>
                      <div className="text-xs font-mono text-gray-600" title={item.supplier_item_id}>
                        {item.supplier_item_id}
                      </div>
                      {d.orderNo && (
                        <div className="text-xs text-gray-400 mt-0.5" title={d.orderNo}>
                          {d.orderNo.length > 14 ? `${d.orderNo.slice(0, 12)}…` : d.orderNo}
                        </div>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${cfg.className} flex items-center gap-1 w-fit text-xs`}>
                          {cfg.icon} {cfg.label}
                        </Badge>
                        {d.esimStatus && (
                          <span className="text-xs text-gray-400">{d.esimStatus}</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Data Left */}
                    <TableCell>
                      {d.totalBytes !== null ? (
                        <div>
                          <div className="text-sm">
                            <span className="font-semibold">{formatBytes(d.remainingBytes)}</span>
                            <span className="text-gray-400 text-xs"> / {formatBytes(d.totalBytes)}</span>
                          </div>
                          {d.usagePct !== null && (
                            <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1">
                              <div
                                className={`h-1.5 rounded-full ${d.usagePct > 90 ? 'bg-red-500' : d.usagePct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${d.usagePct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </TableCell>

                    {/* Valid Until */}
                    <TableCell>
                      {d.expiresAt ? (
                        <div>
                          <div className={`text-sm ${isExpiringSoon ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                            {formatRelativeDate(d.expiresAt)}
                          </div>
                          <div className="text-xs text-gray-400">{formatDate(d.expiresAt)}</div>
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </TableCell>

                    {/* Matched Plan */}
                    <TableCell>
                      {item.matched_plan_name ? (
                        <span className="text-sm text-gray-900">{item.matched_plan_name}</span>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                          Unmatched
                        </Badge>
                      )}
                    </TableCell>

                    {/* Details */}
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => setSelectedItem(item)}
                        data-testid={`button-details-${item.id}`}
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {items.length} item{items.length !== 1 ? 's' : ''} · Last synced {formatSyncAge(syncedAt)}
        </p>
      )}

      {/* Details drawer */}
      <Sheet open={!!selectedItem} onOpenChange={(o) => { if (!o) setSelectedItem(null); }}>
        {selectedItem && <DetailsDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </Sheet>

    </div>
  );
};

export default SupplierStockTab;
