
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activationUrl: string;
  orderId: string;
  planName?: string;
  dataAmount?: string;
  status: 'pending' | 'active' | 'revoked';
}

const QRCodeDownloadModal = ({ 
  isOpen, 
  onClose, 
  activationUrl, 
  orderId, 
  planName, 
  dataAmount,
  status 
}: QRCodeDownloadModalProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    try {
      // Create a canvas to convert SVG to PNG
      const svg = document.querySelector('#customer-qr-code svg') as SVGElement;
      if (svg) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = 300;
          canvas.height = 300;
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `esim-qr-code-${orderId.slice(0, 8)}.png`;
              link.href = URL.createObjectURL(blob);
              link.click();
              
              toast({
                title: "Downloaded",
                description: "QR code has been downloaded successfully.",
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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(activationUrl);
    toast({
      title: "Copied",
      description: "Activation URL copied to clipboard.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      revoked: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Download eSIM QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QR Code Display */}
          <div id="customer-qr-code" className="flex justify-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <QRCodeSVG 
              value={activationUrl} 
              size={250}
              level="M"
              includeMargin
            />
          </div>

          {/* Plan Info */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              {getStatusBadge(status)}
            </div>
            
            {planName && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Plan:</span>
                <span className="text-sm font-medium">{planName}</span>
              </div>
            )}

            {dataAmount && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Data:</span>
                <span className="text-sm font-medium">{dataAmount}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Order ID:</span>
              <span className="text-sm font-mono">{orderId.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Activation URL */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Activation URL:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all">
              {activationUrl}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Instructions:</strong> Scan this QR code with your device's camera or QR code scanner to activate your eSIM. Make sure you have a stable internet connection during activation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDownloadModal;
