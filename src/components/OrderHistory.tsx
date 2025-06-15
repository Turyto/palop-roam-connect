
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Smartphone } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";

const OrderHistory = () => {
  const { orders, ordersLoading, ordersError } = useOrders();

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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Order History</h2>
        <p className="text-gray-600">Track your eSIM purchases and downloads</p>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
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
                
                {order.status === 'completed' && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download eSIM
                  </Button>
                )}
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
