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
import type { Order } from "@/hooks/orders/types";

import DashboardHeader from "@/components/orders/DashboardHeader";
import EsimSummaryCard from "@/components/orders/EsimSummaryCard";
import NextStepCard from "@/components/orders/NextStepCard";
import OrderDetailsCard from "@/components/orders/OrderDetailsCard";
import SupportCard from "@/components/orders/SupportCard";
import QRCodeDownloadModal from "@/components/QRCodeDownloadModal";

type OrderWithCoverage = Order & { coverage?: string };

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { orders, ordersLoading, ordersError } = useOrders();
  const { qrCodes } = useCustomerQRCodes();

  const o = t.orders;
  const email = user?.email ?? null;
  const greetingName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || email;
  const latestOrder: OrderWithCoverage | null = orders.length > 0
    ? (orders[0] as OrderWithCoverage)
    : null;
  const latestQRCode = latestOrder
    ? (qrCodes.find((qr) => qr.order_id === latestOrder.id) ?? null)
    : null;
  const dashboardState = latestOrder
    ? deriveActivationState(latestOrder, latestQRCode)
    : null;

  const [dashboardQR, setDashboardQR] = useState<{
    activationUrl: string;
    orderId: string;
    planName?: string;
    dataAmount?: string;
    status: "pending" | "active" | "revoked";
    coverage?: string;
  } | null>(null);

  const handleDashboardDownloadESIM = (order: OrderWithCoverage) => {
    if (latestQRCode) {
      setDashboardQR({
        activationUrl: latestQRCode.activation_url,
        orderId: order.id,
        planName: order.plan_name,
        dataAmount: order.data_amount,
        status: latestQRCode.status,
        coverage: order.coverage,
      });
    }
  };

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

  const esimSummaryLabels = {
    noActivePlan: o.noActivePlan,
    emptyDesc: o.emptyDesc,
    buyEsim: o.buyEsim,
    stateProcessingTitle: o.stateProcessingTitle,
    stateReadyTitle: o.stateReadyTitle,
    stateActiveTitle: o.stateActiveTitle,
    stateExpiredTitle: o.stateExpiredTitle,
    stateErrorTitle: o.stateErrorTitle,
    detailsCoverage: o.detailsCoverage,
    detailsValidity: o.detailsValidity,
    validFor: o.validFor,
    purchaseDate: o.purchaseDate,
    viewQR: o.viewQR,
    buyNewPlan: o.buyNewPlan,
    talkToSupport: o.talkToSupport,
  };

  const nextStepLabels = {
    nextStepTitle: o.nextStepTitle,
    emptyDesc: o.emptyDesc,
    browsePlans: o.browsePlans,
    stateProcessingDesc: o.stateProcessingDesc,
    talkToSupport: o.talkToSupport,
    activationStep1: o.activationStep1,
    activationStep2: o.activationStep2,
    activationStep3: o.activationStep3,
    activationStep4: o.activationStep4,
    activationStep5: o.activationStep5,
    viewQR: o.viewQR,
    stateActiveDescShort: o.stateActiveDescShort,
    stateExpiredDesc: o.stateExpiredDesc,
    buyNewPlan: o.buyNewPlan,
    stateErrorDesc: o.stateErrorDesc,
  };

  const orderDetailsLabels = {
    detailsOrderTitle: o.detailsOrderTitle,
    orderId: o.orderId,
    detailsPlanTitle: o.detailsPlanTitle,
    purchaseDate: o.purchaseDate,
    detailsValidity: o.detailsValidity,
    detailsDays: o.detailsDays,
    emptyDesc: o.emptyDesc,
  };

  const supportLabels = {
    title: o.supportTitle,
    topicInstall: o.supportTopicInstall,
    topicConnection: o.supportTopicConnection,
    topicCompat: o.supportTopicCompat,
    contact: o.talkToSupport,
    viewCompatibility: o.supportViewCompatibility,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          <DashboardHeader
            email={greetingName}
            strings={{ title: o.dashboardTitle, welcomeTemplate: o.dashboardWelcome }}
          />

          {ordersLoading ? (
            <div className="flex items-center justify-center min-h-[220px]">
              <Loader2 className="h-6 w-6 text-palop-green animate-spin mr-2" />
              <span className="text-gray-500 text-sm">{o.loading}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col gap-4">
                <EsimSummaryCard
                  order={latestOrder}
                  qrCode={latestQRCode}
                  dashboardState={dashboardState}
                  onDownloadESIM={handleDashboardDownloadESIM}
                  labels={esimSummaryLabels}
                />
                <NextStepCard
                  order={latestOrder}
                  qrCode={latestQRCode}
                  dashboardState={dashboardState}
                  onDownloadESIM={handleDashboardDownloadESIM}
                  labels={nextStepLabels}
                />
              </div>
              <div className="flex flex-col gap-4">
                <OrderDetailsCard
                  order={latestOrder}
                  email={email}
                  labels={orderDetailsLabels}
                />
                <SupportCard labels={supportLabels} />
              </div>
            </div>
          )}

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
