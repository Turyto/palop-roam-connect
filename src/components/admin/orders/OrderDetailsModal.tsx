
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Eye, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
  const { toast } = useToast();

  if (!order) return null;

  const handleCopyActivationUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Activation URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy activation URL",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' | 'esim') => {
    const colors = {
      order: {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-green-100 text-green-800",
        succeeded: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
      },
      esim: {
        pending: "bg-yellow-100 text-yellow-800",
        active: "bg-green-100 text-green-800",
        delivered: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
      }
    };

    return (
      <Badge className={colors[type][status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order ID</label>
                  <p className="font-mono text-sm">{order.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Email</label>
                  <p>{order.profiles?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p>{order.profiles?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Plan</label>
                  <p>{order.plan_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Amount</label>
                  <p>{order.data_amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Price</label>
                  <p>{order.price} {order.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Status</label>
                  <div className="mt-1">{getStatusBadge(order.status, 'order')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <div className="mt-1">{getStatusBadge(order.payment_status, 'payment')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">eSIM Status</label>
                  <div className="mt-1">
                    {order.esim_delivered_at ? 
                      getStatusBadge('delivered', 'esim') : 
                      getStatusBadge('pending', 'esim')
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          {order.qr_code && (
            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-32 bg-gray-100 rounded border flex items-center justify-center">
                    {order.qr_code.qr_image_url ? (
                      <img 
                        src={order.qr_code.qr_image_url} 
                        alt="QR Code" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-500">No QR</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Activation URL</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-mono truncate max-w-md">
                            {order.qr_code.activation_url}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyActivationUrl(order.qr_code.activation_url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View QR
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Provisioning Information */}
          {order.esim_activation && (
            <Card>
              <CardHeader>
                <CardTitle>Provisioning Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Provisioning Status</label>
                    <div className="mt-1">
                      {getStatusBadge(order.esim_activation.provisioning_status, 'esim')}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Activated At</label>
                    <p>{order.esim_activation.activated_at ? 
                      new Date(order.esim_activation.activated_at).toLocaleString() : 
                      'Not activated'
                    }</p>
                  </div>
                </div>
                {order.esim_activation.provisioning_log && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Provisioning Log</label>
                    <pre className="mt-1 text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                      {JSON.stringify(order.esim_activation.provisioning_log, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory Source */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p>Cape Verde</p> {/* Default for demo - would map from plan */}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Carrier</label>
                  <p>CVMóvel</p> {/* Default for demo - would map from plan */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
