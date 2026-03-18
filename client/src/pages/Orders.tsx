import HomeHeader from "@/components/home/HomeHeader";
import HomeFooter from "@/components/home/HomeFooter";
import OrderHistory from "@/components/OrderHistory";
import OrdersHeroSection from "@/components/orders/OrdersHeroSection";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/language";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">{t.orders.loading}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HomeHeader />

      <OrdersHeroSection />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <OrderHistory />
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default Orders;
