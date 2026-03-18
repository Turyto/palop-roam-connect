import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language";
import { deriveActivationState } from "./OrderActivationStateBlock";

interface OrderStatusProps {
  order: any;
  qrCode: any;
}

const OrderStatus = ({ order, qrCode }: OrderStatusProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  if (order.status === 'cancelled') {
    return (
      <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-medium border text-xs px-2.5 py-0.5">
        {o.statusCancelled}
      </Badge>
    );
  }

  const state = deriveActivationState(order, qrCode);

  const config: Record<string, { label: string; color: string }> = {
    processing: { label: o.statusProcessing,      color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    ready:      { label: o.statusReadyToActivate, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    active:     { label: o.statusActive,          color: 'bg-green-100 text-green-800 border-green-200' },
    expired:    { label: o.statusExpired,         color: 'bg-gray-100 text-gray-500 border-gray-200' },
    error:      { label: o.statusFailed,          color: 'bg-red-100 text-red-800 border-red-200' },
  };

  const { label, color } = config[state];

  return (
    <Badge className={`${color} font-medium border text-xs px-2.5 py-0.5`}>
      {label}
    </Badge>
  );
};

export default OrderStatus;
