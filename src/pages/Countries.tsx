
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountriesHero from "@/components/CountriesHero";
import CountriesGrid from "@/components/CountriesGrid";
import CountryComparison from "@/components/CountryComparison";
import CoverageMap from "@/components/CoverageMap";
import CulturalConnectivity from "@/components/CulturalConnectivity";
import NetworkInsights from "@/components/NetworkInsights";
import TrustIndicators from "@/components/TrustIndicators";
import CtaSection from "@/components/CtaSection";

const Countries = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <CountriesHero />
        <CountriesGrid />
        <CountryComparison />
        <CoverageMap />
        <CulturalConnectivity />
        <NetworkInsights />
        <TrustIndicators />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Countries;
