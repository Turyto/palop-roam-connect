
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ESIMPlan } from "@/pages/Purchase";

interface ConfirmationViewProps {
  plan: ESIMPlan;
  onBackToPlans: () => void;
}

const ConfirmationView = ({ plan, onBackToPlans }: ConfirmationViewProps) => {
  return (
    <div className="text-center p-8 bg-white rounded-lg shadow">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Thank You for Your Purchase!</h2>
      <p className="mb-6 text-gray-600">
        Your eSIM details have been sent to your email. Please check your inbox.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        <p className="font-medium">{plan.name}</p>
        <p className="text-gray-600">{plan.data} for {plan.days} days</p>
        <p className="font-bold mt-2">{plan.price.toFixed(2)} {plan.currency}</p>
      </div>
      <Button 
        onClick={onBackToPlans}
        className="bg-palop-green hover:bg-palop-green/90"
      >
        Purchase Another eSIM
      </Button>
    </div>
  );
};

export default ConfirmationView;
