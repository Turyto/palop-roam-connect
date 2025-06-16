
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSupportTickets from "@/components/admin/AdminSupportTickets";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminLanguageToggle from "@/components/admin/AdminLanguageToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!loading && !user) {
        navigate('/auth');
        return;
      }

      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user role:', error);
            navigate('/');
            return;
          }

          setUserRole(data?.role || 'customer');
          
          if (data?.role !== 'admin') {
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking admin access:', error);
          navigate('/');
        } finally {
          setRoleLoading(false);
        }
      }
    };

    checkAdminAccess();
  }, [user, loading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        {/* Header */}
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
              <AdminLanguageToggle />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Analytics Overview */}
          <div className="mb-8">
            <AdminAnalytics />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="esim">eSIM Management</TabsTrigger>
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

            <TabsContent value="inventory">
              <AdminInventory />
            </TabsContent>

            <TabsContent value="esim">
              <Card>
                <CardHeader>
                  <CardTitle>eSIM Provisioning Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      eSIM Provisioning System
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Advanced eSIM delivery and activation management coming soon.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold text-blue-900 mb-2">Planned Features:</h4>
                      <ul className="text-blue-800 space-y-1 text-sm">
                        <li>• Automated QR code generation and delivery</li>
                        <li>• Real-time activation tracking</li>
                        <li>• Carrier integration management</li>
                        <li>• Bulk eSIM provisioning</li>
                        <li>• Failed activation recovery</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
