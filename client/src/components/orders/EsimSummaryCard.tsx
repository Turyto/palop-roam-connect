import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { type ActivationState } from '@/components/order-history/OrderActivationStateBlock';
import { type Order } from '@/hooks/orders/types';
import { type CustomerQRCode } from '@/hooks/useCustomerQRCodes';
import { format } from 'date-fns';
import { ShoppingBag, QrCode, AlertCircle, Clock } from 'lucide-react';

type OrderWithCoverage = Order & { coverage?: string };

interface EsimSummaryLabels {
  noActivePlan: string;
  emptyDesc: string;
  buyEsim: string;
  stateProcessingTitle: string;
  stateReadyTitle: string;
  stateActiveTitle: string;
  stateExpiredTitle: string;
  stateErrorTitle: string;
  detailsCoverage: string;
  detailsValidity: string;
  validFor: string;
  purchaseDate: string;
  viewQR: string;
  buyNewPlan: string;
  talkToSupport: string;
}

interface EsimSummaryCardProps {
  order: OrderWithCoverage | null;
  qrCode: CustomerQRCode | null;
  dashboardState: ActivationState | null;
  onDownloadESIM: (order: OrderWithCoverage) => void;
  labels: EsimSummaryLabels;
}

const STATUS_CONFIG = (l: EsimSummaryLabels): Record<ActivationState | 'none', { label: string; badgeClass: string }> => ({
  none:       { label: l.noActivePlan,         badgeClass: 'bg-gray-100 text-gray-500' },
  processing: { label: l.stateProcessingTitle, badgeClass: 'bg-yellow-100 text-yellow-700' },
  ready:      { label: l.stateReadyTitle,      badgeClass: 'bg-palop-green/10 text-palop-green' },
  active:     { label: l.stateActiveTitle,     badgeClass: 'bg-green-100 text-green-700' },
  expired:    { label: l.stateExpiredTitle,    badgeClass: 'bg-gray-100 text-gray-600' },
  error:      { label: l.stateErrorTitle,      badgeClass: 'bg-red-100 text-red-700' },
});

const EsimSummaryCard = ({ order, dashboardState, onDownloadESIM, labels: l }: EsimSummaryCardProps) => {
  const stateKey = dashboardState ?? 'none';
  const config = STATUS_CONFIG(l)[stateKey];

  if (!order) {
    return (
      <div
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center"
        data-testid="card-esim-summary"
      >
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="h-7 w-7 text-gray-400" />
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${config.badgeClass}`}>
          {config.label}
        </span>
        <p className="text-gray-500 text-sm mb-5 max-w-xs">{l.emptyDesc}</p>
        <Button asChild className="bg-palop-green hover:bg-palop-green/90 text-white" data-testid="button-buy-esim">
          <Link to="/plans">{l.buyEsim}</Link>
        </Button>
      </div>
    );
  }

  const validityText = order.duration_days
    ? l.validFor.replace('{days}', String(order.duration_days))
    : null;

  const purchaseDateText = order.created_at
    ? format(new Date(order.created_at), 'dd MMM yyyy')
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" data-testid="card-esim-summary">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 text-base leading-snug">{order.plan_name}</h2>
          {order.data_amount && (
            <p className="text-xs text-gray-400 mt-0.5">{order.data_amount}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${config.badgeClass}`}
          data-testid="status-esim-badge"
        >
          {config.label}
        </span>
      </div>

      <dl className="space-y-1.5 text-sm mb-5">
        {order.coverage && (
          <div className="flex gap-2">
            <dt className="text-gray-400 shrink-0 w-24">{l.detailsCoverage}</dt>
            <dd className="text-gray-700 font-medium">{order.coverage}</dd>
          </div>
        )}
        {validityText && (
          <div className="flex gap-2">
            <dt className="text-gray-400 shrink-0 w-24">{l.detailsValidity}</dt>
            <dd className="text-gray-700 font-medium">{validityText}</dd>
          </div>
        )}
        {purchaseDateText && (
          <div className="flex gap-2">
            <dt className="text-gray-400 shrink-0 w-24">{l.purchaseDate}</dt>
            <dd className="text-gray-700 font-medium">{purchaseDateText}</dd>
          </div>
        )}
      </dl>

      {dashboardState === 'ready' && (
        <Button
          onClick={() => onDownloadESIM(order)}
          className="w-full bg-palop-green hover:bg-palop-green/90 text-white"
          data-testid="button-summary-view-qr"
        >
          <QrCode className="h-4 w-4 mr-2" />
          {l.viewQR}
        </Button>
      )}
      {dashboardState === 'active' && (
        <Button
          onClick={() => onDownloadESIM(order)}
          variant="outline"
          className="w-full border-green-500 text-green-700 hover:bg-green-50"
          data-testid="button-summary-view-qr-active"
        >
          <QrCode className="h-4 w-4 mr-2" />
          {l.viewQR}
        </Button>
      )}
      {dashboardState === 'expired' && (
        <Button asChild variant="outline" className="w-full border-palop-green text-palop-green hover:bg-palop-green/10" data-testid="button-summary-buy-new">
          <Link to="/plans">{l.buyNewPlan}</Link>
        </Button>
      )}
      {dashboardState === 'processing' && (
        <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-800 hover:bg-yellow-50" data-testid="button-summary-processing-support">
          <Link to="/support?topic=no_esim">
            <Clock className="h-4 w-4 mr-2" />
            {l.talkToSupport}
          </Link>
        </Button>
      )}
      {dashboardState === 'error' && (
        <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white" data-testid="button-summary-error-support">
          <Link to="/support?topic=activation">
            <AlertCircle className="h-4 w-4 mr-2" />
            {l.talkToSupport}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default EsimSummaryCard;
