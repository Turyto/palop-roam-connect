
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard } from "lucide-react";
import { ESIMPlan } from "@/pages/Purchase";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

interface PurchaseFormProps {
  plan: ESIMPlan;
  currentStep: "checkout" | "payment" | "confirmation";
  onBackToPlans: () => void;
  onProceedToPayment: () => void;
  onConfirmation: () => void;
}

const checkoutFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

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
      // In a real application, we would process the payment here
      toast({
        title: "Payment Successful!",
        description: "Your eSIM will be delivered to your email shortly.",
      });
      onConfirmation();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {currentStep === "confirmation" ? (
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
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Cart overview section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="font-semibold text-lg">Cart Overview</h2>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead className="text-left">
                    <tr>
                      <th className="py-2">NAME</th>
                      <th className="py-2 text-right">PAY NOW</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-4">
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-gray-600">{plan.data} for {plan.days} days</div>
                      </td>
                      <td className="py-4 text-right font-bold text-palop-red">
                        {plan.price.toFixed(2)} {plan.currency}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-4">eSIM</td>
                      <td className="py-4 text-right font-medium">0.00 {plan.currency}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-4 font-bold">TOTAL</td>
                      <td className="pt-4 text-right font-bold text-palop-red">
                        {plan.price.toFixed(2)} {plan.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment section - only shown in payment step */}
            {currentStep === "payment" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="font-semibold text-lg">Payment Details</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-md">
                    <CreditCard className="text-gray-600" />
                    <span className="font-medium">Credit Card Payment</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <Input placeholder="1234 5678 9012 3456" className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                        <Input placeholder="John Smith" className="w-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <Input placeholder="MM/YY" className="w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <Input placeholder="123" className="w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email and terms - shown in checkout step */}
            {currentStep === "checkout" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="font-semibold text-lg">Contact Information</h2>
                </div>
                <div className="p-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">
                              I agree with the <a href="#" className="text-palop-blue underline">online purchase general conditions</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
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
                className="bg-palop-red hover:bg-palop-red/90"
              >
                {currentStep === "checkout" ? "Continue" : "Complete Purchase"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PurchaseForm;
