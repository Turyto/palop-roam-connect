import { useLanguage } from '@/contexts/language';
import { format } from 'date-fns';

interface OrderDetailsCardProps {
  order: any | null;
  email: string | null;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-2 text-sm">
    <dt className="text-gray-400 shrink-0 w-28">{label}</dt>
    <dd className="text-gray-700 font-medium break-all">{value}</dd>
  </div>
);

const OrderDetailsCard = ({ order, email }: OrderDetailsCardProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" data-testid="card-order-details">
      <h2 className="font-semibold text-gray-900 text-base mb-4">{o.detailsOrderTitle}</h2>

      <dl className="space-y-2.5">
        {email && (
          <Row label="Email" value={email} />
        )}
        {order?.id && (
          <Row
            label={o.orderId}
            value={order.id.slice(0, 8) + '…'}
          />
        )}
        {order?.plan_name && (
          <Row label={o.detailsPlanTitle} value={order.plan_name} />
        )}
        {order?.created_at && (
          <Row
            label={o.purchaseDate}
            value={format(new Date(order.created_at), 'dd MMM yyyy')}
          />
        )}
        {order?.duration_days && (
          <Row
            label={o.detailsValidity}
            value={o.detailsDays.replace('{days}', String(order.duration_days))}
          />
        )}
      </dl>

      {!order && !email && (
        <p className="text-sm text-gray-400">{o.emptyDesc}</p>
      )}
    </div>
  );
};

export default OrderDetailsCard;
