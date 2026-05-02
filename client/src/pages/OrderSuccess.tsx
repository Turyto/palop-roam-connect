import { useEffect, useState, useRef } from "react";
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
  plan_name: string;
  customer_email: string | null;
  price: number;
  currency: string;
  esim_status: string | null;
  payment_intent_id: string | null;
}

interface ActivationDetails {
  provisioning_status: string | null;
  qr_code_data?: string | null;
  activation_url?: string | null;
}

// Attempt to (re-)provision an eSIM for an existing order.
// Safe to call multiple times — uses payment_intent_id as idempotent outOrder reference.
async function attemptProvision(order: OrderDetails, paymentIntentRef: string): Promise<boolean> {
  try {
    // 1. Fetch the correct eSIM Access package for this plan
    const { data: pkgResponse, error: pkgError } = await supabase.functions.invoke(
      'get-esim-package',
      { body: { plan_id: order.plan_id } }
    );
    if (pkgError || !pkgResponse?.data?.esim_access_package_id) {
      console.error('[OrderSuccess] no esim_access package for plan', order.plan_id, pkgError);
      return false;
    }
    const pkg = pkgResponse.data;

    // 2. Call esim-access create-order (idempotent via referenceId = payment_intent_id)
    const { data: esimResult, error: esimError } = await supabase.functions.invoke(
      'esim-access',
      {
        body: {
          action: 'create-order',
          packageId: pkg.esim_access_package_id,
          customerEmail: order.customer_email || '',
          customerName: order.customer_email || '',
          referenceId: paymentIntentRef,
        },
      }
    );

    if (esimError || !esimResult?.success) {
      console.error('[OrderSuccess] esim-access create-order failed', esimError, esimResult);
      return false;
    }

    // 3. Extract the supplier transaction number (ICCID arrives asynchronously)
    const obj = esimResult?.obj ?? esimResult?.data?.obj;
    const esimTranNo =
      obj?.esimTranNo ?? obj?.orderNo ?? obj?.packageInfoList?.[0]?.esimTranNo ?? null;

    // 4. Update order row
    await supabase
      .from('orders')
      .update({
        esim_order_id: esimTranNo,
        esim_status: 'provisioned',
        esim_package_id: pkg.esim_access_package_id,
        esim_delivered_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // 5. Upsert esim_activations placeholder (ICCID etc. filled later by check-esim-status)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('esim_activations').upsert(
        {
          order_id: order.id,
          user_id: user.id,
          status: 'pending',
          provisioning_status: 'completed',
          provisioning_log: {
            esim_order_id: esimTranNo,
            package_code: pkg.esim_access_package_id,
            retried_at: new Date().toISOString(),
          },
        },
        { onConflict: 'order_id' }
      );
    }

    console.log('[OrderSuccess] re-provision succeeded, esimTranNo:', esimTranNo);
    return true;
  } catch (err) {
    console.error('[OrderSuccess] attemptProvision exception:', err);
    return false;
  }
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [activation, setActivation] = useState<ActivationDetails | null>(null);
  const { t } = useLanguage();
  const hasRetried = useRef(false);

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

      // --- First attempt ---
      let orderData: OrderDetails | null = null;

      const { data: first, error: firstError } = await supabase
        .from("orders")
        .select("id, plan_id, plan_name, customer_email, price, currency, esim_status, payment_intent_id")
        .eq("payment_intent_id", paymentIntent)
        .maybeSingle();

      if (firstError || !first) {
        // Order not written yet (race between Stripe redirect and createOrderAsync)
        await new Promise((r) => setTimeout(r, 2500));
        const { data: retry } = await supabase
          .from("orders")
          .select("id, plan_id, plan_name, customer_email, price, currency, esim_status, payment_intent_id")
          .eq("payment_intent_id", paymentIntent)
          .maybeSingle();

        if (!retry) {
          // Still not there — likely the browser closed mid-flow. Show processing.
          setPageStatus("processing");
          return;
        }
        orderData = retry as OrderDetails;
      } else {
        orderData = first as OrderDetails;
      }

      setOrder(orderData);

      // --- Fetch activation record ---
      const { data: activationData } = await supabase
        .from("esim_activations")
        .select("provisioning_status, qr_code_data, activation_url")
        .eq("order_id", orderData.id)
        .maybeSingle();

      // --- Provisioning succeeded and activation record exists ---
      if (activationData?.provisioning_status === "completed") {
        setActivation(activationData);
        setPageStatus("success");
        return;
      }

      // --- Auto-retry: order failed provisioning and we haven't retried yet ---
      // This covers: page refresh after failure, 3DS redirect landing, wrong package returned.
      if (
        !hasRetried.current &&
        (orderData.esim_status === "failed" || !activationData) &&
        orderData.esim_status !== "provisioned"
      ) {
        hasRetried.current = true;
        console.log('[OrderSuccess] esim_status is', orderData.esim_status, '— attempting re-provision');
        const ok = await attemptProvision(orderData, paymentIntent);
        if (ok) {
          // Re-fetch activation after successful retry
          const { data: newActivation } = await supabase
            .from("esim_activations")
            .select("provisioning_status, qr_code_data, activation_url")
            .eq("order_id", orderData.id)
            .maybeSingle();
          setActivation(newActivation ?? null);
          // Supplier allocates ICCID asynchronously — show processing, not success
          setPageStatus("processing");
        } else {
          setPageStatus("processing");
        }
        return;
      }

      // --- Still waiting (esim_status = provisioned but no completed activation yet) ---
      if (activationData) {
        setActivation(activationData);
        setPageStatus("processing");
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
