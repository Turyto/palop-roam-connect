
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ESimHero from "@/components/ESimHero";
import ESimTechnology from "@/components/ESimTechnology";
import ESimFlow from "@/components/ESimFlow";
import ESimBenefits from "@/components/ESimBenefits";
import ESimCompatibility from "@/components/ESimCompatibility";
import ESimFAQ from "@/components/ESimFAQ";
import TrustIndicators from "@/components/TrustIndicators";
import CtaSection from "@/components/CtaSection";

const ESim = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ESimHero />
        <ESimTechnology />
        <ESimFlow />
        <ESimBenefits />
        <ESimCompatibility />
        <ESimFAQ />
        <TrustIndicators />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default ESim;
