
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlansHero from "@/components/PlansHero";
import PlanCards from "@/components/PlanCards";
import PlanComparison from "@/components/PlanComparison";
import PlanRecommendation from "@/components/PlanRecommendation";
import RealJourneysSection from "@/components/RealJourneysSection";
import TrustIndicators from "@/components/TrustIndicators";
import CtaSection from "@/components/CtaSection";

const Plans = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <PlansHero />
        <div id="plans">
          <PlanCards />
        </div>
        <PlanRecommendation />
        <PlanComparison />
        <RealJourneysSection />
        <TrustIndicators />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
