
import type { ESIMActivation } from "@/types/esimActivations";

interface ActivationInfoProps {
  activation: ESIMActivation;
}

const ActivationInfo = ({ activation }: ActivationInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-600">Activation ID</label>
        <div className="font-mono text-sm text-gray-900">{activation.id}</div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">Order ID</label>
        <div className="font-mono text-sm text-gray-900">{activation.order_id}</div>
      </div>
    </div>
  );
};

export default ActivationInfo;
