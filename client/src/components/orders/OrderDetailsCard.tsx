import { format } from 'date-fns';
import type { Order } from '@/hooks/orders/types';

interface OrderDetailsLabels {
  detailsOrderTitle: string;
  orderId: string;
  detailsPlanTitle: string;
  purchaseDate: string;
  detailsValidity: string;
  detailsDays: string;
  emptyDesc: string;
}

interface OrderDetailsCardProps {
  order: Order | null;
  email: string | null;
  labels: OrderDetailsLabels;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-2 text-sm">
    <dt className="text-gray-400 shrink-0 w-28">{label}</dt>
    <dd className="text-gray-700 font-medium break-all">{value}</dd>
  </div>
);

const OrderDetailsCard = ({ order, email, labels: l }: OrderDetailsCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" data-testid="card-order-details">
      <h2 className="font-semibold text-gray-900 text-base mb-4">{l.detailsOrderTitle}</h2>

      <dl className="space-y-2.5">
        {email && (
          <Row label="Email" value={email} />
        )}
        {order?.id && (
          <Row label={l.orderId} value={order.id.slice(0, 8) + '…'} />
        )}
        {(order as any)?.plan_name && (
          <Row label={l.detailsPlanTitle} value={(order as any).plan_name} />
        )}
        {order?.created_at && (
          <Row
            label={l.purchaseDate}
            value={format(new Date(order.created_at), 'dd MMM yyyy')}
          />
        )}
        {(order as any)?.duration_days && (
          <Row
            label={l.detailsValidity}
            value={l.detailsDays.replace('{days}', String((order as any).duration_days))}
          />
        )}
      </dl>

      {!order && !email && (
        <p className="text-sm text-gray-400">{l.emptyDesc}</p>
      )}
    </div>
  );
};

export default OrderDetailsCard;
