import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import AudienceSection from "@/components/home/AudienceSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import PlansSection from "@/components/home/PlansSection";
import CompatibilitySection from "@/components/home/CompatibilitySection";
import UseCasesSection from "@/components/home/UseCasesSection";
import SupportSection from "@/components/home/SupportSection";
import FAQSection from "@/components/home/FAQSection";
import TrustSection from "@/components/home/TrustSection";
import FinalCTASection from "@/components/home/FinalCTASection";
import HomeFooter from "@/components/home/HomeFooter";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userRole === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, userRole, loading, navigate]);

  if (!loading && user && userRole === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-grow">
        <HeroSection />
        <AudienceSection />
        <HowItWorksSection />
        <BenefitsSection />
        <PlansSection />
        <CompatibilitySection />
        <UseCasesSection />
        <SupportSection />
        <FAQSection />
        <TrustSection />
        <FinalCTASection />
      </main>
      <HomeFooter />
    </div>
  );
};

export default Index;
