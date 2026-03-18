import { useLanguage } from "@/contexts/language";
import OrderActivationStateBlock from "./OrderActivationStateBlock";

interface OrderDetailsProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
  onTopUp?: (order: any) => void;
}

const getLocalizedOrderStatus = (status: string, o: any) => {
  switch (status) {
    case 'completed': return o.statusCompleted;
    case 'failed': return o.statusFailed;
    case 'cancelled': return o.statusCancelled;
    default: return o.statusProcessing;
  }
};

const getLocalizedPaymentStatus = (paymentStatus: string, esimDeliveredAt: string | null, o: any) => {
  if (paymentStatus === 'succeeded') {
    return esimDeliveredAt ? o.statusPaymentCompleted : o.statusActivationInProgress;
  }
  if (paymentStatus === 'failed') return o.statusFailed;
  return o.statusProcessing;
};

const OrderDetails = ({
  order,
  qrCode,
  canDownload,
  onDownloadESIM,
  onResendEmail,
  onTopUp
}: OrderDetailsProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  const localizedOrderStatus = getLocalizedOrderStatus(order.status, o);
  const localizedPaymentStatus = getLocalizedPaymentStatus(order.payment_status, order.esim_delivered_at, o);
  const durationText = o.detailsDays.replace('{days}', String(order.duration_days ?? '—'));

  return (
    <div className="space-y-5">

      {/* A. Plan details + Order info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-2">
          <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">{o.detailsPlanTitle}</h5>
          <div className="space-y-1.5 text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">{o.detailsDataAllowance}</span>
              <span className="font-medium text-gray-800">{order.data_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{o.detailsValidity}</span>
              <span className="font-medium text-gray-800">{durationText}</span>
            </div>
            {order.coverage && (
              <div className="flex justify-between">
                <span className="text-gray-400">{o.detailsCoverage}</span>
                <span className="font-medium text-gray-800">{order.coverage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-2">
          <h5 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">{o.detailsOrderTitle}</h5>
          <div className="space-y-1.5 text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">{o.detailsOrderStatus}</span>
              <span className="font-medium text-gray-800">{localizedOrderStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{o.detailsPaymentStatus}</span>
              <span className="font-medium text-gray-800">{localizedPaymentStatus}</span>
            </div>
            {order.payment_intent_id && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-400 shrink-0">{o.detailsPaymentId}</span>
                <span className="font-mono text-xs text-gray-500 truncate">{order.payment_intent_id.slice(0, 20)}…</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* B. Activation state block (expanded) */}
      <OrderActivationStateBlock
        order={order}
        qrCode={qrCode}
        canDownload={canDownload}
        onDownloadESIM={onDownloadESIM}
        onResendEmail={onResendEmail}
        onTopUp={onTopUp}
        variant="expanded"
      />
    </div>
  );
};

export default OrderDetails;
