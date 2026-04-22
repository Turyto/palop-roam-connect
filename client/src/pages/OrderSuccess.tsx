import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/language";
import { CheckCircle, Clock, XCircle, Mail, Smartphone, LifeBuoy } from "lucide-react";

type PageStatus = "loading" | "success" | "processing" | "failed";

interface OrderDetails {
  id: string;
  plan_id: string;
  customer_email: string | null;
  price: number;
  currency: string;
}

interface ActivationDetails {
  provisioning_status: string | null;
  qr_code_data?: string | null;
  activation_url?: string | null;
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [activation, setActivation] = useState<ActivationDetails | null>(null);
  const { t } = useLanguage();

  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  useEffect(() => {
    const fetchOrder = async () => {
      if (redirectStatus === "failed") {
        setPageStatus("failed");
        return;
      }

      if (!paymentIntent) {
        setPageStatus("failed");
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id, plan_id, customer_email, price, currency")
        .eq("payment_intent_id", paymentIntent)
        .maybeSingle();

      if (orderError || !orderData) {
        await new Promise((r) => setTimeout(r, 2000));
        const { data: retryData } = await supabase
          .from("orders")
          .select("id, plan_id, customer_email, price, currency")
          .eq("payment_intent_id", paymentIntent)
          .maybeSingle();

        if (!retryData) {
          setPageStatus("processing");
          return;
        }
        setOrder(retryData);

        const { data: activationData } = await supabase
          .from("esim_activations")
          .select("provisioning_status, qr_code_data, activation_url")
          .eq("order_id", retryData.id)
          .maybeSingle();

        if (activationData) {
          setActivation(activationData);
          setPageStatus(activationData.provisioning_status === "completed" ? "success" : "processing");
        } else {
          setPageStatus("processing");
        }
        return;
      }

      setOrder(orderData);

      const { data: activationData } = await supabase
        .from("esim_activations")
        .select("provisioning_status, qr_code_data, activation_url")
        .eq("order_id", orderData.id)
        .maybeSingle();

      if (activationData) {
        setActivation(activationData);
        setPageStatus(activationData.provisioning_status === "completed" ? "success" : "processing");
      } else {
        setPageStatus("processing");
      }
    };

    fetchOrder();
  }, [paymentIntent, redirectStatus]);

  const os = t.orderSuccess;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {pageStatus === "loading" && <LoadingState label={os.loading} />}
          {pageStatus === "success" && <SuccessState order={order} activation={activation} os={os} />}
          {pageStatus === "processing" && <ProcessingState order={order} os={os} />}
          {pageStatus === "failed" && <FailedState os={os} />}
        </div>
      </main>
      <HomeFooter />
    </div>
  );
};

type OsT = ReturnType<typeof useLanguage>["t"]["orderSuccess"];

const LoadingState = ({ label }: { label: string }) => (
  <div className="text-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
    <p className="text-gray-500">{label}</p>
  </div>
);

const SuccessState = ({
  order,
  activation,
  os,
}: {
  order: OrderDetails | null;
  activation: ActivationDetails | null;
  os: OsT;
}) => (
  <div className="text-center">
    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{os.successTitle}</h1>
    {order && (
      <p className="text-gray-500 mb-6">
        {order.currency} {Number(order.price).toFixed(2)} — {order.plan_id}
      </p>
    )}
    <div className="bg-green-50 rounded-xl p-5 mb-6 text-left space-y-3">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-gray-900">{os.successEmailTitle}</p>
          {order?.customer_email ? (
            <p className="text-sm text-gray-500">
              {os.successEmailPrefix}{" "}
              <span className="font-medium">{order.customer_email}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">{os.successEmailNoAddress}</p>
          )}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Smartphone className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-gray-900">{os.successActivateTitle}</p>
          <p className="text-sm text-gray-500">{os.successActivateDesc}</p>
        </div>
      </div>
    </div>
    {activation?.activation_url && (
      <a
        href={activation.activation_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl mb-4 transition-colors"
      >
        {os.successActivateButton}
      </a>
    )}
    <div className="flex gap-3 justify-center text-sm">
      <Link to="/compatibility" className="text-blue-600 hover:underline">
        {os.successLinkCompat}
      </Link>
      <span className="text-gray-300">•</span>
      <Link to="/support" className="text-blue-600 hover:underline">
        {os.successLinkHelp}
      </Link>
      <span className="text-gray-300">•</span>
      <Link to="/orders" className="text-blue-600 hover:underline">
        {os.successLinkOrders}
      </Link>
    </div>
  </div>
);

const ProcessingState = ({ order, os }: { order: OrderDetails | null; os: OsT }) => (
  <div className="text-center">
    <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{os.processingTitle}</h1>
    <p className="text-gray-500 mb-6">{os.processingDesc}</p>
    <div className="bg-blue-50 rounded-xl p-5 mb-6 text-left">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-gray-900">{os.processingEmailTitle}</p>
          {order?.customer_email && (
            <p className="text-sm text-gray-500">
              {os.processingEmailPrefix}{" "}
              <span className="font-medium">{order.customer_email}</span>{" "}
              {os.processingEmailSuffix}
            </p>
          )}
        </div>
      </div>
    </div>
    <div className="flex gap-3 justify-center text-sm">
      <Link to="/support" className="text-blue-600 hover:underline flex items-center gap-1">
        <LifeBuoy className="h-4 w-4" /> {os.processingLinkSupport}
      </Link>
      <span className="text-gray-300">•</span>
      <Link to="/orders" className="text-blue-600 hover:underline">
        {os.processingLinkOrders}
      </Link>
    </div>
  </div>
);

const FailedState = ({ os }: { os: OsT }) => (
  <div className="text-center">
    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{os.failedTitle}</h1>
    <p className="text-gray-500 mb-6">{os.failedDesc}</p>
    <Link
      to="/purchase"
      className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl mb-4 transition-colors"
    >
      {os.failedTryAgain}
    </Link>
    <Link to="/support" className="text-sm text-blue-600 hover:underline">
      {os.failedContact}
    </Link>
  </div>
);

export default OrderSuccess;
