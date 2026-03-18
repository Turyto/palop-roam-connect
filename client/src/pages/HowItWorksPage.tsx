import HomeHeader from '@/components/home/HomeHeader';
import HomeFooter from '@/components/home/HomeFooter';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';

const HowItWorksPage = () => {
  const { t } = useLanguage();
  const h = t.howItWorks;

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-b from-palop-green/5 to-white py-14 md:py-20 border-b border-gray-100">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              {h.title}
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              {h.pageSubtitle}
            </p>
          </div>
        </section>

        {/* 3-step section — title already shown in the hero above */}
        <HowItWorksSection showTitle={false} />

        {/* Benefits */}
        <BenefitsSection />

        {/* Bottom CTA */}
        <section className="py-14 md:py-20 bg-palop-green/5 border-t border-palop-green/10">
          <div className="container mx-auto px-4 text-center max-w-xl">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">
              {h.ctaTitle}
            </h2>
            <p className="text-gray-600 mb-8">{h.ctaBody}</p>
            <Button
              asChild
              className="bg-palop-green hover:bg-palop-green/90 text-white px-8 py-3 text-base"
              data-testid="button-how-it-works-cta"
            >
              <Link to="/plans">{h.ctaButton}</Link>
            </Button>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
};

export default HowItWorksPage;
