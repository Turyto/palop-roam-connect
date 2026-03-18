import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const HelpChoosingSection = () => {
  const { t } = useLanguage();
  const h = t.plansPage.help;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-palop-green/10 rounded-full flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-palop-green" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
            {h.title}
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">{h.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Button
              size="lg"
              className="bg-palop-green hover:bg-palop-green/90 text-white px-8"
              data-testid="help-primary-cta"
              onClick={() => {
                const el = document.querySelector('#featured-plans');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {h.primaryCta}
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-palop-green text-palop-green hover:bg-palop-green/5 px-8"
              data-testid="help-secondary-cta"
            >
              <Link to="/support">{h.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpChoosingSection;
