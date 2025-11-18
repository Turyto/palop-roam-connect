
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupportHero from "@/components/SupportHero";
import SmartFAQ from "@/components/SmartFAQ";
import EnhancedSupportContact from "@/components/EnhancedSupportContact";

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <SupportHero />
        <SmartFAQ />
        <EnhancedSupportContact />
      </main>
      <Footer />
    </div>
  );
};

export default Support;
