
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import PurchaseFormWithOrders from "@/components/PurchaseFormWithOrders";
import PurchaseSteps from "@/components/PurchaseSteps";
import SelectedPlanSummary from "@/components/SelectedPlanSummary";
import { useAvailableStorefrontPlans } from "@/hooks/useStorefrontPlans";

type PurchaseStep = "checkout" | "payment";

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
  const navigate = useNavigate();
  const planParam = searchParams.get('plan');
  const [currentStep, setCurrentStep] = useState<PurchaseStep>("checkout");
  const [selectedPlan, setSelectedPlan] = useState<ESIMPlan | null>(null);
  const { purchasablePlans, isLoading: plansLoading, error: plansError } = useAvailableStorefrontPlans();

  useEffect(() => {
    if (!planParam) {
      navigate('/plans', { replace: true });
    }
  }, [planParam, navigate]);

  // Purchasable plans — public storefront plans (from the plans table, managed
  // in the admin panel) + legacy eSIM Access plans.
  const availablePlans: ESIMPlan[] = [
    // Active storefront plans. Plans marked unavailable (supplier not live yet)
    // are excluded by the hook so they cannot be purchased via a direct URL.
    ...purchasablePlans.map((p): ESIMPlan => ({
      id: p.id,
      name: p.name.en,
      data: p.data,
      days: parseInt(p.validityDays, 10),
      price: p.priceNumber,
      currency: "EUR",
      features: [
        `${p.data} of Internet`,
        `Valid for ${p.validityDays} days`,
        `${p.coverageLabel.en} coverage`,
        "Instant QR delivery",
        "No contract required"
      ]
    })),
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
    if (!planParam) return;
    // Legacy plans are always resolvable, even while (or if) the storefront
    // fetch is loading or failed — checkout must never depend on it for them.
    const plan = availablePlans.find(p => p.id === planParam);
    if (plan) {
      setSelectedPlan(plan);
      setCurrentStep("checkout");
      return;
    }
    // Only declare a plan unknown once storefront plans loaded successfully.
    if (!plansLoading && !plansError) {
      navigate('/plans', { replace: true });
    }
    // On error we keep the page and show the error state below.
  }, [planParam, plansLoading, plansError, purchasablePlans.length]);

  const handleBackToPlans = () => {
    navigate('/plans');
  };

  const handleProceedToPayment = () => {
    setCurrentStep("payment");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />

      <PurchaseSteps currentStep={currentStep} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {!selectedPlan && planParam && plansError && (
            <div className="text-center py-16" data-testid="purchase-plans-error">
              <p className="text-gray-700 font-medium mb-2">
                Não foi possível carregar o plano. / Could not load the plan.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Verifica a tua ligação e tenta novamente. / Check your connection and try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-palop-green underline hover:opacity-75"
              >
                Tentar novamente / Try again
              </button>
            </div>
          )}
          {selectedPlan && (
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
