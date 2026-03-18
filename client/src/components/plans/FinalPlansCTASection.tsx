import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';

const scrollTo = (selector: string) => {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const FinalPlansCTASection = () => {
  const { t } = useLanguage();
  const f = t.plansPage.finalCta;

  return (
    <section className="py-20 bg-gradient-to-br from-palop-green to-palop-green/80 text-white">
      <div className="container mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold">{f.title}</h2>
        <p className="text-lg opacity-90 max-w-xl mx-auto">{f.description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button
            size="lg"
            className="bg-white text-palop-green hover:bg-gray-50 font-semibold px-8"
            data-testid="plans-final-cta-primary"
            onClick={() => scrollTo('#featured-plans')}
          >
            {f.primaryCta}
          </Button>
          <button
            onClick={() => scrollTo('#compare-plans')}
            className="inline-flex items-center justify-center rounded-md border-2 border-white text-white bg-transparent hover:bg-white/10 transition-colors px-8 py-3 text-base font-semibold"
            data-testid="plans-final-cta-secondary"
          >
            {f.secondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalPlansCTASection;
