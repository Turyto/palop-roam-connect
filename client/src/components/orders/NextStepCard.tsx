import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';
import { type ActivationState } from '@/components/order-history/OrderActivationStateBlock';
import { QrCode, Smartphone } from 'lucide-react';

interface NextStepCardProps {
  order: any | null;
  qrCode: any | null;
  dashboardState: ActivationState | null;
  onDownloadESIM: (order: any) => void;
}

const NextStepCard = ({ order, dashboardState, onDownloadESIM }: NextStepCardProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  const renderContent = () => {
    /* ── No plan ─────────────────────────────────────────── */
    if (!order || dashboardState === null) {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{o.emptyDesc}</p>
          <Button asChild className="w-full bg-palop-green hover:bg-palop-green/90 text-white" data-testid="button-nextstep-browse-plans">
            <Link to="/plans">{o.browsePlans}</Link>
          </Button>
        </>
      );
    }

    /* ── Processing ──────────────────────────────────────── */
    if (dashboardState === 'processing') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{o.stateProcessingDesc}</p>
          <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-800 hover:bg-yellow-50" data-testid="button-nextstep-processing-support">
            <Link to="/support?topic=no_esim">{o.talkToSupport}</Link>
          </Button>
        </>
      );
    }

    /* ── Ready ───────────────────────────────────────────── */
    if (dashboardState === 'ready') {
      const steps = [
        o.activationStep1,
        o.activationStep2,
        o.activationStep3,
        o.activationStep4,
        o.activationStep5,
      ];
      return (
        <>
          <ol className="space-y-2 mb-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-palop-green/10 text-palop-green text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Button
            onClick={() => onDownloadESIM(order)}
            className="w-full bg-palop-green hover:bg-palop-green/90 text-white"
            data-testid="button-nextstep-view-qr"
          >
            <QrCode className="h-4 w-4 mr-2" />
            {o.viewQR}
          </Button>
        </>
      );
    }

    /* ── Active ──────────────────────────────────────────── */
    if (dashboardState === 'active') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{o.stateActiveDescShort}</p>
          <Button
            onClick={() => onDownloadESIM(order)}
            variant="outline"
            className="w-full border-green-500 text-green-700 hover:bg-green-50"
            data-testid="button-nextstep-view-qr-active"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            {o.viewQR}
          </Button>
        </>
      );
    }

    /* ── Expired ─────────────────────────────────────────── */
    if (dashboardState === 'expired') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{o.stateExpiredDesc}</p>
          <Button asChild className="w-full bg-palop-green hover:bg-palop-green/90 text-white" data-testid="button-nextstep-buy-new">
            <Link to="/plans">{o.buyNewPlan}</Link>
          </Button>
        </>
      );
    }

    /* ── Error ───────────────────────────────────────────── */
    if (dashboardState === 'error') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{o.stateErrorDesc}</p>
          <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white" data-testid="button-nextstep-error-support">
            <Link to="/support?topic=activation">{o.talkToSupport}</Link>
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" data-testid="card-next-step">
      <h2 className="font-semibold text-gray-900 text-base mb-4">{o.nextStepTitle}</h2>
      {renderContent()}
    </div>
  );
};

export default NextStepCard;
