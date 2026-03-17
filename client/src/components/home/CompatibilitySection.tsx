import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const CompatibilitySection = () => {
  const { t } = useLanguage();

  return (
    <section id="compatibility" className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-palop-green/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-palop-green" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {t.compatibility.title}
          </h2>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            {t.compatibility.body}
          </p>

          <p className="text-sm text-palop-green font-medium">{t.compatibility.microcopy}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              className="bg-palop-green hover:bg-palop-green/90 text-white"
              data-testid="compatibility-primary-cta"
            >
              <Link to="/esim">{t.compatibility.primaryCta}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-palop-green text-palop-green hover:bg-palop-green/5"
              data-testid="compatibility-secondary-cta"
            >
              <Link to="/support">{t.compatibility.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompatibilitySection;
