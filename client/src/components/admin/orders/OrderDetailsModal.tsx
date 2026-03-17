
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Eye, Copy, Calendar, User, Package, Euro, Wifi, Mail, FileText, ExternalLink } from "lucide-react";
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
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        in_progress: "bg-blue-100 text-blue-800 border-blue-200",
        completed: "bg-green-100 text-green-800 border-green-200",
        failed: "bg-red-100 text-red-800 border-red-200",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        confirmed: "bg-green-100 text-green-800 border-green-200",
        succeeded: "bg-green-100 text-green-800 border-green-200",
        failed: "bg-red-100 text-red-800 border-red-200",
      },
      esim: {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        active: "bg-green-100 text-green-800 border-green-200",
        delivered: "bg-green-100 text-green-800 border-green-200",
        failed: "bg-red-100 text-red-800 border-red-200",
      }
    };

    return (
      <Badge className={`${colors[type][status] || "bg-gray-100 text-gray-800 border-gray-200"} border`}>
        {status}
      </Badge>
    );
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('regional')) return '🌍';
    if (planName.toLowerCase().includes('diaspora')) return '✈️';
    if (planName.toLowerCase().includes('neighbors')) return '🏠';
    return '📦';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-palop-blue to-palop-green text-white p-6 -m-6 mb-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getPlanIcon(order.plan_name)}</span>
              <div>
                <DialogTitle className="text-xl font-bold text-white">{order.plan_name}</DialogTitle>
                <p className="text-white/80 text-sm mt-1">Order #{order.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(order.status, 'order')}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Information & Plan Pack Details - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-palop-blue" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date
                    </label>
                    <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Euro className="h-3 w-3" />
                      Total Price
                    </label>
                    <p className="font-medium">{order.price} {order.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Customer Email
                    </label>
                    <p className="font-medium">{order.customer_email || order.profiles?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      Data Amount
                    </label>
                    <p className="font-medium">{order.data_amount}</p>
                  </div>
                </div>
                {order.profiles?.full_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <p className="font-medium">{order.profiles.full_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Pack Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-lg">{getPlanIcon(order.plan_name)}</span>
                  Plan Pack Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Pack Name</label>
                  <p className="font-bold text-lg text-palop-blue">{order.plan_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Coverage Cluster</label>
                    <p className="font-medium flex items-center gap-1">
                      PALOP + Regional 🌍
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Supplier(s)</label>
                    <p className="font-medium">AirHub, eSIM Access</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Key Coverage</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">🇦🇴 Angola</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">🇨🇻 Cape Verde</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">🇲🇿 Mozambique</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">🇵🇹 Portugal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Information Cards */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <label className="text-sm font-medium text-gray-500">Order Status</label>
                <div className="mt-2">{getStatusBadge(order.status, 'order')}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <label className="text-sm font-medium text-gray-500">Payment Status</label>
                <div className="mt-2">{getStatusBadge(order.payment_status, 'payment')}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <label className="text-sm font-medium text-gray-500">eSIM Status</label>
                <div className="mt-2">
                  {order.esim_delivered_at ? 
                    getStatusBadge('delivered', 'esim') : 
                    getStatusBadge('pending', 'esim')
                  }
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {order.qr_code && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-palop-green" />
                  QR Code & Activation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center flex-shrink-0">
                    {order.qr_code.qr_image_url ? (
                      <img 
                        src={order.qr_code.qr_image_url} 
                        alt="QR Code" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500">No QR</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Activation URL</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm font-mono bg-gray-50 p-2 rounded border flex-1 truncate">
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
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-palop-blue" />
                  Provisioning Information
                </CardTitle>
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
                    <p className="font-medium">{order.esim_activation.activated_at ? 
                      new Date(order.esim_activation.activated_at).toLocaleString() : 
                      'Not activated'
                    }</p>
                  </div>
                </div>
                {order.esim_activation.provisioning_log && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Provisioning Log</label>
                    <pre className="mt-1 text-xs bg-gray-50 p-3 rounded border overflow-x-auto max-h-32">
                      {JSON.stringify(order.esim_activation.provisioning_log, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Resend eSIM Email
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Plan Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
