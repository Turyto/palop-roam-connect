
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Smartphone, QrCode } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderQRCode = (orderId: string) => {
    return qrCodes.find(qr => qr.order_id === orderId);
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Order History</h2>
        <p className="text-gray-600">Track your eSIM purchases and downloads</p>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => {
          const qrCode = getOrderQRCode(order.id);
          const hasQRCode = qrCode && (order.status === 'completed' || order.esim_delivered_at);
          
          console.log(`Order ${order.id}: status=${order.status}, esim_delivered_at=${order.esim_delivered_at}, qrCode=${!!qrCode}, hasQRCode=${hasQRCode}`);
          
          return (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.plan_name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">€{order.price}</div>
                    <div className="text-sm text-gray-500">{order.data_amount} • {order.duration_days} days</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status || 'pending')}>
                      Payment: {order.payment_status || 'pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    {hasQRCode && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadESIM(order)}
                        className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download eSIM
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Order ID:</span> {order.id.slice(0, 8)}...
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
