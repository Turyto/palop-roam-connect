
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Clock, RefreshCw, Zap } from "lucide-react";
import type { ESIMActivation } from "@/types/esimActivations";

interface ESIMProvisioningTableProps {
  activations: ESIMActivation[];
  onViewDetails: (activation: ESIMActivation) => void;
  onRetryProvisioning: (activationId: string) => void;
  onMarkAsComplete: (activationId: string) => void;
  isRetrying: boolean;
  isMarkingComplete: boolean;
}

const ESIMProvisioningTable = ({
  activations,
  onViewDetails,
  onRetryProvisioning,
  onMarkAsComplete,
  isRetrying,
  isMarkingComplete
}: ESIMProvisioningTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (activations.length === 0) {
    return (
      <div className="text-center p-8">
        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No eSIM activations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Provisioning</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activations.map((activation) => (
            <TableRow key={activation.id}>
              <TableCell className="font-mono text-sm">
                {activation.order_id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {activation.profiles?.full_name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activation.profiles?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {activation.orders?.plan_name || 'Unknown Plan'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activation.orders?.data_amount}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(activation.status)}>
                  {activation.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 w-fit ${getStatusColor(activation.provisioning_status)}`}
                >
                  {getStatusIcon(activation.provisioning_status)}
                  {activation.provisioning_status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(activation.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(activation)}
                  >
                    Details
                  </Button>
                  {activation.provisioning_status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetryProvisioning(activation.id)}
                      disabled={isRetrying}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  {activation.provisioning_status === 'in_progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsComplete(activation.id)}
                      disabled={isMarkingComplete}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ESIMProvisioningTable;
