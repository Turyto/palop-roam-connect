import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import Footer from "@/components/Footer";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSupportTickets from "@/components/admin/AdminSupportTickets";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminLanguageToggle from "@/components/admin/AdminLanguageToggle";
import AdminAlertBar from "@/components/admin/AdminAlertBar";
import AdminReferrals from "@/components/admin/AdminReferrals";
import AdminCommissions from "@/components/admin/AdminCommissions";
import AdminConsignment from "@/components/admin/AdminConsignment";
import PartnerMonthlySummary from "@/components/admin/PartnerMonthlySummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, LogOut, Package, BookOpen, Share2, Euro, Boxes, Users, LifeBuoy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDeliveryProblems } from "@/hooks/useDeliveryProblems";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, userRole, roleError, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("orders");

  const handleSignOut = async () => {
    console.log('AdminDashboard: Starting sign out process');
    const { error } = await signOut();

    const isSessionMissing =
      !error ||
      error.message === 'Auth session missing!' ||
      (error as any)?.name === 'AuthSessionMissingError';

    if (error && !isSessionMissing) {
      console.error('Admin sign out error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('AdminDashboard: Sign out successful, redirecting to home');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }

    // Always navigate away — with scope:'local' the local session is always
    // cleared, even if the server-side session had already expired.
    navigate('/', { replace: true });
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // Unauthenticated visitors go to sign-in. This is the ONLY automatic
  // redirect — signed-in non-admins see an explicit Access Denied card
  // below instead of being silently bounced.
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Auth session still resolving, or the role lookup for a signed-in user
  // hasn't finished yet (userRole is null until fetched) — show a spinner
  // instead of flashing Access Denied.
  if (loading || (user && userRole === null && !roleError)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {roleError
                ? "We couldn't verify your account permissions. Please try again."
                : "You don't have permission to access the admin dashboard."}
            </p>
            <Button variant="outline" onClick={() => navigate('/', { replace: true })}>
              Go to homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-palop-green" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage PALOP eSIM platform operations</p>
              </div>
              <div className="flex items-center gap-4">
                <AdminLanguageToggle />
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <AdminAnalytics />
          </div>

          <AdminAlertBar onViewOrders={() => setActiveTab("orders")} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Ordered by routine frequency: daily (Orders, Catalog),
                partner group (Referrals, Commissions, Consignment),
                occasional (Users, Support). */}
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="orders" className="flex items-center gap-1.5" data-testid="tab-orders">
                <Package className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Orders</span>
                <OrdersAttentionBadge />
              </TabsTrigger>
              <TabsTrigger value="catalog" className="flex items-center gap-1.5" data-testid="tab-catalog">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Catalog</span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-1.5" data-testid="tab-referrals">
                <Share2 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Referrals</span>
              </TabsTrigger>
              <TabsTrigger value="commissions" className="flex items-center gap-1.5" data-testid="tab-commissions">
                <Euro className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Commissions</span>
              </TabsTrigger>
              <TabsTrigger value="consignment" className="flex items-center gap-1.5" data-testid="tab-consignment">
                <Boxes className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Consignment</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1.5" data-testid="tab-users">
                <Users className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1.5" data-testid="tab-support">
                <LifeBuoy className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <AdminOrdersTable />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTable />
            </TabsContent>

            <TabsContent value="support">
              <AdminSupportTickets />
            </TabsContent>

            <TabsContent value="catalog">
              <AdminInventory />
            </TabsContent>

            <TabsContent value="referrals">
              <AdminReferrals />
            </TabsContent>

            <TabsContent value="commissions">
              <div className="space-y-6">
                <PartnerMonthlySummary />
                <AdminCommissions />
              </div>
            </TabsContent>

            <TabsContent value="consignment">
              <AdminConsignment />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Red count badge on the Orders tab fed by the shared problem metric.
const OrdersAttentionBadge = () => {
  const { data } = useDeliveryProblems();
  const count = data?.totalProblems ?? 0;
  if (count === 0) return null;
  return (
    <Badge
      variant="destructive"
      className="h-5 min-w-5 px-1.5 text-[11px] leading-none"
      data-testid="badge-orders-attention"
    >
      {count}
    </Badge>
  );
};

export default AdminDashboard;
