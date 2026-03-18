
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import PurchaseFormWithOrders from "@/components/PurchaseFormWithOrders";
import PurchaseSteps from "@/components/PurchaseSteps";
import SelectedPlanSummary from "@/components/SelectedPlanSummary";
import ESIMPlans from "@/components/ESIMPlans";

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

  // Pre-defined plans — new public plans + legacy eSIM Access plans
  const availablePlans: ESIMPlan[] = [
    // New public plans (from /plans page)
    {
      id: "portugal-starter",
      name: "Portugal Starter",
      data: "2 GB",
      days: 3,
      price: 4.99,
      currency: "EUR",
      features: [
        "2 GB of Internet",
        "Valid for 3 days",
        "Portugal coverage",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "portugal-weekly",
      name: "Portugal Weekly",
      data: "5 GB",
      days: 7,
      price: 8.99,
      currency: "EUR",
      features: [
        "5 GB of Internet",
        "Valid for 7 days",
        "Portugal coverage",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "portugal-monthly",
      name: "Portugal Monthly",
      data: "10 GB",
      days: 30,
      price: 16.99,
      currency: "EUR",
      features: [
        "10 GB of Internet",
        "Valid for 30 days",
        "Portugal coverage",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "europe-weekly",
      name: "Europe Weekly",
      data: "5 GB",
      days: 7,
      price: 9.99,
      currency: "EUR",
      features: [
        "5 GB of Internet",
        "Valid for 7 days",
        "Portugal + Europe coverage",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "europe-monthly",
      name: "Europe Monthly",
      data: "10 GB",
      days: 30,
      price: 19.99,
      currency: "EUR",
      features: [
        "10 GB of Internet",
        "Valid for 30 days",
        "Portugal + Europe coverage",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "europe-plus",
      name: "Europe Plus",
      data: "20 GB",
      days: 30,
      price: 29.99,
      currency: "EUR",
      features: [
        "20 GB of Internet",
        "Valid for 30 days",
        "Portugal + Europe coverage",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "palop-connect",
      name: "PALOP Connect",
      data: "5 GB",
      days: 7,
      price: 12.50,
      currency: "EUR",
      features: [
        "5 GB of Internet",
        "Valid for 7 days",
        "Selected PALOP-linked countries",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "diaspora-europe",
      name: "Diaspora Europe",
      data: "10 GB",
      days: 30,
      price: 27.50,
      currency: "EUR",
      features: [
        "10 GB of Internet",
        "Valid for 30 days",
        "Europe + selected PALOP-linked countries",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    {
      id: "cplp-global",
      name: "CPLP Global",
      data: "10 GB",
      days: 30,
      price: 22.00,
      currency: "EUR",
      features: [
        "10 GB of Internet",
        "Valid for 30 days",
        "CPLP countries coverage",
        "Instant QR delivery",
        "No contract required"
      ]
    },
    // Legacy eSIM Access plans (preserved for backward compatibility)
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
    },
    {
      id: "palop-neighbours1",
      name: "Palop Neighbours1",
      data: "100 MB",
      days: 7,
      price: 2.30,
      currency: "EUR",
      features: [
        "100 MB of Internet",
        "Valid for 7 days",
        "Algeria coverage",
        "Real eSIM provisioning",
        "Instant QR delivery",
        "eSIM Access powered"
      ]
    },
    {
      id: "palop-neighbours2",
      name: "Palop Neighbours2",
      data: "1 GB",
      days: 7,
      price: 7.70,
      currency: "EUR",
      features: [
        "1 GB of Internet",
        "Valid for 7 days",
        "25+ African areas",
        "Multi-area coverage",
        "Data reloadable",
        "eSIM Access powered"
      ]
    }
  ];

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />

      <PurchaseSteps currentStep={currentStep} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {currentStep === "plans" && (
            <ESIMPlans onSelectPlan={handlePlanSelection} />
          )}

          {currentStep !== "plans" && selectedPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2">
                <SelectedPlanSummary plan={selectedPlan} />
              </div>
              <div className="lg:col-span-3">
                <PurchaseFormWithOrders
                  plan={selectedPlan}
                  currentStep={currentStep}
                  onBackToPlans={handleBackToPlans}
                  onProceedToPayment={handleProceedToPayment}
                  onConfirmation={handleConfirmation}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default Purchase;
