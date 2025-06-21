
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCw, ShieldCheck, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ESIMActivation } from "@/hooks/useESIMActivations";

interface ProvisioningModalProps {
  activation: ESIMActivation | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (id: string) => void;
  onMarkComplete: (id: string) => void;
}

const ProvisioningModal = ({ activation, isOpen, onClose, onRetry, onMarkComplete }: ProvisioningModalProps) => {
  const { toast } = useToast();

  if (!activation) return null;

  const handleCopyUrl = () => {
    if (activation.activation_url) {
      navigator.clipboard.writeText(activation.activation_url);
      toast({
        title: "Copied",
        description: "Activation URL copied to clipboard.",
      });
    }
  };

  const handleDownloadInfo = () => {
    const activationInfo = {
      orderId: activation.order_id,
      customer: activation.profiles?.email,
      plan: activation.orders?.plan_name,
      dataAmount: activation.orders?.data_amount,
      activationUrl: activation.activation_url,
      status: activation.status,
      provisioningStatus: activation.provisioning_status,
      createdAt: activation.created_at,
      activatedAt: activation.activated_at,
      deliveredAt: activation.delivered_at,
      logs: activation.provisioning_log
    };

    const blob = new Blob([JSON.stringify(activationInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `esim-activation-${activation.id.slice(0, 8)}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "eSIM activation info has been downloaded.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      delivered: "bg-blue-100 text-blue-800",
      expired: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>eSIM Activation Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Order ID</label>
                <div className="text-sm font-mono">{activation.order_id}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Customer</label>
                <div className="text-sm">
                  <div>{activation.profiles?.email || 'N/A'}</div>
                  <div className="text-gray-500">{activation.profiles?.full_name || 'No name'}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Plan</label>
                <div className="text-sm">
                  <div>{activation.orders?.plan_name || 'N/A'}</div>
                  <div className="text-gray-500">{activation.orders?.data_amount || 'No data info'}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Provisioning Status</label>
                <div>{getStatusBadge(activation.provisioning_status)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Activation Status</label>
                <div>{getStatusBadge(activation.status)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <div className="text-sm">{new Date(activation.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Activation URL */}
          {activation.activation_url && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-600">Activation URL</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all">
                {activation.activation_url}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Delivered At</label>
              <div className="text-sm">
                {activation.delivered_at 
                  ? new Date(activation.delivered_at).toLocaleString() 
                  : 'Not delivered'
                }
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Activated At</label>
              <div className="text-sm">
                {activation.activated_at 
                  ? new Date(activation.activated_at).toLocaleString() 
                  : 'Not activated'
                }
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Expires At</label>
              <div className="text-sm">
                {activation.expires_at 
                  ? new Date(activation.expires_at).toLocaleString() 
                  : 'No expiry'
                }
              </div>
            </div>
          </div>

          {/* Provisioning Logs */}
          {activation.provisioning_log && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Provisioning Logs</label>
              <div className="p-3 bg-gray-50 rounded text-xs font-mono">
                <pre>{JSON.stringify(activation.provisioning_log, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleDownloadInfo} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Info
            </Button>
            
            {activation.provisioning_status === 'failed' && (
              <Button 
                onClick={() => onRetry(activation.id)} 
                variant="outline" 
                className="flex-1"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Retry Provisioning
              </Button>
            )}
            
            {activation.provisioning_status !== 'completed' && (
              <Button 
                onClick={() => onMarkComplete(activation.id)} 
                className="flex-1"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProvisioningModal;
