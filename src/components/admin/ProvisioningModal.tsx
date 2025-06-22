
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, RefreshCw, ExternalLink } from "lucide-react";
import type { ESIMActivation } from "@/types/esimActivations";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            eSIM Provisioning Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Activation Info */}
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

          {/* Customer Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <div className="text-sm text-gray-900">
                  {activation.profiles?.full_name || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="text-sm text-gray-900">{activation.profiles?.email}</div>
              </div>
            </div>
          </div>

          {/* Plan Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Plan Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Plan Name</label>
                <div className="text-sm text-gray-900">
                  {activation.orders?.plan_name || 'Unknown Plan'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data Amount</label>
                <div className="text-sm text-gray-900">
                  {activation.orders?.data_amount || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Status Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Activation Status</label>
                <Badge variant="outline" className={`w-fit ${getStatusColor(activation.status)}`}>
                  {activation.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Provisioning Status</label>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 w-fit ${getStatusColor(activation.provisioning_status)}`}
                >
                  {getStatusIcon(activation.provisioning_status)}
                  {activation.provisioning_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <div className="text-gray-900">
                  {new Date(activation.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <div className="text-gray-900">
                  {new Date(activation.updated_at).toLocaleString()}
                </div>
              </div>
              {activation.activated_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Activated</label>
                  <div className="text-gray-900">
                    {new Date(activation.activated_at).toLocaleString()}
                  </div>
                </div>
              )}
              {activation.delivered_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivered</label>
                  <div className="text-gray-900">
                    {new Date(activation.delivered_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activation URL */}
          {activation.activation_url && (
            <div>
              <label className="text-sm font-medium text-gray-600">Activation URL</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                  {activation.activation_url}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(activation.activation_url!, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Provisioning Log */}
          {activation.provisioning_log && (
            <div>
              <label className="text-sm font-medium text-gray-600">Provisioning Log</label>
              <pre className="text-xs bg-gray-50 p-3 rounded-md mt-1 overflow-auto max-h-32">
                {JSON.stringify(activation.provisioning_log, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProvisioningModal;
