
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Package, DollarSign, Smartphone } from "lucide-react";

interface AnalyticsData {
  totalOrders: number;
  totalUsers: number;
  monthlyRevenue: number;
  completedOrders: number;
  pendingEsims: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    completedOrders: 0,
    pendingEsims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch total orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, price, status, created_at, esim_delivered_at');

        if (ordersError) throw ordersError;

        // Fetch total users
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id');

        if (usersError) throw usersError;

        // Calculate analytics
        const totalOrders = ordersData?.length || 0;
        const totalUsers = usersData?.length || 0;
        
        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = ordersData
          ?.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.getMonth() === currentMonth && 
                   orderDate.getFullYear() === currentYear &&
                   order.status === 'completed';
          })
          .reduce((sum, order) => sum + Number(order.price), 0) || 0;

        const completedOrders = ordersData?.filter(order => order.status === 'completed').length || 0;
        const pendingEsims = ordersData?.filter(order => 
          order.status === 'completed' && !order.esim_delivered_at
        ).length || 0;

        setAnalytics({
          totalOrders,
          totalUsers,
          monthlyRevenue,
          completedOrders,
          pendingEsims,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const analyticsCards = [
    {
      title: "Total Orders",
      value: analytics.totalOrders,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Monthly Revenue",
      value: `€${analytics.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Completed Orders",
      value: analytics.completedOrders,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Pending eSIMs",
      value: analytics.pendingEsims,
      icon: Smartphone,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {analyticsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminAnalytics;
