
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ESIMActivation } from "@/types/esimActivations";
import ProvisioningModalHeader from "./provisioning-modal/ProvisioningModalHeader";
import ActivationInfo from "./provisioning-modal/ActivationInfo";
import CustomerInfo from "./provisioning-modal/CustomerInfo";
import PlanInfo from "./provisioning-modal/PlanInfo";
import StatusInfo from "./provisioning-modal/StatusInfo";
import TimelineInfo from "./provisioning-modal/TimelineInfo";
import ActivationUrl from "./provisioning-modal/ActivationUrl";
import ProvisioningLog from "./provisioning-modal/ProvisioningLog";
import ProvisioningActions from "./provisioning-modal/ProvisioningActions";

interface ProvisioningModalProps {
  activation: ESIMActivation | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (activationId: string) => void;
  onMarkComplete: (activationId: string) => void;
  isRetrying: boolean;
  isMarkingComplete: boolean;
}

const ProvisioningModal = ({ 
  activation, 
  isOpen, 
  onClose, 
  onRetry, 
  onMarkComplete,
  isRetrying,
  isMarkingComplete 
}: ProvisioningModalProps) => {
  if (!activation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <ProvisioningModalHeader />
        
        <div className="space-y-6">
          <ActivationInfo activation={activation} />
          <CustomerInfo activation={activation} />
          <PlanInfo activation={activation} />

          <Separator />

          <StatusInfo activation={activation} />
          <TimelineInfo activation={activation} />
          <ActivationUrl activation={activation} />
          <ProvisioningLog activation={activation} />

          <ProvisioningActions
            activation={activation}
            onClose={onClose}
            onRetry={onRetry}
            onMarkComplete={onMarkComplete}
            isRetrying={isRetrying}
            isMarkingComplete={isMarkingComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProvisioningModal;
