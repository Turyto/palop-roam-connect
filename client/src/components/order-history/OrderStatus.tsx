import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language";

interface OrderStatusProps {
  order: any;
  qrCode: any;
}

const OrderStatus = ({ order, qrCode }: OrderStatusProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  const getConsolidatedStatus = (order: any, qrCode: any) => {
    if (order.status === 'completed' && order.payment_status === 'succeeded') {
      if (order.esim_delivered_at) {
        if (qrCode?.status === 'active') {
          return { label: o.statusActive, color: 'bg-green-100 text-green-800 border-green-200' };
        }
        return { label: o.statusReadyToActivate, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      }
      return { label: o.statusProcessing, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }

    if (order.status === 'failed' || order.payment_status === 'failed') {
      return { label: o.statusFailed, color: 'bg-red-100 text-red-800 border-red-200' };
    }

    if (order.status === 'cancelled') {
      return { label: o.statusCancelled, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    }

    return { label: o.statusProcessing, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  };

  const { label, color } = getConsolidatedStatus(order, qrCode);

  return (
    <Badge className={`${color} font-medium border text-xs px-2.5 py-0.5`}>
      {label}
    </Badge>
  );
};

export default OrderStatus;
