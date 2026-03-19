
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Zap } from "lucide-react";
import { useESIMActivations } from "@/hooks/useESIMActivations";
import ProvisioningModal from "./ProvisioningModal";
import ESIMProvisioningSummaryCards from "./esim-provisioning/ESIMProvisioningSummaryCards";
import ESIMProvisioningTable from "./esim-provisioning/ESIMProvisioningTable";
import ESIMProvisioningActions from "./esim-provisioning/ESIMProvisioningActions";
import ESIMProvisioningLoadingState from "./esim-provisioning/ESIMProvisioningLoadingState";
import ESIMProvisioningErrorState from "./esim-provisioning/ESIMProvisioningErrorState";
import type { ESIMActivation } from "@/types/esimActivations";

const AdminESIMProvisioning = () => {
  const {
    activations,
    isLoading,
    error,
    refetch,
    retryProvisioning,
    markAsComplete,
    bulkProvision,
    isRetrying,
    isMarkingComplete,
    isBulkProvisioning
  } = useESIMActivations();

  const [selectedActivation, setSelectedActivation] = useState<ESIMActivation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (activation: ESIMActivation) => {
    setSelectedActivation(activation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivation(null);
  };

  if (isLoading) {
    return <ESIMProvisioningLoadingState />;
  }

  if (error) {
    return <ESIMProvisioningErrorState onRetry={() => refetch()} />;
  }

  const pendingCount = activations.filter(a => a.provisioning_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Safety notice */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Read-only view.</span> Provisioning is fully automated after payment — eSIMs are delivered via the eSIM Access API immediately upon Stripe confirmation. The records below reflect legacy manually-processed orders. No action buttons are available here.
        </p>
      </div>

      <ESIMProvisioningSummaryCards activations={activations} />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              eSIM Provisioning Management
            </CardTitle>
            <ESIMProvisioningActions
              onRefresh={() => refetch()}
              onBulkProvision={() => bulkProvision()}
              isLoading={isLoading}
              isBulkProvisioning={isBulkProvisioning}
              pendingCount={pendingCount}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ESIMProvisioningTable
            activations={activations}
            onViewDetails={handleViewDetails}
            onRetryProvisioning={retryProvisioning}
            onMarkAsComplete={markAsComplete}
            isRetrying={isRetrying}
            isMarkingComplete={isMarkingComplete}
          />
        </CardContent>
      </Card>

      <ProvisioningModal
        activation={selectedActivation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRetry={retryProvisioning}
        onMarkComplete={markAsComplete}
        isRetrying={isRetrying}
        isMarkingComplete={isMarkingComplete}
      />
    </div>
  );
};

export default AdminESIMProvisioning;
