
import { Button } from "@/components/ui/button";
import { Download, Eye, Copy, QrCode, Mail } from "lucide-react";

interface OrderActionsProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
  variant?: 'compact' | 'expanded';
}

const OrderActions = ({ 
  order, 
  qrCode, 
  canDownload, 
  onDownloadESIM, 
  onResendEmail,
  variant = 'compact'
}: OrderActionsProps) => {
  if (!canDownload) return null;

  if (variant === 'compact') {
    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">eSIM Ready for Download</h4>
            <p className="text-sm text-blue-700">Your eSIM is ready to install on your device</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDownloadESIM(order)}
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            >
              <Eye className="h-4 w-4 mr-2" />
              View QR Code
            </Button>
            <Button 
              onClick={() => onDownloadESIM(order)}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download eSIM
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 p-3 rounded-lg">
      <h4 className="font-medium text-sm mb-2 text-green-800">eSIM Actions</h4>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDownloadESIM(order)}
        >
          <QrCode className="h-4 w-4 mr-2" />
          Show QR Code
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDownloadESIM(order)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Activation URL
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onResendEmail(order.id)}
        >
          <Mail className="h-4 w-4 mr-2" />
          Resend Email
        </Button>
      </div>
    </div>
  );
};

export default OrderActions;
