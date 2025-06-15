import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ESIMPlans from "@/components/ESIMPlans";
import PurchaseForm from "@/components/PurchaseForm";
import PurchaseSteps from "@/components/PurchaseSteps";
import PlanValueProposition from "@/components/PlanValueProposition";

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
    },
    {
      id: "ngo",
      name: "NGO Pack",
      data: "10+ GB",
      days: 60,
      price: 35,
      currency: "EUR",
      features: [
        "10+ GB of Internet",
        "Valid for 30-90 days",
        "Multi-SIM support",
        "Usage control dashboard",
        "Partner integration",
        "Bulk purchasing options",
        "Field operations support"
      ]
    },
    {
      id: "local-cplp",
      name: "Local CPLP",
      data: "3-5 GB",
      days: 22,
      price: 7.50,
      currency: "EUR",
      features: [
        "3-5 GB of Internet",
        "Valid for 15-30 days",
        "CPLP roaming model",
        "Low-cost parity",
        "Domestic traveler focus",
        "Regional partnerships",
        "Cultural exchange benefits"
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
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Plan details and value proposition */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-palop-green mb-2">{selectedPlan.name} Plan</h2>
                      <div className="text-3xl font-bold text-gray-800">€{selectedPlan.price.toFixed(2)}</div>
                      <div className="text-gray-600">{selectedPlan.data} for {selectedPlan.days} days</div>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-palop-green mr-3" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <PlanValueProposition plan={selectedPlan} />
                </div>
                
                {/* Right side - Purchase form */}
                <div>
                  <PurchaseForm 
                    plan={selectedPlan} 
                    currentStep={currentStep}
                    onBackToPlans={handleBackToPlans}
                    onProceedToPayment={handleProceedToPayment}
                    onConfirmation={handleConfirmation}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Purchase;
