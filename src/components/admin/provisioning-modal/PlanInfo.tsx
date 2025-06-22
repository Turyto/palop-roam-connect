
import type { ESIMActivation } from "@/types/esimActivations";

interface PlanInfoProps {
  activation: ESIMActivation;
}

const PlanInfo = ({ activation }: PlanInfoProps) => {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-2">Plan Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Plan Name</label>
          <div className="text-sm text-gray-900">
            {activation.orders?.plan_name || 'Unknown Plan'}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Data Amount</label>
          <div className="text-sm text-gray-900">
            {activation.orders?.data_amount || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanInfo;
