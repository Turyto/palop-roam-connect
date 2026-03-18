import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Tag, Headset } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const CompatibilityHeroSection = () => {
  const { t } = useLanguage();
  const h = t.compatibilityPage.hero;

  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-palop-green/5 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-sm font-semibold text-palop-green uppercase tracking-wider" data-testid="compat-hero-eyebrow">
            {h.eyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 leading-tight">
            {h.title}
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
            {h.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Button
              size="lg"
              className="bg-palop-green hover:bg-palop-green/90 text-white px-8"
              data-testid="compat-hero-primary-cta"
              onClick={() => {
                const el = document.querySelector('#device-list');
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
              data-testid="compat-hero-secondary-cta"
            >
              <Link to="/support">{h.secondaryCta}</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            {[
              { icon: Search, label: h.trust1 },
              { icon: Tag, label: h.trust2 },
              { icon: Headset, label: h.trust3 },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-sm text-gray-600">
                <Icon className="h-4 w-4 text-palop-green flex-shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompatibilityHeroSection;
