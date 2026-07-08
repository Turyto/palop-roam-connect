import { useLanguage } from '@/contexts/language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from '@/components/ui/table';
import { formatEUR, formatDate, type PartnerDashboardData } from '@/hooks/usePartnerDashboard';

interface Props {
  data: PartnerDashboardData | undefined;
  isLoading: boolean;
}

const PartnerConsignment = ({ data, isLoading }: Props) => {
  const { t } = useLanguage();
  const p = t.partner;
  const rows = data?.consignment_orders ?? [];
  const pendingTotal = data?.summary.consignment_total_pending ?? 0;
  const paidTotal = data?.summary.consignment_total_paid ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-consignment-title">{p.consignmentTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2" data-testid="skeleton-consignment">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-sm py-4" data-testid="text-consignment-empty">
            {p.emptyConsignment}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{p.colDate}</TableHead>
                  <TableHead>{p.colBatch}</TableHead>
                  <TableHead>{p.colPlan}</TableHead>
                  <TableHead className="text-right">{p.colQty}</TableHead>
                  <TableHead className="text-right">{p.colUnitPrice}</TableHead>
                  <TableHead className="text-right">{p.colTotal}</TableHead>
                  <TableHead>{p.colStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} data-testid={`row-consignment-${r.id}`}>
                    <TableCell>{formatDate(r.created_at)}</TableCell>
                    <TableCell className="font-mono text-xs">{r.batch_id ?? '—'}</TableCell>
                    <TableCell>{r.plan_name}</TableCell>
                    <TableCell className="text-right">{r.quantity}</TableCell>
                    <TableCell className="text-right">{formatEUR(r.unit_price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatEUR(r.total_value)}</TableCell>
                    <TableCell>
                      {r.status === 'paid' ? (
                        <Badge className="bg-palop-green text-white hover:bg-palop-green" data-testid={`badge-consignment-status-${r.id}`}>{p.statusPaid}</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600" data-testid={`badge-consignment-status-${r.id}`}>{p.statusPending}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow data-testid="row-consignment-totals">
                  <TableCell colSpan={4} className="font-medium">{p.totalsLabel}</TableCell>
                  <TableCell colSpan={3} className="text-right text-sm">
                    <span className="mr-4">{p.totalPending}: <strong data-testid="text-consignment-total-pending">{formatEUR(pendingTotal)}</strong></span>
                    <span className="mr-4">{p.totalPaid}: <strong data-testid="text-consignment-total-paid">{formatEUR(paidTotal)}</strong></span>
                    <span>{p.grandTotal}: <strong data-testid="text-consignment-grand-total">{formatEUR(pendingTotal + paidTotal)}</strong></span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerConsignment;
