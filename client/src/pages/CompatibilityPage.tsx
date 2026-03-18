import HomeHeader from '@/components/home/HomeHeader';
import HomeFooter from '@/components/home/HomeFooter';
import CompatibilityHeroSection from '@/components/compatibility/CompatibilityHeroSection';
import QuickCheckSection from '@/components/compatibility/QuickCheckSection';
import ImportantNotesSection from '@/components/compatibility/ImportantNotesSection';
import CompatibleDevicesSection from '@/components/compatibility/CompatibleDevicesSection';
import CompatibilityFAQSection from '@/components/compatibility/CompatibilityFAQSection';
import FinalCompatibilityCTASection from '@/components/compatibility/FinalCompatibilityCTASection';

const CompatibilityPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-grow">
        <CompatibilityHeroSection />
        <QuickCheckSection />
        <ImportantNotesSection />
        <CompatibleDevicesSection />
        <CompatibilityFAQSection />
        <FinalCompatibilityCTASection />
      </main>
      <HomeFooter />
    </div>
  );
};

export default CompatibilityPage;
