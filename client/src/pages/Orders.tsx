import { useState } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import OrderHistory from "@/components/OrderHistory";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/language";
import { useOrders } from "@/hooks/useOrders";
import { useCustomerQRCodes } from "@/hooks/useCustomerQRCodes";
import { deriveActivationState } from "@/components/order-history/OrderActivationStateBlock";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import DashboardHeader from "@/components/orders/DashboardHeader";
import EsimSummaryCard from "@/components/orders/EsimSummaryCard";
import NextStepCard from "@/components/orders/NextStepCard";
import OrderDetailsCard from "@/components/orders/OrderDetailsCard";
import SupportCard from "@/components/orders/SupportCard";
import QRCodeDownloadModal from "@/components/QRCodeDownloadModal";

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  /* ── Data (fetched once here, passed as props to all cards) ── */
  const { orders, ordersLoading } = useOrders();
  const { qrCodes } = useCustomerQRCodes();

  /* ── Derived dashboard state (computed once) ─────────────── */
  const email = user?.email ?? null;
  const latestOrder = orders.length > 0 ? orders[0] : null;
  const latestQRCode = latestOrder
    ? (qrCodes.find((qr) => qr.order_id === latestOrder.id) ?? null)
    : null;
  const dashboardState = latestOrder
    ? deriveActivationState(latestOrder, latestQRCode)
    : null;

  /* ── QR modal state for dashboard card CTAs ──────────────── */
  const [dashboardQR, setDashboardQR] = useState<{
    activationUrl: string;
    orderId: string;
    planName?: string;
    dataAmount?: string;
    status: "pending" | "active" | "revoked";
    coverage?: string;
  } | null>(null);

  const handleDashboardDownloadESIM = (order: any) => {
    if (latestQRCode) {
      setDashboardQR({
        activationUrl: latestQRCode.activation_url,
        orderId: order.id,
        planName: order.plan_name,
        dataAmount: order.data_amount,
        status: latestQRCode.status,
        coverage: order.coverage ?? undefined,
      });
    }
  };

  /* ── Auth guard ──────────────────────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">{t.orders.loading}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* Dashboard header */}
          <DashboardHeader email={email} />

          {/* 2-column grid (stacked on mobile) */}
          {ordersLoading ? (
            <div className="flex items-center justify-center min-h-[220px]">
              <Loader2 className="h-6 w-6 text-palop-green animate-spin mr-2" />
              <span className="text-gray-500 text-sm">{t.orders.loading}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {/* Left: eSIM status + next step */}
              <div className="flex flex-col gap-4">
                <EsimSummaryCard
                  order={latestOrder}
                  qrCode={latestQRCode}
                  dashboardState={dashboardState}
                  onDownloadESIM={handleDashboardDownloadESIM}
                />
                <NextStepCard
                  order={latestOrder}
                  qrCode={latestQRCode}
                  dashboardState={dashboardState}
                  onDownloadESIM={handleDashboardDownloadESIM}
                />
              </div>

              {/* Right: order details + help */}
              <div className="flex flex-col gap-4">
                <OrderDetailsCard order={latestOrder} email={email} />
                <SupportCard />
              </div>
            </div>
          )}

          {/* Full order history */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t.orders.historyTitle}
            </h2>
            <OrderHistory />
          </div>

        </div>
      </main>

      <HomeFooter />

      {/* QR modal driven by dashboard card CTAs */}
      <QRCodeDownloadModal
        isOpen={!!dashboardQR}
        onClose={() => setDashboardQR(null)}
        activationUrl={dashboardQR?.activationUrl ?? ""}
        orderId={dashboardQR?.orderId ?? ""}
        planName={dashboardQR?.planName}
        dataAmount={dashboardQR?.dataAmount}
        status={dashboardQR?.status ?? "pending"}
        coverage={dashboardQR?.coverage}
      />
    </div>
  );
};

export default Orders;
