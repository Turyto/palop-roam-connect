
import { coverageClusters } from "@/data/coverageClusters";
import ComparisonMetricsBar from "./comparison/ComparisonMetricsBar";
import MobilePlanComparison from "./comparison/MobilePlanComparison";
import DesktopPlanComparison from "./comparison/DesktopPlanComparison";
import { PlanData, PlanFeatures } from "./comparison/PlanComparisonCard";

const PlanComparison = () => {
  const plans: PlanData[] = [
    {
      id: "palop-core",
      name: "PALOP Core 3GB",
      clusterName: "PALOP Core",
      data: "3 GB",
      duration: "30 days",
      price: "€12.50",
      color: "bg-palop-green",
      badgeColor: "bg-palop-green",
      countries: coverageClusters.find(c => c.id === 'palop-core')?.countries || [],
      features: {
        dataAllowance: "3 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: true,
        palopRoaming: false,
        prioritySupport: false,
        cplpCoverage: false
      }
    },
    {
      id: "palop-regional",
      name: "PALOP Regional 5GB",
      clusterName: "PALOP Regional",
      data: "5 GB",
      duration: "30 days",
      price: "€18.50",
      color: "bg-palop-blue",
      badgeColor: "bg-palop-blue",
      countries: coverageClusters.find(c => c.id === 'palop-regional')?.countries || [],
      popular: true,
      features: {
        dataAllowance: "5 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: true,
        palopRoaming: true,
        prioritySupport: true,
        cplpCoverage: false
      }
    },
    {
      id: "diaspora-europe",
      name: "Diaspora Europe 10GB",
      clusterName: "Diaspora Europe",
      data: "10 GB",
      duration: "30 days",
      price: "€27.50",
      color: "bg-palop-yellow",
      badgeColor: "bg-palop-yellow",
      countries: coverageClusters.find(c => c.id === 'palop-diaspora')?.countries || [],
      features: {
        dataAllowance: "10 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: true,
        palopRoaming: true,
        prioritySupport: true,
        cplpCoverage: false
      }
    },
    {
      id: "cplp-global",
      name: "CPLP Essential 5GB",
      clusterName: "CPLP Global",
      data: "5 GB",
      duration: "30 days",
      price: "€22.00",
      color: "bg-red-500",
      badgeColor: "bg-red-500",
      countries: coverageClusters.find(c => c.id === 'cplp-global')?.countries || [],
      features: {
        dataAllowance: "5 GB",
        validityPeriod: "30 days",
        qrActivation: true,
        diasporaGifting: false,
        palopRoaming: false,
        prioritySupport: false,
        cplpCoverage: true
      }
    }
  ];

  const featureLabels: Record<keyof PlanFeatures, string> = {
    dataAllowance: "Data Allowance",
    validityPeriod: "Validity Period",
    diasporaGifting: "Diaspora Gifting",
    palopRoaming: "PALOP+ Roaming",
    qrActivation: "QR Activation",
    prioritySupport: "Priority Support",
    cplpCoverage: "CPLP Coverage"
  };

  const totalCountries = Math.max(...plans.map(plan => plan.countries.length));
  const mostPopularPlan = plans.find(plan => plan.popular);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare All Plans</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Find the perfect plan for your needs with our detailed comparison
          </p>
          
          <ComparisonMetricsBar 
            totalCountries={totalCountries}
            mostPopularPlan={mostPopularPlan}
          />
        </div>

        <MobilePlanComparison plans={plans} featureLabels={featureLabels} />
        <DesktopPlanComparison plans={plans} featureLabels={featureLabels} />
      </div>
    </section>
  );
};

export default PlanComparison;
