import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, QrCode, FileX2, Headset } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-palop-green/5 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
            {t.hero.headline}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-palop-green hover:bg-palop-green/90 text-white text-base px-8 py-6"
              data-testid="hero-primary-cta"
            >
              <Link to="/purchase">{t.hero.primaryCta}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-palop-green text-palop-green hover:bg-palop-green/5 text-base px-8 py-6"
              data-testid="hero-secondary-cta"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector('#compatibility');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <a href="#compatibility">{t.hero.secondaryCta}</a>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            {[
              { icon: QrCode, label: t.hero.trust1 },
              { icon: FileX2, label: t.hero.trust2 },
              { icon: Headset, label: t.hero.trust3 },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-600 justify-center">
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

export default HeroSection;
