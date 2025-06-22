
import { useOrders } from "@/hooks/useOrders";
import { useCustomerQRCodes } from "@/hooks/useCustomerQRCodes";
import { useState } from "react";
import QRCodeDownloadModal from "./QRCodeDownloadModal";
import OrderHistoryHeader from "./order-history/OrderHistoryHeader";
import EmptyOrdersState from "./order-history/EmptyOrdersState";
import OrderCard from "./order-history/OrderCard";

const OrderHistory = () => {
  const { orders, ordersLoading, ordersError } = useOrders();
  const { qrCodes } = useCustomerQRCodes();
  const [selectedQRCode, setSelectedQRCode] = useState<{
    activationUrl: string;
    orderId: string;
    planName?: string;
    dataAmount?: string;
    status: 'pending' | 'active' | 'revoked';
  } | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="text-center text-red-600 min-h-[200px] flex items-center justify-center">
        <div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
          <p>Unable to load your order history. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="space-y-6">
        <OrderHistoryHeader />
        <EmptyOrdersState />
      </div>
    );
  }

  const getOrderQRCode = (orderId: string) => {
    const qrCode = qrCodes.find(qr => qr.order_id === orderId);
    console.log('Looking for QR code for order:', orderId, 'Found:', qrCode);
    return qrCode;
  };

  const canDownloadESIM = (order: any, qrCode: any) => {
    const canDownload = order.status === 'completed' && 
                       order.payment_status === 'succeeded' && 
                       order.esim_delivered_at && 
                       qrCode;
    console.log('Can download eSIM for order:', order.id, 'Result:', canDownload, {
      status: order.status,
      payment_status: order.payment_status,
      esim_delivered_at: order.esim_delivered_at,
      hasQRCode: !!qrCode
    });
    return canDownload;
  };

  const handleDownloadESIM = (order: any) => {
    console.log('Download eSIM clicked for order:', order.id);
    const qrCode = getOrderQRCode(order.id);
    
    if (qrCode) {
      console.log('QR Code found:', qrCode);
      setSelectedQRCode({
        activationUrl: qrCode.activation_url,
        orderId: order.id,
        planName: order.plan_name,
        dataAmount: order.data_amount,
        status: qrCode.status
      });
    } else {
      console.log('No QR code found for order:', order.id);
      console.log('Available QR codes:', qrCodes);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleResendEmail = (orderId: string) => {
    // TODO: Implement resend email functionality
    console.log('Resend email for order:', orderId);
  };

  return (
    <div className="space-y-6">
      <OrderHistoryHeader />

      <div className="grid gap-6">
        {orders.map((order) => {
          const qrCode = getOrderQRCode(order.id);
          const canDownload = canDownloadESIM(order, qrCode);
          const isExpanded = expandedOrders.has(order.id);
          
          return (
            <OrderCard
              key={order.id}
              order={order}
              qrCode={qrCode}
              canDownload={canDownload}
              isExpanded={isExpanded}
              onToggleExpansion={toggleOrderExpansion}
              onDownloadESIM={handleDownloadESIM}
              onResendEmail={handleResendEmail}
            />
          );
        })}
      </div>

      <QRCodeDownloadModal
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        activationUrl={selectedQRCode?.activationUrl || ''}
        orderId={selectedQRCode?.orderId || ''}
        planName={selectedQRCode?.planName}
        dataAmount={selectedQRCode?.dataAmount}
        status={selectedQRCode?.status || 'pending'}
      />
    </div>
  );
};

export default OrderHistory;
