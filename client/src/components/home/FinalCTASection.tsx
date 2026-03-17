import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';

const FinalCTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-r from-palop-green to-palop-green/80 text-white">
      <div className="container mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold">{t.finalCta.headline}</h2>
        <p className="text-lg opacity-90 max-w-xl mx-auto">{t.finalCta.body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button
            asChild
            size="lg"
            className="bg-white text-palop-green hover:bg-gray-50 font-semibold"
            data-testid="final-cta-primary"
          >
            <Link to="/purchase">{t.finalCta.primaryCta}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
            data-testid="final-cta-secondary"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector('#plans');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <a href="#plans">{t.finalCta.secondaryCta}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
