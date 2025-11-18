
import type { ESIMActivation } from "@/types/esimActivations";

interface ProvisioningLogProps {
  activation: ESIMActivation;
}

const ProvisioningLog = ({ activation }: ProvisioningLogProps) => {
  if (!activation.provisioning_log) return null;

  return (
    <div>
      <label className="text-sm font-medium text-gray-600">Provisioning Log</label>
      <pre className="text-xs bg-gray-50 p-3 rounded-md mt-1 overflow-auto max-h-32">
        {JSON.stringify(activation.provisioning_log, null, 2)}
      </pre>
    </div>
  );
};

export default ProvisioningLog;
