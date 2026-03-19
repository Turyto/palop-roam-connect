import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, AlertCircle } from 'lucide-react';
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              className="bg-palop-green hover:bg-palop-green/90 text-white"
              data-testid="compatibility-primary-cta"
            >
              <Link to="/compatibility">{t.compatibility.primaryCta}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-palop-green text-palop-green hover:bg-palop-green/5"
              data-testid="compatibility-secondary-cta"
            >
              <Link to="/support?topic=compatibility">{t.compatibility.secondaryCta}</Link>
            </Button>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-left">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-snug">{t.compatibility.warning}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompatibilitySection;
