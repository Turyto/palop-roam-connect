
import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/language";

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  isCreatingOrder: boolean;
  amount: number;
  currency: string;
}

const isTestMode = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_");

const PaymentDetails = ({ onSuccess, onBack, isCreatingOrder, amount, currency }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useLanguage();
  const c = t.checkout;

  // The Pay button must stay disabled until the PaymentElement iframe reports
  // ready — the useStripe/useElements hooks resolve before the form has
  // actually loaded, and submitting in that window hangs intermittently.
  const [elementReady, setElementReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [elementKey, setElementKey] = useState(0); // bump to remount on retry
  const [isSubmitting, setIsSubmitting] = useState(false);

  const retryLoad = () => {
    setLoadError(false);
    setElementReady(false);
    setElementKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !elementReady || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
      });

      if (result.error) {
        // Error is shown by Stripe's PaymentElement automatically
        console.error("Payment error:", result.error);
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess(result.paymentIntent.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const payDisabled = !stripe || !elements || !elementReady || isSubmitting || isCreatingOrder || loadError;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Payment Details</h2>
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <Lock className="h-3 w-3" />
            Secured by Stripe
          </div>
        </div>
        <div className="p-6">
          {isTestMode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-2 text-sm text-blue-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Test mode: use card <strong>4242 4242 4242 4242</strong>, any future expiry, any 3-digit CVC.
              </span>
            </div>
          )}
          {loadError ? (
            <div
              className="p-4 bg-red-50 border border-red-100 rounded-md text-sm text-red-700 space-y-3"
              data-testid="payment-form-load-error"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{c.paymentFormLoadError}</span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={retryLoad} data-testid="button-retry-payment-form">
                {c.tryAgain}
              </Button>
            </div>
          ) : (
            <PaymentElement
              key={elementKey}
              onReady={() => setElementReady(true)}
              onLoadError={(event) => {
                console.error("Payment form load error:", event?.error);
                setLoadError(true);
              }}
              options={{
                layout: "tabs",
                defaultValues: { billingDetails: { address: { country: "PT" } } },
              }}
            />
          )}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Lock className="h-3 w-3" />
            Your payment information is encrypted and secure
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting || isCreatingOrder}
          data-testid="button-back-to-plans"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="bg-palop-green hover:bg-palop-green/90"
          disabled={payDisabled}
          data-testid="button-complete-purchase"
        >
          {isCreatingOrder
            ? "Creating Your Order..."
            : isSubmitting
              ? c.paymentProcessing
              : !elementReady && !loadError
                ? c.paymentFormLoading
                : `Pay €${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

export default PaymentDetails;
