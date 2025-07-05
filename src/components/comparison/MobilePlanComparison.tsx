
import { useState } from "react";
import PlanComparisonCard, { PlanData, PlanFeatures } from "./PlanComparisonCard";

interface MobilePlanComparisonProps {
  plans: PlanData[];
  featureLabels: Record<keyof PlanFeatures, string>;
}

const MobilePlanComparison = ({ plans, featureLabels }: MobilePlanComparisonProps) => {
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  const toggleMobileExpansion = (planId: string) => {
    setExpandedMobile(expandedMobile === planId ? null : planId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {plans.map((plan) => (
        <PlanComparisonCard
          key={plan.id}
          plan={plan}
          featureLabels={featureLabels}
          isExpanded={expandedMobile === plan.id}
          onToggleExpansion={() => toggleMobileExpansion(plan.id)}
          isMobile={true}
        />
      ))}
    </div>
  );
};

export default MobilePlanComparison;
