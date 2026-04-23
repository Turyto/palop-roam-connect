
import { useState, useEffect, useMemo, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { ESIMPlan } from "@/pages/Purchase";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useCreateOrderWithESIM } from "@/hooks/orders/useCreateOrderWithESIM";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import CartOverview from "./CartOverview";
import PaymentDetails from "./PaymentDetails";
import ContactForm, { checkoutFormSchema } from "./ContactForm";
import { Loader2 } from "lucide-react";

interface PurchaseFormWithOrdersProps {
  plan: ESIMPlan;
  currentStep: "checkout" | "payment";
  onBackToPlans: () => void;
  onProceedToPayment: () => void;
}

const PurchaseFormWithOrders = ({
  plan,
  currentStep,
  onBackToPlans,
  onProceedToPayment,
}: PurchaseFormWithOrdersProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrderAsync, isCreatingOrder } = useCreateOrderWithESIM();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState<string>("");
  // True only when checkout was completed by an unauthenticated (anonymous) user
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  // Email captured at checkout — used for both guests and authenticated users
  const collectedEmailRef = useRef<string>("");

  const stripePromise = useMemo(() => {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!pk) return null;
    return loadStripe(pk);
  }, []);

  const form = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: user?.email || "",
      termsAccepted: false,
    },
  });

  // Create Stripe payment intent when user enters payment step
  useEffect(() => {
    if (currentStep !== "payment" || clientSecret || paymentLoading) return;

    setPaymentLoading(true);
    setPaymentError(null);

    supabase.functions
      .invoke("create-payment-intent", {
        body: {
          amount: plan.price,
          currency: plan.currency.toLowerCase(),
          plan_name: plan.name,
          plan_id: plan.id,
          customer_email: collectedEmailRef.current,
        },
      })
      .then(({ data, error }) => {
        if (error || !data?.clientSecret) {
          const msg = data?.error || error?.message || "Could not initialise payment. Please try again.";
          setPaymentError(msg);
          toast({ title: "Payment Error", description: msg, variant: "destructive" });
        } else {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        }
        setPaymentLoading(false);
      });
  }, [currentStep]);

  // Checkout form submit → move to payment step (supports both guests and signed-in users)
  const onCheckoutSubmit = async (data: z.infer<typeof checkoutFormSchema>) => {
    const emailForOrder = data.email || user?.email || "";

    // Always capture the email from the form so it's available at payment success time
    collectedEmailRef.current = emailForOrder;

    if (!user) {
      // Guest path: sign in anonymously so the order can be saved with a valid user_id
      setIsGuestCheckout(true);
      setGuestEmail(emailForOrder);

      const { error: anonError } = await supabase.auth.signInAnonymously({
        options: { data: { email: emailForOrder } },
      });
      if (anonError) {
        toast({
          title: "Could not start session",
          description: "Please try again or sign in to continue.",
          variant: "destructive",
        });
        return;
      }
    }

    onProceedToPayment();
  };

  // Called by PaymentDetails after Stripe confirms payment
  const handlePaymentSuccess = async (confirmedPaymentIntentId: string) => {
    // Use the email captured at checkout (works for both guests and authenticated users).
    // Fall back to user.email if somehow the ref wasn't set (e.g. deep-link straight to payment).
    const emailForOrder = collectedEmailRef.current || user?.email || "";

    try {
      const result = await createOrderAsync({
        plan_id: plan.id,
        plan_name: plan.name,
        data_amount: plan.data,
        duration_days: plan.days,
        price: plan.price,
        currency: plan.currency,
        payment_intent_id: confirmedPaymentIntentId,
        customerEmail: emailForOrder,
      });

      // Send a magic-link sign-in email so guests can re-access their order later.
      if (isGuestCheckout && emailForOrder) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: emailForOrder,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/orders`,
          },
        });
        if (otpError) {
          // Non-fatal: order is created and eSIM details are on screen.
          console.error("Failed to send access link email:", otpError);
          toast({
            title: "Order complete",
            description: "Your eSIM is ready. We were unable to send the sign-in link — please save your details from this page.",
            variant: "destructive",
          });
        }
      }

      navigate(`/success?payment_intent=${confirmedPaymentIntentId}`);
    } catch (error: unknown) {
      console.error("Order creation failed:", error);
      toast({
        title: "Order Error",
        description:
          "Payment was successful but order creation failed. Please contact support with your payment reference.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <CartOverview plan={plan} />

      {currentStep === "checkout" && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onCheckoutSubmit)} className="space-y-6">
            <ContactForm form={form} />
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onBackToPlans}
                data-testid="button-back-to-plans"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-palop-green hover:bg-palop-green/90"
                data-testid="button-continue-to-payment"
              >
                Continue to Payment
              </Button>
            </div>
          </form>
        </Form>
      )}

      {currentStep === "payment" && (
        <div>
          {paymentLoading && (
            <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center gap-3 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Initialising secure payment...</span>
            </div>
          )}

          {paymentError && !paymentLoading && (
            <div className="bg-white rounded-lg shadow p-6 text-center space-y-4">
              <p className="text-red-500 text-sm">{paymentError}</p>
              <Button
                onClick={() => {
                  setPaymentError(null);
                  setClientSecret(null);
                }}
                className="bg-palop-green hover:bg-palop-green/90"
              >
                Try Again
              </Button>
            </div>
          )}

          {!stripePromise && !paymentLoading && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
              Stripe is not configured yet. Please connect your Stripe account to enable payments.
            </div>
          )}

          {clientSecret && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#16a34a",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <PaymentDetails
                onSuccess={handlePaymentSuccess}
                onBack={onBackToPlans}
                isCreatingOrder={isCreatingOrder}
                amount={plan.price}
                currency={plan.currency}
              />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseFormWithOrders;
