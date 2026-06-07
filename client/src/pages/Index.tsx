import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import HomeHeader from "@/components/home/HomeHeader";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import HeroSection from "@/components/home/HeroSection";
import AudienceSection from "@/components/home/AudienceSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import WorldCupSection from "@/components/home/WorldCupSection";
import PlansSection from "@/components/home/PlansSection";
import PartnersSection from "@/components/home/PartnersSection";
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
    if (!loading && user) {
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (window.location.hash.includes('access_token')) {
        // Arrived here via a magic link — send customers straight to their orders
        navigate('/orders', { replace: true });
      }
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
      <AnnouncementBar />
      <HomeHeader />
      <main className="flex-grow">
        <HeroSection />
        <AudienceSection />
        <HowItWorksSection />
        <BenefitsSection />
        <WorldCupSection />
        <PlansSection />
        <PartnersSection />
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
