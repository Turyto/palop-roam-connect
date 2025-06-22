
import OrderActions from "./OrderActions";

interface OrderDetailsProps {
  order: any;
  qrCode: any;
  canDownload: boolean;
  onDownloadESIM: (order: any) => void;
  onResendEmail: (orderId: string) => void;
  onTopUp?: (order: any) => void;
}

const OrderDetails = ({ 
  order, 
  qrCode, 
  canDownload, 
  onDownloadESIM, 
  onResendEmail,
  onTopUp
}: OrderDetailsProps) => {
  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      {/* Technical Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Plan Details</h5>
          <div className="space-y-1 text-gray-600">
            <div>Data Allowance: {order.data_amount}</div>
            <div>Validity Period: {order.duration_days} days</div>
            <div>Coverage: Cape Verde</div>
            <div>Network: CVMóvel</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Order Information</h5>
          <div className="space-y-1 text-gray-600">
            <div>Order Status: {order.status}</div>
            <div>Payment Status: {order.payment_status}</div>
            {order.payment_intent_id && (
              <div className="truncate">Payment ID: {order.payment_intent_id}</div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      <OrderActions
        order={order}
        qrCode={qrCode}
        canDownload={canDownload}
        onDownloadESIM={onDownloadESIM}
        onResendEmail={onResendEmail}
        onTopUp={onTopUp}
        variant="expanded"
      />

      {/* Usage Guidelines */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">Installation Guide</h5>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Download and save the QR code to your device</li>
          <li>2. Open Settings → Mobile/Cellular → Add eSIM</li>
          <li>3. Scan the QR code or enter activation details manually</li>
          <li>4. Follow your device's setup instructions</li>
          <li>5. Your eSIM will activate when you arrive in Cape Verde</li>
        </ol>
      </div>
    </div>
  );
};

export default OrderDetails;
