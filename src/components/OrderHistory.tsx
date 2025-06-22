
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Smartphone, QrCode, ChevronDown, ChevronUp, HelpCircle, Mail, Eye, Copy } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useCustomerQRCodes } from "@/hooks/useCustomerQRCodes";
import { format } from "date-fns";
import { useState } from "react";
import QRCodeDownloadModal from "./QRCodeDownloadModal";

const OrderHistory = () => {
  const { orders, ordersLoading, ordersError } = useOrders();
  const { qrCodes } = useCustomerQRCodes();
  const [selectedQRCode, setSelectedQRCode] = useState<{
    activationUrl: string;
    orderId: string;
    planName?: string;
    dataAmount?: string;
    status: 'pending' | 'active' | 'revoked';
  } | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="text-center text-red-600 min-h-[200px] flex items-center justify-center">
        <div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
          <p>Unable to load your order history. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center min-h-[200px] flex items-center justify-center">
        <div>
          <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-4">You haven't made any eSIM purchases yet.</p>
          <Button asChild>
            <a href="/plans">Browse Plans</a>
          </Button>
        </div>
      </div>
    );
  }

  const getConsolidatedStatus = (order: any, qrCode: any) => {
    console.log('Getting status for order:', order.id, 'QR Code:', qrCode);
    
    if (order.status === 'completed' && order.payment_status === 'succeeded' && qrCode) {
      if (qrCode.status === 'active') {
        return { status: 'Active', color: 'bg-green-100 text-green-800', icon: '🟢' };
      }
      return { status: 'Ready to activate', color: 'bg-blue-100 text-blue-800', icon: '🟡' };
    }
    
    if (order.status === 'failed' || order.payment_status === 'failed') {
      return { status: 'Failed', color: 'bg-red-100 text-red-800', icon: '🔴' };
    }
    
    if (order.status === 'cancelled') {
      return { status: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: '⚫' };
    }
    
    return { status: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
  };

  const getOrderQRCode = (orderId: string) => {
    const qrCode = qrCodes.find(qr => qr.order_id === orderId);
    console.log('Looking for QR code for order:', orderId, 'Found:', qrCode);
    return qrCode;
  };

  const canDownloadESIM = (order: any, qrCode: any) => {
    const canDownload = order.status === 'completed' && order.payment_status === 'succeeded' && qrCode;
    console.log('Can download eSIM for order:', order.id, 'Result:', canDownload);
    return canDownload;
  };

  const handleDownloadESIM = (order: any) => {
    console.log('Download eSIM clicked for order:', order.id);
    const qrCode = getOrderQRCode(order.id);
    
    if (qrCode) {
      console.log('QR Code found:', qrCode);
      setSelectedQRCode({
        activationUrl: qrCode.activation_url,
        orderId: order.id,
        planName: order.plan_name,
        dataAmount: order.data_amount,
        status: qrCode.status
      });
    } else {
      console.log('No QR code found for order:', order.id);
      console.log('Available QR codes:', qrCodes);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getValidityInfo = (order: any) => {
    return `Valid for ${order.duration_days} days from activation`;
  };

  const handleResendEmail = (orderId: string) => {
    // TODO: Implement resend email functionality
    console.log('Resend email for order:', orderId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Order History</h2>
        <p className="text-gray-600">Track your eSIM purchases and downloads</p>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => {
          const qrCode = getOrderQRCode(order.id);
          const consolidatedStatus = getConsolidatedStatus(order, qrCode);
          const canDownload = canDownloadESIM(order, qrCode);
          const isExpanded = expandedOrders.has(order.id);
          
          console.log(`Order ${order.id}: status=${order.status}, payment_status=${order.payment_status}, qrCode=${!!qrCode}, canDownload=${canDownload}`);
          
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {order.plan_name}
                      <span className="text-sm font-normal text-gray-500">
                        🇨🇻 Cape Verde (CVMóvel)
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </CardDescription>
                    <div className="mt-2 text-sm text-blue-600">
                      {getValidityInfo(order)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">€{order.price}</div>
                    <div className="text-sm text-gray-500">{order.data_amount} • {order.duration_days} days</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2 items-center">
                    <Badge className={consolidatedStatus.color}>
                      {consolidatedStatus.icon} {consolidatedStatus.status}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    {canDownload && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadESIM(order)}
                          className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View QR Code
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadESIM(order)}
                          className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download eSIM
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Details
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Order ID:</span> 
                      <span className="font-mono ml-1" title={order.id}>
                        {order.id.slice(0, 8)}...
                      </span>
                    </div>
                    {order.completed_at && (
                      <div>
                        <span className="font-medium">Completed:</span> {format(new Date(order.completed_at), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {order.esim_delivered_at && (
                      <div className="col-span-2">
                        <span className="font-medium">eSIM Delivered:</span> {format(new Date(order.esim_delivered_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Plan Details</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>• High-speed data with fair usage policy</div>
                        <div>• Works on compatible devices only</div>
                        <div>• Valid throughout Cape Verde coverage area</div>
                        <div>• Activation required within 30 days of purchase</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="/esim" target="_blank">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          How to Install
                        </a>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <a href="/support">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Need Help?
                        </a>
                      </Button>
                      
                      {canDownload && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResendEmail(order.id)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Email
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* QR Code Download Modal */}
      <QRCodeDownloadModal
        isOpen={!!selectedQRCode}
        onClose={() => setSelectedQRCode(null)}
        activationUrl={selectedQRCode?.activationUrl || ''}
        orderId={selectedQRCode?.orderId || ''}
        planName={selectedQRCode?.planName}
        dataAmount={selectedQRCode?.dataAmount}
        status={selectedQRCode?.status || 'pending'}
      />
    </div>
  );
};

export default OrderHistory;
