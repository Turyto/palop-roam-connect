
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, Clock, Play, RefreshCw, Zap } from "lucide-react";
import { useESIMActivations } from "@/hooks/useESIMActivations";
import ProvisioningModal from "./ProvisioningModal";
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

  const handleViewDetails = (activation: ESIMActivation) => {
    setSelectedActivation(activation);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>eSIM Provisioning Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading activations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>eSIM Provisioning Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load eSIM activations</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = activations.filter(a => a.provisioning_status === 'pending').length;
  const inProgressCount = activations.filter(a => a.provisioning_status === 'in_progress').length;
  const completedCount = activations.filter(a => a.provisioning_status === 'completed').length;
  const failedCount = activations.filter(a => a.provisioning_status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{failedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              eSIM Provisioning Management
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => bulkProvision()} 
                disabled={isBulkProvisioning || pendingCount === 0}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                {isBulkProvisioning ? 'Starting...' : `Bulk Provision (${pendingCount})`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activations.length === 0 ? (
            <div className="text-center p-8">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No eSIM activations found</p>
            </div>
          ) : (
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
                            onClick={() => handleViewDetails(activation)}
                          >
                            Details
                          </Button>
                          {activation.provisioning_status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => retryProvisioning(activation.id)}
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
                              onClick={() => markAsComplete(activation.id)}
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
          )}
        </CardContent>
      </Card>

      <ProvisioningModal
        activation={selectedActivation}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedActivation(null);
        }}
        onRetry={retryProvisioning}
        onMarkComplete={markAsComplete}
        isRetrying={isRetrying}
        isMarkingComplete={isMarkingComplete}
      />
    </div>
  );
};

export default AdminESIMProvisioning;
