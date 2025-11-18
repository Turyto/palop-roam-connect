
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";
import type { ESIMActivation } from "@/types/esimActivations";

interface ProvisioningActionsProps {
  activation: ESIMActivation;
  onClose: () => void;
  onRetry: (activationId: string) => void;
  onMarkComplete: (activationId: string) => void;
  isRetrying: boolean;
  isMarkingComplete: boolean;
}

const ProvisioningActions = ({
  activation,
  onClose,
  onRetry,
  onMarkComplete,
  isRetrying,
  isMarkingComplete
}: ProvisioningActionsProps) => {
  return (
    <div className="flex gap-3 pt-4 border-t">
      <Button variant="outline" onClick={onClose} className="flex-1">
        Close
      </Button>
      
      {activation.provisioning_status === 'failed' && (
        <Button
          onClick={() => onRetry(activation.id)}
          disabled={isRetrying}
          className="flex-1"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isRetrying ? 'Retrying...' : 'Retry Provisioning'}
        </Button>
      )}
      
      {activation.provisioning_status === 'in_progress' && (
        <Button
          onClick={() => onMarkComplete(activation.id)}
          disabled={isMarkingComplete}
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isMarkingComplete ? 'Updating...' : 'Mark as Complete'}
        </Button>
      )}
    </div>
  );
};

export default ProvisioningActions;
