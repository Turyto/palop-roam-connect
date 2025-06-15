
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CountriesHero from "@/components/CountriesHero";
import CountriesGrid from "@/components/CountriesGrid";
import CoverageMap from "@/components/CoverageMap";

const Countries = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <CountriesHero />
        <CountriesGrid />
        <CoverageMap />
      </main>
      <Footer />
    </div>
  );
};

export default Countries;
