
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import EnhancedHeroSection from "@/components/EnhancedHeroSection";
import PlanCards from "@/components/PlanCards";
import CountriesSection from "@/components/CountriesSection";
import DynamicTestimonials from "@/components/DynamicTestimonials";
import TrustIndicators from "@/components/TrustIndicators";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (!loading && user && userRole === 'admin') {
      console.log('Admin user detected on homepage, redirecting to dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, userRole, loading, navigate]);

  // Don't render content if admin user is being redirected
  if (!loading && user && userRole === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <EnhancedHeroSection />
        <PlanCards />
        <CountriesSection />
        <DynamicTestimonials />
        <TrustIndicators />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
