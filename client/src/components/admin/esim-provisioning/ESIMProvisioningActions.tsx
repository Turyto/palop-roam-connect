
import { Button } from "@/components/ui/button";
import { Play, RefreshCw, Wifi } from "lucide-react";
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
  onBulkProvision,
  isLoading,
  isBulkProvisioning,
  pendingCount
}: ESIMProvisioningActionsProps) => {
  const { testConnection, isTestingConnection } = useESIMAccess();

  const handleTestConnection = () => {
    testConnection();
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleTestConnection} 
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
      <Button 
        onClick={onBulkProvision} 
        disabled={isBulkProvisioning || pendingCount === 0}
        size="sm"
      >
        <Play className="h-4 w-4 mr-2" />
        {isBulkProvisioning ? 'Starting...' : `Bulk Provision (${pendingCount})`}
      </Button>
    </div>
  );
};

export default ESIMProvisioningActions;
