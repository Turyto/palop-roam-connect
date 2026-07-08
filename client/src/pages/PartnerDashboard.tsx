import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/language';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Euro, Package, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { formatEUR, type PartnerDashboardData } from '@/hooks/usePartnerDashboard';

interface Props {
  data: PartnerDashboardData | undefined;
  isLoading: boolean;
}

const PartnerDashboard = ({ data, isLoading }: Props) => {
  const { t } = useLanguage();
  const p = t.partner;

  const cards = [
    { key: 'earned', label: p.cardEarned, value: data?.summary.commission_total_earned, icon: TrendingUp, accent: 'text-palop-green' },
    { key: 'pending', label: p.cardPending, value: data?.summary.commission_total_pending, icon: Clock, accent: 'text-amber-600' },
    { key: 'paid', label: p.cardPaid, value: data?.summary.commission_total_paid, icon: CheckCircle2, accent: 'text-palop-green' },
    { key: 'consignment-pending', label: p.cardConsignmentPending, value: data?.summary.consignment_total_pending, icon: Clock, accent: 'text-amber-600' },
    { key: 'consignment-paid', label: p.cardConsignmentPaid, value: data?.summary.consignment_total_paid, icon: CheckCircle2, accent: 'text-palop-green' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-48" data-testid="skeleton-partner-header" />
          ) : (
            <>
              <h2 className="text-2xl font-semibold" data-testid="text-partner-label">
                {data?.partner.label}
              </h2>
              <p className="text-sm text-gray-500" data-testid="text-partner-code">
                {p.codeLabel}: <span className="font-mono font-medium">{data?.partner.code}</span>
                <span className="mx-2">·</span>
                {p.totalSalesLabel}: <span className="font-medium" data-testid="text-partner-sales-count">{data?.partner.total_sales_count}</span>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.key} data-testid={`card-partner-${c.key}`}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Icon className={`h-4 w-4 ${c.accent}`} />
                  {c.label}
                </div>
                {isLoading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className="text-xl font-semibold" data-testid={`text-partner-${c.key}-value`}>
                    {formatEUR(c.value)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild data-testid="button-go-commissions">
          <Link to="/partner/commissions">
            <Euro className="h-4 w-4 mr-2" />
            {p.goCommissions}
          </Link>
        </Button>
        <Button asChild variant="outline" data-testid="button-go-consignment">
          <Link to="/partner/consignment">
            <Package className="h-4 w-4 mr-2" />
            {p.goConsignment}
          </Link>
        </Button>
      </div>

      <p className="text-xs text-gray-400">{p.readOnlyNote}</p>
    </div>
  );
};

export default PartnerDashboard;
