
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderHistory from "@/components/OrderHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-palop-green to-palop-blue">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-white text-xl opacity-90">Track your eSIM purchases and downloads</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <OrderHistory />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
