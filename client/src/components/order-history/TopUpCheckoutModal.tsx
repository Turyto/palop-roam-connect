import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentDetails from "@/components/PaymentDetails";
import {
  useTopUpOptions,
  useCreateTopUpIntent,
  useTopUpOrderStatus,
  TopUpOption,
  TopUpIntent,
} from "@/hooks/useTopUpOrders";
import { Zap, Wifi, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language";
import { useQueryClient } from "@tanstack/react-query";

interface TopUpCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

type Step = "options" | "pay" | "result";

const TopUpCheckoutModal = ({ isOpen, onClose, order }: TopUpCheckoutModalProps) => {
  const { t } = useLanguage();
  const o = t.orders;
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("options");
  const [selectedOption, setSelectedOption] = useState<TopUpOption | null>(null);
  const [intent, setIntent] = useState<TopUpIntent | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [waitedTooLong, setWaitedTooLong] = useState(false);

  const { data: optionsData, isLoading: optionsLoading } = useTopUpOptions(order?.id ?? null, isOpen);
  const createIntent = useCreateTopUpIntent();
  const { data: topUpStatus } = useTopUpOrderStatus(pollingId);

  const stripePromise = useMemo(() => {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return pk ? loadStripe(pk) : null;
  }, []);

  // "Still working" notice if the webhook takes unusually long.
  useEffect(() => {
    if (step !== "result" || !pollingId) return;
    setWaitedTooLong(false);
    const timer = setTimeout(() => setWaitedTooLong(true), 45000);
    return () => clearTimeout(timer);
  }, [step, pollingId]);

  if (!order) return null;

  const resetAndClose = () => {
    onClose();
    setStep("options");
    setSelectedOption(null);
    setIntent(null);
    setIntentError(null);
    setPollingId(null);
    if (topUpStatus?.status === "completed" || topUpStatus?.status === "failed") {
      queryClient.invalidateQueries({ queryKey: ["topup-orders"] });
    }
  };

  const handleOptionSelect = (option: TopUpOption) => {
    setSelectedOption(option);
    setIntentError(null);
    createIntent.mutate(
      { parentOrderId: order.id, optionId: option.id },
      {
        onSuccess: (data) => {
          setIntent(data);
          setStep("pay");
        },
        onError: (err) => setIntentError(err.message),
      },
    );
  };

  const handlePaymentSuccess = () => {
    if (intent) setPollingId(intent.topUpOrderId);
    setStep("result");
  };

  const handleBackToOptions = () => {
    setStep("options");
    setSelectedOption(null);
    setIntent(null);
    setIntentError(null);
  };

  const status = topUpStatus?.status;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && step !== "pay") resetAndClose(); }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {step === "pay" && (
              <button
                onClick={handleBackToOptions}
                className="mr-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={o.topUpBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Zap className="h-4 w-4 text-palop-green" />
            {step === "pay" ? o.topUpCompleteTitle : o.topUpTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {step === "pay" && selectedOption
              ? `${selectedOption.name} — ${order.plan_name}`
              : o.topUpSubtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-1">
          {step !== "result" && (
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{o.topUpCurrentPlan}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="text-gray-500">{order.plan_name}</div>
                <div className="text-gray-700 font-medium text-right">€{order.price}</div>
                <div className="text-gray-400">{order.data_amount}</div>
                <div className="text-gray-400 text-right">{order.duration_days} dias</div>
              </div>
            </div>
          )}

          {step === "options" && (
            <>
              {optionsLoading && (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin text-palop-green" />
                  <span className="text-sm">{o.topUpLoading}</span>
                </div>
              )}

              {!optionsLoading && optionsData && !optionsData.supported && (
                <div className="flex items-start gap-2.5 p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    {optionsData.reason === "esim_not_provisioned" || optionsData.reason === "order_not_completed"
                      ? o.topUpNotReady
                      : o.topUpUnavailable}
                  </span>
                </div>
              )}

              {!optionsLoading && optionsData?.supported && (
                <div className="space-y-2">
                  {optionsData.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                      disabled={createIntent.isPending}
                      className="w-full text-left bg-white border border-gray-100 rounded-xl p-4 hover:border-palop-green/40 hover:bg-palop-green/5 transition-all group disabled:opacity-60"
                      data-testid={`button-topup-option-${option.id}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 bg-blue-50">
                            {createIntent.isPending && selectedOption?.id === option.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Wifi className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-palop-green transition-colors">
                              {option.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {option.data_amount && o.topUpDataLabel.replace("{amount}", option.data_amount)}
                              {option.validity_days ? ` · ${o.topUpDaysLabel.replace("{days}", String(option.validity_days))}` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-gray-900">€{option.price}</div>
                          <div className="text-xs text-gray-400">{option.currency}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {intentError && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{intentError}</span>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button variant="ghost" size="sm" onClick={resetAndClose} className="text-gray-500">
                  {o.topUpCancel}
                </Button>
              </div>
            </>
          )}

          {step === "pay" && intent && stripePromise && selectedOption && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: intent.clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#16a34a", borderRadius: "8px" },
                },
              }}
            >
              <PaymentDetails
                onSuccess={handlePaymentSuccess}
                onBack={handleBackToOptions}
                isCreatingOrder={false}
                amount={intent.amount}
                currency={intent.currency}
              />
            </Elements>
          )}

          {step === "result" && (
            <div className="py-6 text-center space-y-3">
              {status === "completed" ? (
                <>
                  <CheckCircle2 className="h-10 w-10 text-palop-green mx-auto" />
                  <p className="font-semibold text-gray-900">{o.topUpSuccessTitle}</p>
                  <p className="text-sm text-gray-500">{o.topUpSuccessDesc}</p>
                  <Button onClick={resetAndClose} className="bg-palop-green hover:bg-palop-green/90 text-white mt-2">
                    {o.topUpDone}
                  </Button>
                </>
              ) : status === "failed" ? (
                <>
                  <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
                  <p className="font-semibold text-gray-900">{o.topUpFailedTitle}</p>
                  <p className="text-sm text-gray-500">{o.topUpFailedDesc}</p>
                  <Button variant="outline" onClick={resetAndClose} className="mt-2">
                    {o.topUpDone}
                  </Button>
                </>
              ) : (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-palop-green mx-auto" />
                  <p className="font-semibold text-gray-900">{o.topUpApplying}</p>
                  <p className="text-sm text-gray-500">
                    {waitedTooLong ? o.topUpTakingLong : o.topUpApplyingDesc}
                  </p>
                  {waitedTooLong && (
                    <Button variant="outline" onClick={resetAndClose} className="mt-2">
                      {o.topUpDone}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopUpCheckoutModal;
