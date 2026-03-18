import OrderActions from "./OrderActions";
import { useLanguage } from "@/contexts/language";
import { Link } from "react-router-dom";
import { Smartphone } from "lucide-react";

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

      {/* B. eSIM actions (expanded variant) */}
      <OrderActions
        order={order}
        qrCode={qrCode}
        canDownload={canDownload}
        onDownloadESIM={onDownloadESIM}
        onResendEmail={onResendEmail}
        onTopUp={onTopUp}
        variant="expanded"
      />

      {/* C. Activation guide — only when eSIM is delivered */}
      {order.esim_delivered_at && (
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
          <h5 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-palop-green" />
            {o.activationTitle}
          </h5>
          <ol className="space-y-1.5 text-sm text-gray-600">
            {[
              o.activationStep1,
              o.activationStep2,
              o.activationStep3,
              o.activationStep4,
              o.activationStep5,
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-palop-green/10 text-palop-green text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-gray-400">
            {o.activationSupport}{' '}
            <Link to="/support" className="text-palop-green hover:underline font-medium">
              {o.talkToSupport}
            </Link>
          </p>
        </div>
      )}

      {/* D. Waiting state — if eSIM not yet delivered */}
      {!order.esim_delivered_at && order.status === 'completed' && order.payment_status === 'succeeded' && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-medium mb-0.5">{o.statusActivationInProgress}</p>
          <p className="text-yellow-700 text-xs">
            {o.activationSupport}{' '}
            <Link to="/support" className="text-palop-green hover:underline font-medium">
              {o.talkToSupport}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
