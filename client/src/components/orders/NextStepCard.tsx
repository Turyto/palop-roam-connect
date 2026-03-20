import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { type ActivationState } from '@/components/order-history/OrderActivationStateBlock';
import { type Order } from '@/hooks/orders/types';
import { type CustomerQRCode } from '@/hooks/useCustomerQRCodes';
import { QrCode, Smartphone } from 'lucide-react';

type OrderWithCoverage = Order & { coverage?: string };

interface NextStepLabels {
  nextStepTitle: string;
  emptyDesc: string;
  browsePlans: string;
  stateProcessingDesc: string;
  talkToSupport: string;
  activationStep1: string;
  activationStep2: string;
  activationStep3: string;
  activationStep4: string;
  activationStep5: string;
  viewQR: string;
  stateActiveDescShort: string;
  stateExpiredDesc: string;
  buyNewPlan: string;
  stateErrorDesc: string;
}

interface NextStepCardProps {
  order: OrderWithCoverage | null;
  qrCode: CustomerQRCode | null;
  dashboardState: ActivationState | null;
  onDownloadESIM: (order: OrderWithCoverage) => void;
  labels: NextStepLabels;
}

const NextStepCard = ({ order, dashboardState, onDownloadESIM, labels: l }: NextStepCardProps) => {
  const renderContent = () => {
    if (!order || dashboardState === null) {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{l.emptyDesc}</p>
          <Button asChild className="w-full bg-palop-green hover:bg-palop-green/90 text-white" data-testid="button-nextstep-browse-plans">
            <Link to="/plans">{l.browsePlans}</Link>
          </Button>
        </>
      );
    }

    if (dashboardState === 'processing') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{l.stateProcessingDesc}</p>
          <Button asChild variant="outline" className="w-full border-yellow-400 text-yellow-800 hover:bg-yellow-50" data-testid="button-nextstep-processing-support">
            <Link to="/support?topic=no_esim">{l.talkToSupport}</Link>
          </Button>
        </>
      );
    }

    if (dashboardState === 'ready') {
      const steps = [l.activationStep1, l.activationStep2, l.activationStep3, l.activationStep4, l.activationStep5];
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
            {l.viewQR}
          </Button>
        </>
      );
    }

    if (dashboardState === 'active') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{l.stateActiveDescShort}</p>
          <Button
            onClick={() => onDownloadESIM(order)}
            variant="outline"
            className="w-full border-green-500 text-green-700 hover:bg-green-50"
            data-testid="button-nextstep-view-qr-active"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            {l.viewQR}
          </Button>
        </>
      );
    }

    if (dashboardState === 'expired') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{l.stateExpiredDesc}</p>
          <Button asChild className="w-full bg-palop-green hover:bg-palop-green/90 text-white" data-testid="button-nextstep-buy-new">
            <Link to="/plans">{l.buyNewPlan}</Link>
          </Button>
        </>
      );
    }

    if (dashboardState === 'error') {
      return (
        <>
          <p className="text-sm text-gray-600 mb-4">{l.stateErrorDesc}</p>
          <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white" data-testid="button-nextstep-error-support">
            <Link to="/support?topic=activation">{l.talkToSupport}</Link>
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" data-testid="card-next-step">
      <h2 className="font-semibold text-gray-900 text-base mb-4">{l.nextStepTitle}</h2>
      {renderContent()}
    </div>
  );
};

export default NextStepCard;
