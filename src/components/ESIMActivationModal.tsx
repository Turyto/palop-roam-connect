
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, QrCode, ExternalLink, Smartphone, CheckCircle, Clock, Globe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

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
  coverage = "Algeria"
}: ESIMActivationModalProps) => {
  const { toast } = useToast();

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
                title: "Downloaded",
                description: "eSIM QR code downloaded successfully.",
              });
            }
          });
          
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download QR code.",
        variant: "destructive",
      });
    }
  };

  const handleCopyActivationCode = () => {
    if (activationCode) {
      navigator.clipboard.writeText(activationCode);
      toast({
        title: "Copied",
        description: "Activation code copied to clipboard.",
      });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Active & Ready"
        };
      case 'pending':
        return { 
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <Clock className="h-4 w-4" />,
          text: "Activating..."
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Clock className="h-4 w-4" />,
          text: "Processing"
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const qrCodeData = activationCode || activationUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-indigo-50">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-gray-900">
            <div className="bg-palop-green/10 p-2 rounded-full">
              <Smartphone className="h-6 w-6 text-palop-green" />
            </div>
            eSIM Activation
          </DialogTitle>
          <p className="text-gray-600 mt-2">Your eSIM is ready for installation</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={`${statusInfo.color} px-4 py-2 border flex items-center gap-2 font-medium`}>
              {statusInfo.icon}
              {statusInfo.text}
            </Badge>
          </div>

          {/* QR Code Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
            <div className="text-center mb-4">
              <QrCode className="h-6 w-6 text-palop-green mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Scan to Install</h3>
              <p className="text-sm text-gray-600">Use your device camera to scan</p>
            </div>
            
            <div id="esim-qr-code" className="flex justify-center bg-white p-4 rounded-xl">
              <QRCodeSVG 
                value={qrCodeData} 
                size={240}
                level="M"
                includeMargin
                bgColor="white"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-palop-green" />
                  <div>
                    <p className="text-gray-600">Coverage</p>
                    <p className="font-medium text-gray-900">{coverage}</p>
                  </div>
                </div>
                {dataAmount && (
                  <div>
                    <p className="text-gray-600">Data Allowance</p>
                    <p className="font-medium text-gray-900">{dataAmount}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {planName && (
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="font-medium text-gray-900">{planName}</p>
                  </div>
                )}
                {iccid && (
                  <div>
                    <p className="text-gray-600">ICCID</p>
                    <p className="font-mono text-xs text-gray-900 break-all">{iccid}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activation Code */}
          {activationCode && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-600">Activation Code</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyActivationCode}
                  className="h-8 px-3 text-palop-green hover:bg-palop-green/10"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="font-mono text-sm text-gray-900 break-all">{activationCode}</p>
              </div>
            </div>
          )}

          {/* Installation Guide */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Installation Guide
            </h4>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span>
                <span>Open Settings → Cellular → Add eSIM</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span>
                <span>Scan this QR code with your camera</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span>
                <span>Follow setup prompts and label your eSIM</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span>
                <span>Your eSIM activates when you reach {coverage}</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleDownload} 
              className="flex-1 bg-palop-green hover:bg-palop-green/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ESIMActivationModal;
