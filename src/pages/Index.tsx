
import Navbar from "@/components/Navbar";
import EnhancedHeroSection from "@/components/EnhancedHeroSection";
import PlanCards from "@/components/PlanCards";
import CountriesSection from "@/components/CountriesSection";
import DynamicTestimonials from "@/components/DynamicTestimonials";
import TrustIndicators from "@/components/TrustIndicators";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

const Index = () => {
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
