
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityHero from "@/components/CommunityHero";
import PartnersSection from "@/components/PartnersSection";
import CommunityImpact from "@/components/CommunityImpact";
import CommunityCallToAction from "@/components/CommunityCallToAction";
import CommunityEvents from "@/components/CommunityEvents";
import CommunityStories from "@/components/CommunityStories";

const Community = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <CommunityHero />
        <CommunityEvents />
        <CommunityStories />
        <CommunityImpact />
        <PartnersSection />
        <CommunityCallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Community;
