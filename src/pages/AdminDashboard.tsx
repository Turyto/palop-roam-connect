import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSupportTickets from "@/components/admin/AdminSupportTickets";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminLanguageToggle from "@/components/admin/AdminLanguageToggle";
import AdminQRCodesTable from "@/components/admin/AdminQRCodesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    console.log('AdminDashboard: Starting sign out process');
    const { error } = await signOut();
    
    if (error) {
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
      
      // Force navigation to homepage and replace history
      navigate('/', { replace: true });
      
      // Force a page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  useEffect(() => {
    console.log('AdminDashboard - user:', user?.id, 'role:', userRole, 'loading:', loading);
    
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to auth');
        navigate('/auth', { replace: true });
        return;
      }

      if (userRole && userRole !== 'admin') {
        console.log('User is not admin, redirecting to home');
        navigate('/', { replace: true });
        return;
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
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

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Analytics Overview */}
          <div className="mb-8">
            <AdminAnalytics />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
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

            <TabsContent value="qrcodes">
              <AdminQRCodesTable />
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
