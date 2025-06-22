import { Button } from "@/components/ui/button";
import { ESIMPlan } from "@/pages/Purchase";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import CartOverview from "./CartOverview";
import PaymentDetails from "./PaymentDetails";
import ContactForm, { checkoutFormSchema } from "./ContactForm";
import ConfirmationView from "./ConfirmationView";

interface PurchaseFormWithOrdersProps {
  plan: ESIMPlan;
  currentStep: "checkout" | "payment" | "confirmation";
  onBackToPlans: () => void;
  onProceedToPayment: () => void;
  onConfirmation: () => void;
}

const PurchaseFormWithOrders = ({ 
  plan, 
  currentStep, 
  onBackToPlans, 
  onProceedToPayment,
  onConfirmation
}: PurchaseFormWithOrdersProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createOrderAsync, isCreatingOrder } = useOrders();
  
  const form = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: user?.email || "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof checkoutFormSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (currentStep === "checkout") {
      onProceedToPayment();
    } else if (currentStep === "payment") {
      try {
        // Create order in database
        const order = await createOrderAsync({
          plan_id: plan.id,
          plan_name: plan.name,
          data_amount: plan.data,
          duration_days: plan.days,
          price: plan.price,
          currency: plan.currency
        });

        console.log('Order created:', order);

        toast({
          title: "Order Created Successfully!",
          description: "Your order has been placed. Proceeding to payment...",
        });

        // In a real implementation, you would integrate with payment processing here
        // For now, we'll simulate a successful payment
        setTimeout(() => {
          toast({
            title: "Payment Successful!",
            description: "Your eSIM will be delivered to your email shortly.",
          });
          onConfirmation();
        }, 1500);

      } catch (error) {
        console.error('Order creation failed:', error);
        toast({
          title: "Order Creation Failed",
          description: "There was an error creating your order. Please try again.",
          variant: "destructive",
        });
      }
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
              disabled={isCreatingOrder}
            >
              Back
            </Button>
            <Button 
              type="submit"
              className="bg-palop-green hover:bg-palop-green/90"
              disabled={isCreatingOrder}
            >
              {isCreatingOrder 
                ? "Creating Order..." 
                : currentStep === "checkout" 
                  ? "Continue" 
                  : "Complete Purchase"
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PurchaseFormWithOrders;
