import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';

const FinalCompatibilityCTASection = () => {
  const { t } = useLanguage();
  const f = t.compatibilityPage.finalCta;

  return (
    <section className="py-20 bg-gradient-to-br from-palop-green to-palop-green/80 text-white">
      <div className="container mx-auto px-4 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold">{f.title}</h2>
        <p className="text-base md:text-lg opacity-90 max-w-md mx-auto">{f.subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button
            asChild
            size="lg"
            className="bg-white text-palop-green hover:bg-gray-50 font-semibold px-8"
            data-testid="compat-final-cta-primary"
          >
            <Link to="/support">{f.primaryCta}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8"
            data-testid="compat-final-cta-secondary"
          >
            <Link to="/plans">{f.secondaryCta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCompatibilityCTASection;
