
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, QrCode, ExternalLink, Smartphone, CheckCircle, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language";

interface ESIMActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activationUrl: string;
  orderId: string;
  planName?: string;
  dataAmount?: string;
  status: 'pending' | 'active' | 'revoked';
  activationCode?: string;
  iccid?: string;
  coverage?: string;
}

const ESIMActivationModal = ({
  isOpen,
  onClose,
  activationUrl,
  orderId,
  planName,
  dataAmount,
  status,
  activationCode,
  iccid,
  coverage,
}: ESIMActivationModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const o = t.orders;

  const handleDownload = () => {
    try {
      const svg = document.querySelector('#esim-qr-code svg') as SVGElement;
      if (svg) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          canvas.width = 400;
          canvas.height = 400;
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 400, 400);
            ctx.drawImage(img, 50, 50, 300, 300);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `esim-qr-${orderId.slice(0, 8)}.png`;
              link.href = URL.createObjectURL(blob);
              link.click();

              toast({
                title: o.modalDownloaded,
                description: `esim-qr-${orderId.slice(0, 8)}.png`,
              });
            }
          });

          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
    } catch {
      toast({
        title: o.modalCopyFail,
        variant: "destructive",
      });
    }
  };

  const handleCopyActivationCode = () => {
    const codeToCopy = activationCode || activationUrl;
    navigator.clipboard.writeText(codeToCopy);
    toast({
      title: o.modalCopied,
      description: activationCode ? o.modalLpaCode : o.modalActivationDetails,
    });
  };

  const handleOpenWebUrl = () => {
    if (activationUrl && (activationUrl.startsWith('http') || activationUrl.startsWith('https'))) {
      window.open(activationUrl, '_blank');
    } else {
      toast({
        title: o.modalCopyFail,
        description: o.modalActivationDetails,
      });
    }
  };

  const getStatusInfo = (s: string) => {
    switch (s) {
      case 'active':
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4" />,
          text: o.stateActiveTitle,
        };
      case 'pending':
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <Clock className="h-4 w-4" />,
          text: o.stateReadyTitle,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Clock className="h-4 w-4" />,
          text: o.statusProcessing,
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  const qrCodeData = activationCode || activationUrl;
  const hasWebUrl = activationUrl && (activationUrl.startsWith('http') || activationUrl.startsWith('https'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-gradient-to-br from-gray-50 to-white">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="flex items-center justify-center gap-3 text-xl font-bold text-gray-900">
            <div className="bg-palop-green/10 p-2 rounded-full">
              <Smartphone className="h-5 w-5 text-palop-green" />
            </div>
            {o.modalTitle}
          </DialogTitle>
          <p className="text-gray-500 mt-1 text-sm">{o.modalSubtitle}</p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={`${statusInfo.color} px-4 py-1.5 border flex items-center gap-2 font-medium`}>
              {statusInfo.icon}
              {statusInfo.text}
            </Badge>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-center mb-3">
              <QrCode className="h-5 w-5 text-palop-green mx-auto mb-1.5" />
              <h3 className="font-semibold text-gray-900 text-sm">{o.modalScanTitle}</h3>
              <p className="text-xs text-gray-500">{o.modalScanHint}</p>
            </div>

            <div id="esim-qr-code" className="flex justify-center bg-white p-3 rounded-xl">
              <QRCodeSVG
                value={qrCodeData}
                size={220}
                level="M"
                includeMargin
                bgColor="white"
                fgColor="#000000"
              />
            </div>

            <p className="text-center text-xs text-gray-400 mt-2">
              💡 {o.qrNotice}
            </p>
          </div>

          {/* Plan Details */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-3 text-sm">
            {coverage && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{o.modalCoverage}</p>
                <p className="font-medium text-gray-900">{coverage}</p>
              </div>
            )}
            {dataAmount && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{o.detailsDataAllowance}</p>
                <p className="font-medium text-gray-900">{dataAmount}</p>
              </div>
            )}
            {planName && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{o.modalPlan}</p>
                <p className="font-medium text-gray-900">{planName}</p>
              </div>
            )}
            {iccid && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">{o.modalIccid}</p>
                <p className="font-mono text-xs text-gray-900 break-all">{iccid}</p>
              </div>
            )}
          </div>

          {/* Activation Code */}
          {(activationCode || activationUrl) && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {activationCode ? o.modalLpaCode : o.modalActivationDetails}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyActivationCode}
                  className="h-7 px-2.5 text-palop-green hover:bg-palop-green/10 text-xs"
                  data-testid="button-copy-activation"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  {o.modalCopy}
                </Button>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="font-mono text-xs text-gray-800 break-all leading-relaxed">
                  {activationCode || activationUrl}
                </p>
              </div>
            </div>
          )}

          {/* Web URL */}
          {hasWebUrl && (
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{o.modalWebUrl}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenWebUrl}
                  className="h-7 px-2.5 text-palop-green hover:bg-palop-green/10 text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  {o.modalOpen}
                </Button>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-700 break-all">{activationUrl}</p>
              </div>
            </div>
          )}

          {/* Installation Guide */}
          <div className="bg-palop-green/5 rounded-xl p-4 border border-palop-green/15">
            <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-palop-green" />
              {o.modalGuideTitle}
            </h4>
            <ol className="space-y-2 text-sm text-gray-700">
              {[o.modalGuideStep1, o.modalGuideStep2, o.modalGuideStep3, o.modalGuideStep4].map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="bg-palop-green/15 text-palop-green rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-palop-green hover:bg-palop-green/90 text-white"
              data-testid="button-download-qr"
            >
              <Download className="h-4 w-4 mr-2" />
              {o.modalDownload}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-200 hover:bg-gray-50"
            >
              {o.modalClose}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ESIMActivationModal;
