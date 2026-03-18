import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Eye, Copy, QrCode, Mail, Zap, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/language";

interface OrderActionsProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
  onTopUp?: (order: any) => void;
  variant?: 'compact' | 'expanded';
}

const OrderActions = ({
  order,
  qrCode,
  canDownload,
  onDownloadESIM,
  onResendEmail,
  onTopUp,
  variant = 'compact'
}: OrderActionsProps) => {
  const { t } = useLanguage();
  const o = t.orders;

  const canTopUp = order.status === 'completed' && order.payment_status === 'succeeded';

  const handleDownloadReceipt = () => {
    console.log('Download receipt for order:', order.id);
  };

  if (variant === 'compact') {
    if (canDownload) {
      return (
        <div className="mt-4 p-4 bg-palop-green/5 border border-palop-green/20 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-palop-green text-sm">{o.esimReady}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{o.esimReadyDesc}</p>
              <p className="text-xs text-gray-400 mt-1">💡 {o.qrNotice}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadESIM(order)}
                      className="border-palop-green text-palop-green hover:bg-palop-green/10"
                      data-testid={`button-view-qr-${order.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      {o.viewQR}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>View your eSIM QR code for installation</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                onClick={() => onDownloadESIM(order)}
                className="bg-palop-green hover:bg-palop-green/90 text-white"
                size="sm"
                data-testid={`button-download-esim-${order.id}`}
              >
                <Download className="h-4 w-4 mr-1.5" />
                {o.downloadESIM}
              </Button>

              {canTopUp && onTopUp && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => onTopUp(order)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        data-testid={`button-topup-${order.id}`}
                      >
                        <Zap className="h-4 w-4 mr-1.5" />
                        {o.topUp}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{o.topUpDesc}</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (canTopUp && onTopUp) {
      return (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">{o.topUp}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{o.topUpDesc}</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onTopUp(order)}
                    variant="outline"
                    size="sm"
                    className="border-palop-green text-palop-green hover:bg-palop-green/10 shrink-0"
                    data-testid={`button-topup-${order.id}`}
                  >
                    <Zap className="h-4 w-4 mr-1.5" />
                    {o.topUp}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{o.topUpDesc}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      );
    }

    return null;
  }

  if (canDownload || canTopUp) {
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-2">eSIM Actions</h4>
        <div className="flex flex-wrap gap-2">
          {canDownload && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => onDownloadESIM(order)}>
                      <QrCode className="h-4 w-4 mr-2" />{o.viewQR}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Display QR code for eSIM installation</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => onDownloadESIM(order)}>
                      <Copy className="h-4 w-4 mr-2" />Copy Activation URL
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Copy activation URL to clipboard</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => onResendEmail(order.id)}>
                      <Mail className="h-4 w-4 mr-2" />{o.resendEmail}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Resend eSIM details to your email</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
                      <FileText className="h-4 w-4 mr-2" />Download Receipt
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Download purchase receipt (PDF)</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          {canTopUp && onTopUp && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTopUp(order)}
                    className="border-palop-green/50 text-palop-green hover:bg-palop-green/10"
                  >
                    <Zap className="h-4 w-4 mr-2" />{o.topUp}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{o.topUpDesc}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default OrderActions;
