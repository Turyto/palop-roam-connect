import { useState } from 'react';
import HomeHeader from '@/components/home/HomeHeader';
import HomeFooter from '@/components/home/HomeFooter';
import PlansHeroSection from '@/components/plans/PlansHeroSection';
import CoverageSelectorSection from '@/components/plans/CoverageSelectorSection';
import FeaturedPlansSection from '@/components/plans/FeaturedPlansSection';
import ReassuranceStripSection from '@/components/plans/ReassuranceStripSection';
import SimpleComparisonSection from '@/components/plans/SimpleComparisonSection';
import HelpChoosingSection from '@/components/plans/HelpChoosingSection';
import UtilityLinksSection from '@/components/plans/UtilityLinksSection';
import FinalPlansCTASection from '@/components/plans/FinalPlansCTASection';
import { CoverageTab } from '@/content/plansPageContent';

const Plans = () => {
  const [selectedTab, setSelectedTab] = useState<CoverageTab>('europe');

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-grow">
        <PlansHeroSection />
        <CoverageSelectorSection selectedTab={selectedTab} onTabChange={setSelectedTab} />
        <FeaturedPlansSection selectedTab={selectedTab} />
        <ReassuranceStripSection />
        <SimpleComparisonSection />
        <HelpChoosingSection />
        <UtilityLinksSection />
        <FinalPlansCTASection />
      </main>
      <HomeFooter />
    </div>
  );
};

export default Plans;
