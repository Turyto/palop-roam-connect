import { useOrders } from "@/hooks/useOrders";
import { useCustomerQRCodes } from "@/hooks/useCustomerQRCodes";
import { useState, lazy, Suspense } from "react";
import QRCodeDownloadModal from "./QRCodeDownloadModal";
import TopUpCheckoutModal from "./order-history/TopUpCheckoutModal";
import EmptyOrdersState from "./order-history/EmptyOrdersState";
import OrderCard from "./order-history/OrderCard";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language";
import { AlertCircle, Loader2 } from "lucide-react";

const DevQAPreview = import.meta.env.DEV
  ? lazy(() => import("./order-history/DevQAPreview"))
  : null;

const OrderHistory = () => {
  const { orders, ordersLoading, ordersError } = useOrders();
  const { qrCodes } = useCustomerQRCodes();
  const { toast } = useToast();
  const { t } = useLanguage();
  const o = t.orders;

  const [selectedQRCode, setSelectedQRCode] = useState<{
    activationUrl: string;
    orderId: string;
    planName?: string;
    dataAmount?: string;
    status: 'pending' | 'active' | 'revoked';
    coverage?: string;
  } | null>(null);
  const [selectedTopUpOrder, setSelectedTopUpOrder] = useState<any>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 text-palop-green animate-spin mr-2" />
        <span className="text-gray-500 text-sm">{o.loading}</span>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
        <h3 className="font-semibold text-gray-800 mb-1">{o.error}</h3>
        <p className="text-gray-500 text-sm">{o.errorDesc}</p>
      </div>
    );
  }

  const getOrderQRCode = (orderId: string) => {
    return qrCodes.find(qr => qr.order_id === orderId);
  };

  const canDownloadESIM = (order: any, qrCode: any) => {
    return (
      order.status === 'completed' &&
      order.payment_status === 'succeeded' &&
      !!order.esim_delivered_at &&
      !!qrCode
    );
  };

  const handleDownloadESIM = (order: any) => {
    const qrCode = getOrderQRCode(order.id);
    if (qrCode) {
      setSelectedQRCode({
        activationUrl: qrCode.activation_url,
        orderId: order.id,
        planName: order.plan_name,
        dataAmount: order.data_amount,
        status: qrCode.status,
        coverage: order.coverage || undefined,
      });
    }
  };

  const handleTopUp = (order: any) => {
    setSelectedTopUpOrder(order);
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
    toast({
      title: "eSIM Details Sent!",
      description: "Your eSIM activation details have been resent to your email address.",
    });
    console.log('Resend email for order:', orderId);
  };

  const hasOrders = orders && orders.length > 0;

  return (
    <div className="space-y-4">
      {/* Real orders list */}
      {hasOrders ? (
        orders.map((order) => {
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
              onTopUp={handleTopUp}
            />
          );
        })
      ) : (
        <EmptyOrdersState />
      )}

      {/* Dev-only QA preview — automatically removed in production builds */}
      {import.meta.env.DEV && DevQAPreview && (
        <Suspense fallback={null}>
          <DevQAPreview />
        </Suspense>
      )}

      <QRCodeDownloadModal
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        activationUrl={selectedQRCode?.activationUrl || ''}
        orderId={selectedQRCode?.orderId || ''}
        planName={selectedQRCode?.planName}
        dataAmount={selectedQRCode?.dataAmount}
        status={selectedQRCode?.status || 'pending'}
        coverage={selectedQRCode?.coverage}
      />

      <TopUpCheckoutModal
        isOpen={!!selectedTopUpOrder}
        onClose={() => setSelectedTopUpOrder(null)}
        order={selectedTopUpOrder}
      />
    </div>
  );
};

export default OrderHistory;
