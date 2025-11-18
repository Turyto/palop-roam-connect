
import { Button } from "@/components/ui/button";
import { ESIMPlan } from "@/pages/Purchase";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import CartOverview from "./CartOverview";
import PaymentDetails from "./PaymentDetails";
import ContactForm, { checkoutFormSchema } from "./ContactForm";
import ConfirmationView from "./ConfirmationView";

interface PurchaseFormProps {
  plan: ESIMPlan;
  currentStep: "checkout" | "payment" | "confirmation";
  onBackToPlans: () => void;
  onProceedToPayment: () => void;
  onConfirmation: () => void;
}

const PurchaseForm = ({ 
  plan, 
  currentStep, 
  onBackToPlans, 
  onProceedToPayment,
  onConfirmation
}: PurchaseFormProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      termsAccepted: false,
    },
  });

  const onSubmit = (data: z.infer<typeof checkoutFormSchema>) => {
    if (currentStep === "checkout") {
      onProceedToPayment();
    } else if (currentStep === "payment") {
      toast({
        title: "Payment Successful!",
        description: "Your eSIM will be delivered to your email shortly.",
      });
      onConfirmation();
    }
  };

  if (currentStep === "confirmation") {
    return <ConfirmationView plan={plan} onBackToPlans={onBackToPlans} />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CartOverview plan={plan} />

          {currentStep === "payment" && <PaymentDetails />}

          {currentStep === "checkout" && <ContactForm form={form} />}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBackToPlans}
            >
              Back
            </Button>
            <Button 
              type="submit"
              className="bg-palop-green hover:bg-palop-green/90"
            >
              {currentStep === "checkout" ? "Continue" : "Complete Purchase"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PurchaseForm;
