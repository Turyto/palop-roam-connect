
import PlanComparisonCard, { PlanData, PlanFeatures } from "./PlanComparisonCard";

interface DesktopPlanComparisonProps {
  plans: PlanData[];
  featureLabels: Record<keyof PlanFeatures, string>;
}

const DesktopPlanComparison = ({ plans, featureLabels }: DesktopPlanComparisonProps) => {
  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <PlanComparisonCard
            key={plan.id}
            plan={plan}
            featureLabels={featureLabels}
            isExpanded={true}
            onToggleExpansion={() => {}}
            isMobile={false}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopPlanComparison;
