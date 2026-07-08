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

const PartnerCommissions = ({ data, isLoading }: Props) => {
  const { t } = useLanguage();
  const p = t.partner;
  const rows = data?.commissions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-commissions-title">{p.commissionsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2" data-testid="skeleton-commissions">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-sm py-4" data-testid="text-commissions-empty">
            {p.emptyCommissions}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{p.colDate}</TableHead>
                  <TableHead>{p.colOrderRef}</TableHead>
                  <TableHead>{p.colCustomer}</TableHead>
                  <TableHead className="text-right">{p.colRate}</TableHead>
                  <TableHead className="text-right">{p.colAmount}</TableHead>
                  <TableHead>{p.colStatus}</TableHead>
                  <TableHead>{p.colPaidDate}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} data-testid={`row-commission-${r.id}`}>
                    <TableCell>{formatDate(r.commission_date)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.order_id ? r.order_id.slice(0, 8) : '—'}
                    </TableCell>
                    <TableCell>{r.customer_name ?? '—'}</TableCell>
                    <TableCell className="text-right">{Math.round(Number(r.rate) * 100)}%</TableCell>
                    <TableCell className="text-right font-medium">{formatEUR(r.amount)}</TableCell>
                    <TableCell>
                      {r.status === 'paid' ? (
                        <Badge className="bg-palop-green text-white hover:bg-palop-green" data-testid={`badge-commission-status-${r.id}`}>{p.statusPaid}</Badge>
                      ) : r.status === 'cancelled' ? (
                        <Badge variant="secondary" data-testid={`badge-commission-status-${r.id}`}>{p.statusCancelled}</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600" data-testid={`badge-commission-status-${r.id}`}>{p.statusPending}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{r.status === 'paid' ? formatDate(r.paid_at) : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow data-testid="row-commissions-totals">
                  <TableCell colSpan={4} className="font-medium">{p.totalsLabel}</TableCell>
                  <TableCell colSpan={3} className="text-right text-sm">
                    <span className="mr-4">{p.totalEarned}: <strong data-testid="text-commissions-total-earned">{formatEUR(data?.summary.commission_total_earned)}</strong></span>
                    <span className="mr-4">{p.totalPaid}: <strong data-testid="text-commissions-total-paid">{formatEUR(data?.summary.commission_total_paid)}</strong></span>
                    <span>{p.totalPending}: <strong data-testid="text-commissions-total-pending">{formatEUR(data?.summary.commission_total_pending)}</strong></span>
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

export default PartnerCommissions;
