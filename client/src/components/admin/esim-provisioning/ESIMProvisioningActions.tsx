import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi } from "lucide-react";
import { useESIMAccess } from "@/hooks/useESIMAccess";

interface ESIMProvisioningActionsProps {
  onRefresh: () => void;
  onBulkProvision: () => void;
  isLoading: boolean;
  isBulkProvisioning: boolean;
  pendingCount: number;
}

const ESIMProvisioningActions = ({
  onRefresh,
  isLoading,
}: ESIMProvisioningActionsProps) => {
  const { testConnection, isTestingConnection } = useESIMAccess();

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => testConnection()}
        variant="outline"
        size="sm"
        disabled={isTestingConnection}
      >
        <Wifi className="h-4 w-4 mr-2" />
        {isTestingConnection ? 'Testing...' : 'Test Connection'}
      </Button>
      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        disabled={isLoading}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default ESIMProvisioningActions;
