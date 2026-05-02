
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/language";

interface PurchaseStepsProps {
  currentStep: "plans" | "checkout" | "payment" | "confirmation";
}

const PurchaseSteps = ({ currentStep }: PurchaseStepsProps) => {
  const { t } = useLanguage();
  const c = t.checkout;

  const steps = [
    { id: "plans", label: c.stepPlans },
    { id: "checkout", label: c.stepCheckout },
    { id: "payment", label: c.stepPayment },
    { id: "confirmation", label: c.stepConfirmation },
  ];

  return (
    <div className="border-t border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isComplete = steps.findIndex(s => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step indicator */}
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isActive || isComplete ? "border-palop-green bg-palop-green text-white" : "border-gray-300 bg-white text-gray-500"
                }`}>
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>

                {/* Step label — visible from sm upward so it shows on most phones in landscape */}
                <span className={`ml-2 text-sm hidden sm:inline ${
                  isActive || isComplete ? "text-palop-green font-medium" : "text-gray-500"
                }`}>
                  {step.label}
                </span>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 md:w-24 h-0.5 mx-2 ${
                    isComplete ? "bg-palop-green" : "bg-gray-300"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PurchaseSteps;
