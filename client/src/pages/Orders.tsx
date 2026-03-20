import { useState, useEffect } from "react";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import OrderHistory from "@/components/OrderHistory";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/language";
import { useOrders } from "@/hooks/useOrders";
import { useCustomerQRCodes } from "@/hooks/useCustomerQRCodes";
import { deriveActivationState } from "@/components/order-history/OrderActivationStateBlock";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import DashboardHeader from "@/components/orders/DashboardHeader";
import EsimSummaryCard from "@/components/orders/EsimSummaryCard";
import NextStepCard from "@/components/orders/NextStepCard";
import OrderDetailsCard from "@/components/orders/OrderDetailsCard";
import SupportCard from "@/components/orders/SupportCard";
import QRCodeDownloadModal from "@/components/QRCodeDownloadModal";

const Orders = () => {
  /* ── Auth (called once) ──────────────────────────────── */
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  /* ── Data (called once each — results shared via props) ─ */
  const { orders, ordersLoading, ordersError } = useOrders();
  const { qrCodes } = useCustomerQRCodes();

  /* ── Derived state (computed once, passed as props) ───── */
  const email = user?.email ?? null;
  const latestOrder = orders.length > 0 ? orders[0] : null;
  const latestQRCode = latestOrder
    ? (qrCodes.find((qr) => qr.order_id === latestOrder.id) ?? null)
    : null;
  const dashboardState = latestOrder
    ? deriveActivationState(latestOrder, latestQRCode)
    : null;

  /* ── Strings for hook-free cards ────────────────────────
     DashboardHeader and OrderDetailsCard must be hook-free;
     all translated labels are resolved here and passed as props. */
  const o = t.orders;
  const dashboardTitle = o.dashboardTitle;
  const welcomeText = email ? o.dashboardWelcome.replace('{email}', email) : null;
  const orderDetailsLabels = {
    detailsOrderTitle: o.detailsOrderTitle,
    orderId: o.orderId,
    detailsPlanTitle: o.detailsPlanTitle,
    purchaseDate: o.purchaseDate,
    detailsValidity: o.detailsValidity,
    detailsDays: o.detailsDays,
    emptyDesc: o.emptyDesc,
  };

  /* ── QR modal state for dashboard card CTAs ──────────── */
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

  /* ── Auth guard ──────────────────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">{o.loading}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* Dashboard header — no hooks; receives pre-resolved strings */}
          <DashboardHeader title={dashboardTitle} welcomeText={welcomeText} />

          {/* 2-column grid (stacked on mobile) */}
          {ordersLoading ? (
            <div className="flex items-center justify-center min-h-[220px]">
              <Loader2 className="h-6 w-6 text-palop-green animate-spin mr-2" />
              <span className="text-gray-500 text-sm">{o.loading}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {/* Left column: eSIM status card + next step */}
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

              {/* Right column: order details + help */}
              <div className="flex flex-col gap-4">
                {/* No hooks inside; labels passed from here */}
                <OrderDetailsCard
                  order={latestOrder}
                  email={email}
                  labels={orderDetailsLabels}
                />
                <SupportCard />
              </div>
            </div>
          )}

          {/* Full order history — prop-driven; no internal data fetching */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {o.historyTitle}
            </h2>
            <OrderHistory
              orders={orders}
              qrCodes={qrCodes}
              ordersLoading={ordersLoading}
              ordersError={ordersError}
            />
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
