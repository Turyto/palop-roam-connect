import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Eye, CheckCircle, RotateCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import OrderDetailsModal from "./orders/OrderDetailsModal";

interface Order {
  id: string;
  user_id: string;
  plan_name: string;
  data_amount: string;
  price: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  esim_delivered_at: string | null;
  customer_email: string | null;
}

const AdminOrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { toast } = useToast();
  const {
    retryProvisioning,
    markComplete,
    isRetrying,
    isMarkingComplete
  } = useOrderManagement();

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      return (ordersData || []) as Order[];
    },
  });

  useEffect(() => {
    if (!orders) {
      setFilteredOrders([]);
      return;
    }

    const filtered = orders.filter((order) => {
      const email = order.customer_email || '';
      const planName = order.plan_name || '';
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = (
        email.toLowerCase().includes(searchLower) ||
        planName.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleRetryProvisioning = (orderId: string) => {
    retryProvisioning(orderId);
  };

  const handleMarkComplete = (orderId: string) => {
    markComplete(orderId);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Orders refreshed",
      description: "Order data has been updated.",
    });
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Order ID', 'Customer Email', 'Plan', 'Price', 'Order Status', 'Payment Status', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customer_email || '',
        order.plan_name,
        `${order.price} ${order.currency}`,
        order.status,
        order.payment_status,
        new Date(order.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Orders have been exported to CSV.",
    });
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const colors = {
      order: {
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
      },
      payment: {
        pending: "bg-yellow-100 text-yellow-800",
        succeeded: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
      }
    };

    return (
      <Badge className={colors[type][status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getESIMStatusBadge = (order: Order) => {
    if (order.esim_delivered_at && order.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
    } else if (order.esim_delivered_at) {
      return <Badge className="bg-blue-100 text-blue-800">Provisioned</Badge>;
    } else if (order.status === 'failed') {
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Not Started</Badge>;
  };

  const canRetryProvisioning = (order: Order) => {
    return order.status === 'failed' || (order.esim_delivered_at && order.status !== 'completed');
  };

  const canMarkComplete = (order: Order) => {
    return !!order.esim_delivered_at && order.status !== 'completed';
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {error.message || "Failed to load orders. Please try again later."}
          </p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Orders Management ({orders.length} total)</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, plan name, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading orders...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer Email</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Data Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>eSIM Status</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" || paymentFilter !== "all" ?
                          'No orders found matching your filters.' :
                          'No orders found.'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.customer_email ?? <span className="text-gray-400 text-xs italic">no email</span>}
                        </TableCell>
                        <TableCell>{order.plan_name}</TableCell>
                        <TableCell>{order.data_amount}</TableCell>
                        <TableCell>
                          {order.price} {order.currency}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status, 'order')}</TableCell>
                        <TableCell>{getStatusBadge(order.payment_status, 'payment')}</TableCell>
                        <TableCell>{getESIMStatusBadge(order)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                              title="View Details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            {canRetryProvisioning(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRetryProvisioning(order.id)}
                                disabled={isRetrying}
                                title="Reset provisioning status to pending"
                              >
                                <RotateCw className="h-3 w-3" />
                              </Button>
                            )}

                            {canMarkComplete(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkComplete(order.id)}
                                disabled={isMarkingComplete}
                                title="Mark Complete"
                                className="bg-green-50 hover:bg-green-100"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
};

export default AdminOrdersTable;
