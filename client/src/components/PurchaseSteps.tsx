
import { Check, CreditCard, ShoppingCart } from "lucide-react";

interface PurchaseStepsProps {
  currentStep: "plans" | "checkout" | "payment";
}

const PurchaseSteps = ({ currentStep }: PurchaseStepsProps) => {
  const steps = [
    { id: "plans", label: "Select Plan" },
    { id: "checkout", label: "Cart Overview" },
    { id: "payment", label: "Data and Payment" },
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
                
                {/* Step label */}
                <span className={`ml-2 text-sm hidden md:inline ${
                  isActive || isComplete ? "text-palop-green font-medium" : "text-gray-500"
                }`}>
                  {step.label}
                </span>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`w-12 md:w-24 h-0.5 mx-2 ${
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
