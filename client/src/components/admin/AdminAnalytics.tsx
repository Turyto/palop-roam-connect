
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Package, Euro, Smartphone, BarChart3 } from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  completedOrders: number;
  totalOrders: number;
  pendingEsims: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    completedOrders: 0,
    totalOrders: 0,
    pendingEsims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, price, status, created_at, esim_delivered_at, esim_status, esim_order_id');

        if (ordersError) throw ordersError;

        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const completedOrders = ordersData?.filter(o => o.status === 'completed') ?? [];
        const totalOrders = ordersData?.length ?? 0;

        const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.price), 0);

        const thisMonthRevenue = completedOrders
          .filter(o => new Date(o.created_at) >= startOfThisMonth)
          .reduce((sum, o) => sum + Number(o.price), 0);

        const lastMonthRevenue = completedOrders
          .filter(o => {
            const d = new Date(o.created_at);
            return d >= startOfLastMonth && d <= endOfLastMonth;
          })
          .reduce((sum, o) => sum + Number(o.price), 0);

        const pendingEsims = completedOrders.filter(o =>
          o.esim_status !== 'delivered' && !o.esim_delivered_at
        ).length;

        setAnalytics({
          totalRevenue,
          thisMonthRevenue,
          lastMonthRevenue,
          completedOrders: completedOrders.length,
          totalOrders,
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

  const conversionRate = analytics.totalOrders > 0
    ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)
    : '0.0';

  const monthTrend = analytics.lastMonthRevenue > 0
    ? (((analytics.thisMonthRevenue - analytics.lastMonthRevenue) / analytics.lastMonthRevenue) * 100).toFixed(1)
    : null;

  const cards = [
    {
      title: "Total Revenue",
      value: `€${analytics.totalRevenue.toFixed(2)}`,
      sub: "All-time completed orders",
      icon: Euro,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "This Month",
      value: `€${analytics.thisMonthRevenue.toFixed(2)}`,
      sub: monthTrend !== null
        ? `${Number(monthTrend) >= 0 ? '+' : ''}${monthTrend}% vs last month`
        : `€${analytics.lastMonthRevenue.toFixed(2)} last month`,
      icon: Number(monthTrend ?? 0) >= 0 ? TrendingUp : TrendingDown,
      color: Number(monthTrend ?? 0) >= 0 ? "text-green-600" : "text-red-500",
      bg: Number(monthTrend ?? 0) >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Completed Orders",
      value: analytics.completedOrders,
      sub: `of ${analytics.totalOrders} total`,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      sub: "Paid ÷ total orders",
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Pending eSIMs",
      value: analytics.pendingEsims,
      sub: "Completed, not yet delivered",
      icon: Smartphone,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Total Users",
      value: null,
      sub: "Loading...",
      icon: Users,
      color: "text-gray-600",
      bg: "bg-gray-50",
      fetchSeparately: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                <div className="h-7 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Total Revenue */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Total Revenue</p>
            <div className="p-1.5 rounded-full bg-emerald-50">
              <Euro className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">€{analytics.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">All-time completed orders</p>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">This Month</p>
            <div className={`p-1.5 rounded-full ${Number(monthTrend ?? 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              {Number(monthTrend ?? 0) >= 0
                ? <TrendingUp className="h-4 w-4 text-green-600" />
                : <TrendingDown className="h-4 w-4 text-red-500" />
              }
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">€{analytics.thisMonthRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {monthTrend !== null
              ? <span className={Number(monthTrend) >= 0 ? 'text-green-600' : 'text-red-500'}>
                  {Number(monthTrend) >= 0 ? '+' : ''}{monthTrend}% vs last month
                </span>
              : `€${analytics.lastMonthRevenue.toFixed(2)} last month`
            }
          </p>
        </CardContent>
      </Card>

      {/* Completed Orders */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Completed Orders</p>
            <div className="p-1.5 rounded-full bg-blue-50">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.completedOrders}</p>
          <p className="text-xs text-gray-400 mt-1">of {analytics.totalOrders} total</p>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Conversion Rate</p>
            <div className="p-1.5 rounded-full bg-purple-50">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Paid ÷ total orders</p>
        </CardContent>
      </Card>

      {/* Pending eSIMs */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Pending eSIMs</p>
            <div className="p-1.5 rounded-full bg-orange-50">
              <Smartphone className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.pendingEsims}</p>
          <p className="text-xs text-gray-400 mt-1">Completed, not delivered</p>
        </CardContent>
      </Card>

      {/* Total Users — separate fetch */}
      <TotalUsersCard />
    </div>
  );
};

const TotalUsersCard = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count: c }) => setCount(c ?? 0));
  }, []);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">Total Users</p>
          <div className="p-1.5 rounded-full bg-gray-100">
            <Users className="h-4 w-4 text-gray-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {count === null ? '—' : count}
        </p>
        <p className="text-xs text-gray-400 mt-1">Registered accounts</p>
      </CardContent>
    </Card>
  );
};

export default AdminAnalytics;
