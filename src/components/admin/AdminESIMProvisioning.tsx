
import { useState } from "react";
import { useESIMActivations } from "@/hooks/useESIMActivations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RotateCw, ShieldCheck, Eye, Settings, Loader2 } from "lucide-react";
import ProvisioningModal from "./ProvisioningModal";
import type { ESIMActivation } from "@/hooks/useESIMActivations";

const AdminESIMProvisioning = () => {
  const { 
    activations, 
    isLoading, 
    retryProvisioning, 
    markAsComplete, 
    bulkProvision,
    isRetrying,
    isMarkingComplete,
    isBulkProvisioning
  } = useESIMActivations();
  
  const [selectedActivation, setSelectedActivation] = useState<ESIMActivation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter activations based on status and search term
  const filteredActivations = activations.filter(activation => {
    const matchesStatus = statusFilter === 'all' || activation.provisioning_status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      activation.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activation.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activation.orders?.plan_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Calculate overview stats
  const stats = {
    total: activations.length,
    pending: activations.filter(a => a.provisioning_status === 'pending').length,
    inProgress: activations.filter(a => a.provisioning_status === 'in_progress').length,
    completed: activations.filter(a => a.provisioning_status === 'completed').length,
    failed: activations.filter(a => a.provisioning_status === 'failed').length,
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading eSIM activations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">eSIM Provisioning Management</h2>
          <p className="text-gray-600 mt-1">Manage eSIM delivery and activation operations</p>
        </div>
        <Button 
          onClick={() => bulkProvision()} 
          disabled={isBulkProvisioning || stats.pending === 0}
          className="flex items-center gap-2"
        >
          {isBulkProvisioning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          Bulk Provision ({stats.pending})
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Activations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by email, order ID, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activations Table */}
      <Card>
        <CardHeader>
          <CardTitle>eSIM Activations ({filteredActivations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Provisioning Status</TableHead>
                <TableHead>Activation Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivations.map((activation) => (
                <TableRow key={activation.id}>
                  <TableCell className="font-mono text-sm">
                    {activation.order_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activation.profiles?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {activation.profiles?.full_name || 'No name'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activation.orders?.plan_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {activation.orders?.data_amount || 'No data info'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(activation.provisioning_status)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(activation.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(activation.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedActivation(activation)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {activation.provisioning_status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryProvisioning(activation.id)}
                          disabled={isRetrying}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
                      {activation.provisioning_status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsComplete(activation.id)}
                          disabled={isMarkingComplete}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredActivations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No eSIM activations found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provisioning Detail Modal */}
      <ProvisioningModal
        activation={selectedActivation}
        isOpen={!!selectedActivation}
        onClose={() => setSelectedActivation(null)}
        onRetry={retryProvisioning}
        onMarkComplete={markAsComplete}
      />
    </div>
  );
};

export default AdminESIMProvisioning;
