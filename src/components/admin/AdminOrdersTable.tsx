
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
import { Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

const AdminOrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          plan_name,
          data_amount,
          price,
          currency,
          status,
          payment_status,
          created_at,
          esim_delivered_at,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      // Transform the data to match our Order interface
      return (data || []).map(order => ({
        ...order,
        profiles: Array.isArray(order.profiles) ? order.profiles[0] : order.profiles
      })) as Order[];
    },
  });

  // Filter orders based on search term
  useEffect(() => {
    if (!orders) {
      setFilteredOrders([]);
      return;
    }

    const filtered = orders.filter((order) => {
      const email = order.profiles?.email || '';
      const planName = order.plan_name || '';
      const searchLower = searchTerm.toLowerCase();
      
      return (
        email.toLowerCase().includes(searchLower) ||
        planName.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Orders refreshed",
      description: "Order data has been updated.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      succeeded: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Failed to load orders. Please try again later.
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Orders Management</CardTitle>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by email or plan name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
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
                  <TableHead>Customer Email</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Data Amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>eSIM Status</TableHead>
                  <TableHead>Order Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.profiles?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {order.profiles?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>{order.plan_name}</TableCell>
                      <TableCell>{order.data_amount}</TableCell>
                      <TableCell>
                        {order.price} {order.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                      <TableCell>
                        {order.esim_delivered_at ? (
                          <Badge className="bg-green-100 text-green-800">
                            Delivered
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
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
  );
};

export default AdminOrdersTable;
