
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupportHero from "@/components/SupportHero";
import SupportFAQ from "@/components/SupportFAQ";
import SupportContact from "@/components/SupportContact";

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <SupportHero />
        <SupportFAQ />
        <SupportContact />
      </main>
      <Footer />
    </div>
  );
};

export default Support;
