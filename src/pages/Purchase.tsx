
import { useState } from "react";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ESIMPlans from "@/components/ESIMPlans";
import PurchaseForm from "@/components/PurchaseForm";
import PurchaseSteps from "@/components/PurchaseSteps";

type PurchaseStep = "plans" | "checkout" | "payment" | "confirmation";

export type ESIMPlan = {
  id: string;
  name: string;
  data: string;
  days: number;
  price: number;
  currency: string;
  features: string[];
};

const Purchase = () => {
  const [currentStep, setCurrentStep] = useState<PurchaseStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<ESIMPlan | null>(null);
  
  const handlePlanSelection = (plan: ESIMPlan) => {
    setSelectedPlan(plan);
    setCurrentStep("checkout");
  };
  
  const handleBackToPlans = () => {
    setCurrentStep("plans");
  };
  
  const handleProceedToPayment = () => {
    setCurrentStep("payment");
  };
  
  const handleConfirmation = () => {
    setCurrentStep("confirmation");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-palop-green to-palop-blue">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">PALOP eSIM</h1>
            <p className="text-white text-xl opacity-90">Stay connected across all PALOP countries</p>
          </div>
        </div>
        
        <PurchaseSteps currentStep={currentStep} />
        
        <div className="container mx-auto px-4 py-8">
          {currentStep === "plans" && (
            <ESIMPlans onSelectPlan={handlePlanSelection} />
          )}
          
          {currentStep !== "plans" && selectedPlan && (
            <PurchaseForm 
              plan={selectedPlan} 
              currentStep={currentStep}
              onBackToPlans={handleBackToPlans}
              onProceedToPayment={handleProceedToPayment}
              onConfirmation={handleConfirmation}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Purchase;
