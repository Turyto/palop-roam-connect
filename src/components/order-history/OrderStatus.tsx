
import { Badge } from "@/components/ui/badge";

interface OrderStatusProps {
  order: any;
  qrCode: any;
}

const OrderStatus = ({ order, qrCode }: OrderStatusProps) => {
  const getConsolidatedStatus = (order: any, qrCode: any) => {
    console.log('Getting status for order:', order.id, 'QR Code:', qrCode);
    
    // If order is completed and payment succeeded, check eSIM delivery
    if (order.status === 'completed' && order.payment_status === 'succeeded') {
      if (order.esim_delivered_at) {
        if (qrCode?.status === 'active') {
          return { status: 'Active', color: 'bg-green-100 text-green-800', icon: '🟢' };
        }
        return { status: 'Ready to activate', color: 'bg-blue-100 text-blue-800', icon: '🟡' };
      }
      return { status: 'Processing eSIM', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
    }
    
    if (order.status === 'failed' || order.payment_status === 'failed') {
      return { status: 'Failed', color: 'bg-red-100 text-red-800', icon: '🔴' };
    }
    
    if (order.status === 'cancelled') {
      return { status: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: '⚫' };
    }
    
    return { status: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
  };

  const consolidatedStatus = getConsolidatedStatus(order, qrCode);

  return (
    <Badge className={consolidatedStatus.color}>
      {consolidatedStatus.icon} {consolidatedStatus.status}
    </Badge>
  );
};

export default OrderStatus;
