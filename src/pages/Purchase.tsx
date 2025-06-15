
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  const [currentStep, setCurrentStep] = useState<PurchaseStep>(planParam ? "checkout" : "plans");
  const [selectedPlan, setSelectedPlan] = useState<ESIMPlan | null>(null);
  
  // Pre-defined plans
  const availablePlans: ESIMPlan[] = [
    {
      id: "lite",
      name: "Lite",
      data: "1-2 GB",
      days: 7,
      price: 6,
      currency: "EUR",
      features: [
        "1-2 GB of Internet",
        "Valid for 7 days",
        "QR-code activation",
        "Airport availability",
        "Tourist-friendly setup"
      ]
    },
    {
      id: "core",
      name: "Core",
      data: "3-5 GB", 
      days: 30,
      price: 12.50,
      currency: "EUR",
      features: [
        "3-5 GB of Internet",
        "Valid for 30 days",
        "Diaspora gifting enabled",
        "SMS welcome pack",
        "Community support"
      ]
    },
    {
      id: "plus",
      name: "Plus",
      data: "10 GB",
      days: 30,
      price: 27.50,
      currency: "EUR",
      features: [
        "10 GB of Internet",
        "Valid for 30 days",
        "PALOP+ roaming",
        "Priority support",
        "Business-grade reliability"
      ]
    }
  ];

  // Set selected plan based on URL parameter
  useEffect(() => {
    if (planParam) {
      const plan = availablePlans.find(p => p.id === planParam);
      if (plan) {
        setSelectedPlan(plan);
        setCurrentStep("checkout");
      }
    }
  }, [planParam]);
  
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
