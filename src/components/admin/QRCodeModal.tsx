
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import type { QRCode } from "@/hooks/useQRCodes";

interface QRCodeModalProps {
  qrCode: QRCode | null;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ qrCode, isOpen, onClose }: QRCodeModalProps) => {
  const { toast } = useToast();

  if (!qrCode) return null;

  const handleDownload = () => {
    try {
      // Create a canvas to convert SVG to PNG
      const svg = document.querySelector('#qr-code-canvas svg') as SVGElement;
      if (svg) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = 200;
          canvas.height = 200;
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `qr-code-${qrCode.id.slice(0, 8)}.png`;
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
    navigator.clipboard.writeText(qrCode.activation_url);
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
          <DialogTitle>QR Code Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QR Code Display */}
          <div id="qr-code-canvas" className="flex justify-center p-4 bg-white rounded-lg border">
            <QRCodeSVG 
              value={qrCode.activation_url} 
              size={200}
              level="M"
              includeMargin
            />
          </div>

          {/* QR Code Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              {getStatusBadge(qrCode.status)}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">QR Code ID:</span>
              <span className="text-sm font-mono">{qrCode.id.slice(0, 8)}...</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Customer:</span>
              <span className="text-sm">{qrCode.profiles?.email || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Plan:</span>
              <span className="text-sm">{qrCode.orders?.plan_name || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Data:</span>
              <span className="text-sm">{qrCode.orders?.data_amount || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Created:</span>
              <span className="text-sm">{new Date(qrCode.created_at).toLocaleDateString()}</span>
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
              {qrCode.activation_url}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
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

export default QRCodeModal;
