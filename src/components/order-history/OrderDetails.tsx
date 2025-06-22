
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import OrderActions from "./OrderActions";

interface OrderDetailsProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
}

const OrderDetails = ({ 
  order, 
  qrCode, 
  canDownload, 
  onDownloadESIM, 
  onResendEmail 
}: OrderDetailsProps) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Plan Details</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• High-speed data with fair usage policy</div>
          <div>• Works on compatible devices only</div>
          <div>• Valid throughout Cape Verde coverage area</div>
          <div>• Activation required within 30 days of purchase</div>
        </div>
      </div>

      {canDownload && (
        <OrderActions
          order={order}
          qrCode={qrCode}
          canDownload={canDownload}
          onDownloadESIM={onDownloadESIM}
          onResendEmail={onResendEmail}
          variant="expanded"
        />
      )}
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/esim" target="_blank">
            <HelpCircle className="h-4 w-4 mr-2" />
            How to Install
          </a>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <a href="/support">
            <HelpCircle className="h-4 w-4 mr-2" />
            Need Help?
          </a>
        </Button>
      </div>
    </div>
  );
};

export default OrderDetails;
