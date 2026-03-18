import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Clock, CheckCircle, Zap, AlertCircle, QrCode,
  Download, Copy, Mail, Smartphone, ExternalLink
} from "lucide-react";
import { useLanguage } from "@/contexts/language";

export type ActivationState = 'processing' | 'ready' | 'active' | 'expired' | 'error';

export function deriveActivationState(order: any, qrCode: any): ActivationState {
  if (order.status === 'failed' || order.payment_status === 'failed') return 'error';
  if (order.status === 'cancelled') return 'error';

  if (order.status !== 'completed' || order.payment_status !== 'succeeded') return 'processing';

  if (order.esim_delivered_at && order.duration_days) {
    const expiryMs =
      new Date(order.esim_delivered_at).getTime() + order.duration_days * 86400000;
    if (Date.now() > expiryMs) return 'expired';
  }

  if (order.esim_delivered_at && qrCode) {
    if (qrCode.status === 'active') return 'active';
    return 'ready';
  }

  return 'processing';
}

interface OrderActivationStateBlockProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  onDownloadESIM: (order: any) => void;
  onResendEmail?: (orderId: string) => void;
  onTopUp?: (order: any) => void;
  variant?: 'compact' | 'expanded';
}

const OrderActivationStateBlock = ({
  order,
  qrCode,
  canDownload,
  onDownloadESIM,
  onResendEmail,
  onTopUp,
  variant = 'compact',
}: OrderActivationStateBlockProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  const state = deriveActivationState(order, qrCode);
  const canTopUp = order.status === 'completed' && order.payment_status === 'succeeded' && !!order.esim_delivered_at;

  /* ── COMPACT VARIANT ───────────────────────────────────────────── */
  if (variant === 'compact') {
    if (state === 'ready') {
      return (
        <div className="mt-4 p-4 bg-palop-green/5 border border-palop-green/20 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-palop-green text-sm">{o.esimReady}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{o.esimReadyDesc}</p>
              <p className="text-xs text-gray-400 mt-1">💡 {o.qrNotice}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadESIM(order)}
                className="border-palop-green text-palop-green hover:bg-palop-green/10"
                data-testid={`button-view-qr-${order.id}`}
              >
                <QrCode className="h-4 w-4 mr-1.5" />
                {o.viewQR}
              </Button>
              <Button
                onClick={() => onDownloadESIM(order)}
                className="bg-palop-green hover:bg-palop-green/90 text-white"
                size="sm"
                data-testid={`button-download-esim-${order.id}`}
              >
                <Download className="h-4 w-4 mr-1.5" />
                {o.downloadESIM}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (state === 'active') {
      return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200/60 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-green-700 text-sm">{o.stateActiveTitle}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{o.esimReadyDesc}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadESIM(order)}
                className="border-green-600 text-green-700 hover:bg-green-50"
                data-testid={`button-view-qr-active-${order.id}`}
              >
                <QrCode className="h-4 w-4 mr-1.5" />
                {o.viewQR}
              </Button>
              {canTopUp && onTopUp && (
                <Button
                  onClick={() => onTopUp(order)}
                  variant="outline"
                  size="sm"
                  className="border-palop-green text-palop-green hover:bg-palop-green/10"
                  data-testid={`button-topup-${order.id}`}
                >
                  <Zap className="h-4 w-4 mr-1.5" />
                  {o.topUp}
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (state === 'expired') {
      return (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-gray-600 text-sm">{o.stateExpiredTitle}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{o.stateExpiredDesc}</p>
            </div>
            <Link to="/plans">
              <Button
                variant="outline"
                size="sm"
                className="border-palop-green text-palop-green hover:bg-palop-green/10 shrink-0"
                data-testid={`button-buy-new-${order.id}`}
              >
                {o.buyNewPlan}
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    if (state === 'error') {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-red-700 text-sm">{o.stateErrorTitle}</h4>
              <p className="text-xs text-red-600 mt-0.5">{o.stateErrorDesc}</p>
            </div>
            <Link to="/support">
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50 shrink-0"
                data-testid={`button-support-${order.id}`}
              >
                {o.talkToSupport}
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return null;
  }

  /* ── EXPANDED VARIANT ──────────────────────────────────────────── */

  if (state === 'processing') {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-100 rounded-full p-2 shrink-0 mt-0.5">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 text-sm">{o.stateProcessingTitle}</h4>
            <p className="text-xs text-yellow-700 mt-1 leading-relaxed">{o.stateProcessingDesc}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/support">
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-400 text-yellow-800 hover:bg-yellow-100 h-8 text-xs"
              data-testid={`button-support-processing-${order.id}`}
            >
              {o.talkToSupport}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'ready') {
    return (
      <div className="space-y-4">
        {/* State header */}
        <div className="rounded-lg border border-palop-green/25 bg-palop-green/5 p-5">
          <div className="flex items-start gap-3">
            <div className="bg-palop-green/15 rounded-full p-2 shrink-0 mt-0.5">
              <CheckCircle className="h-5 w-5 text-palop-green" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-palop-green text-sm">{o.stateReadyTitle}</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{o.stateReadyDesc}</p>
            </div>
          </div>

          {/* QR / Download actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={() => onDownloadESIM(order)}
              className="bg-palop-green hover:bg-palop-green/90 text-white h-8 text-xs"
              data-testid={`button-view-qr-expanded-${order.id}`}
            >
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              {o.viewQR}
            </Button>
            <Button
              onClick={() => onDownloadESIM(order)}
              variant="outline"
              className="border-palop-green text-palop-green hover:bg-palop-green/10 h-8 text-xs"
              data-testid={`button-download-expanded-${order.id}`}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {o.downloadESIM}
            </Button>
            {onResendEmail && (
              <Button
                onClick={() => onResendEmail(order.id)}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 h-8 text-xs"
                data-testid={`button-resend-${order.id}`}
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                {o.resendEmail}
              </Button>
            )}
          </div>

          {/* Email reassurance */}
          <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-palop-green shrink-0" />
            {o.emailReassurance}
          </p>
        </div>

        {/* Activation guide */}
        <ActivationGuide o={o} orderId={order.id} />
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className="space-y-4">
        {/* State header */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 shrink-0 mt-0.5">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-700 text-sm">{o.stateActiveTitle}</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{o.stateActiveDesc}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={() => onDownloadESIM(order)}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 h-8 text-xs"
              data-testid={`button-view-qr-active-expanded-${order.id}`}
            >
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              {o.viewQR}
            </Button>
            {canTopUp && onTopUp && (
              <Button
                onClick={() => onTopUp(order)}
                variant="outline"
                className="border-palop-green text-palop-green hover:bg-palop-green/10 h-8 text-xs"
                data-testid={`button-topup-active-${order.id}`}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                {o.topUp}
              </Button>
            )}
            {onResendEmail && (
              <Button
                onClick={() => onResendEmail(order.id)}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 h-8 text-xs"
                data-testid={`button-resend-active-${order.id}`}
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                {o.resendEmail}
              </Button>
            )}
          </div>

          <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-green-500 shrink-0" />
            {o.emailReassurance}
          </p>
        </div>

        {/* Activation guide */}
        <ActivationGuide o={o} orderId={order.id} />
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="bg-gray-200 rounded-full p-2 shrink-0 mt-0.5">
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 text-sm">{o.stateExpiredTitle}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{o.stateExpiredDesc}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/plans">
            <Button
              className="bg-palop-green hover:bg-palop-green/90 text-white h-8 text-xs"
              data-testid={`button-buy-new-expanded-${order.id}`}
            >
              {o.buyNewPlan}
            </Button>
          </Link>
          {canTopUp && onTopUp && (
            <Button
              onClick={() => onTopUp(order)}
              variant="outline"
              size="sm"
              className="border-palop-green text-palop-green hover:bg-palop-green/10 h-8 text-xs"
              data-testid={`button-topup-expired-${order.id}`}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              {o.topUp}
            </Button>
          )}
          <Link to="/support">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 h-8 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              {o.talkToSupport}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 rounded-full p-2 shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h4 className="font-semibold text-red-700 text-sm">{o.stateErrorTitle}</h4>
            <p className="text-xs text-red-600 mt-1 leading-relaxed">{o.stateErrorDesc}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/support">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
              data-testid={`button-support-error-${order.id}`}
            >
              {o.talkToSupport}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

/* ── Activation Guide (shared between ready + active) ─────────────── */
const ActivationGuide = ({ o, orderId }: { o: any; orderId: string }) => (
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
      ].map((step: string, i: number) => (
        <li key={i} className="flex gap-2.5">
          <span className="w-5 h-5 rounded-full bg-palop-green/10 text-palop-green text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
    <p className="mt-3 text-xs text-gray-400">{o.activationEmailHelper}</p>
    <p className="mt-1 text-xs text-gray-400">
      {o.activationSupport}{' '}
      <Link to="/support" className="text-palop-green hover:underline font-medium">
        {o.talkToSupport}
      </Link>
    </p>
  </div>
);

export default OrderActivationStateBlock;
