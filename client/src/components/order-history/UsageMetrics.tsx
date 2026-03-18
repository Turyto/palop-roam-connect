import { useLanguage } from "@/contexts/language";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface UsageMetricsProps {
  order: any;
}

const UsageMetrics = ({ order }: UsageMetricsProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  if (order.status !== 'completed' || order.payment_status !== 'succeeded' || !order.esim_delivered_at) {
    return null;
  }

  const deliveredDate = new Date(order.esim_delivered_at);
  const expiryDate = new Date(deliveredDate.getTime() + order.duration_days * 24 * 60 * 60 * 1000);
  const durationText = o.detailsDays.replace('{days}', String(order.duration_days ?? '—'));

  return (
    <div className="bg-palop-green/5 border border-palop-green/15 rounded-lg p-4 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-palop-green" />
        <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">{o.detailsValidity}</h5>
      </div>
      <div className="grid grid-cols-2 gap-3 text-gray-600">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{o.detailsDataAllowance}</div>
          <div className="font-semibold text-gray-900">{order.data_amount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{o.detailsValidity}</div>
          <div className="font-semibold text-gray-900">{durationText}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{o.esimDeliveredAt}</div>
          <div className="font-medium text-gray-800">{format(deliveredDate, 'dd MMM yyyy')}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">{o.activeUntil}</div>
          <div className="font-medium text-gray-800">{format(expiryDate, 'dd MMM yyyy')}</div>
        </div>
      </div>
    </div>
  );
};

export default UsageMetrics;
