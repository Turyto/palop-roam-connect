import { useState, useEffect } from 'react';
import { trackEvent } from '@/analytics';
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
import { StoreTab } from '@/content/plansPageContent';
import { useStorefrontPlans } from '@/hooks/useStorefrontPlans';
import AfrolinkFeature from '@/components/AfrolinkFeature';

const Plans = () => {
  const [selectedTab, setSelectedTab] = useState<StoreTab>('europe');
  const { planCards } = useStorefrontPlans();

  // Hot Deals tab only exists while at least one visible plan is flagged.
  const showHotDeals = planCards.some((p) => p.hotDeal);

  useEffect(() => {
    if (selectedTab === 'hot-deals' && planCards.length > 0 && !showHotDeals) {
      setSelectedTab('europe');
    }
  }, [selectedTab, showHotDeals, planCards.length]);

  // GA4: view_plans on page view and whenever the coverage tab (corridor) changes
  useEffect(() => {
    trackEvent('view_plans', { corridor: selectedTab });
  }, [selectedTab]);

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-grow">
        <PlansHeroSection />
        <CoverageSelectorSection
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          showHotDeals={showHotDeals}
        />
        <AfrolinkFeature variant="compact" />
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
