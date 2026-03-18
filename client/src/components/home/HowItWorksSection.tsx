import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Mail, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

interface HowItWorksSectionProps {
  showTitle?: boolean;
}

const HowItWorksSection = ({ showTitle = true }: HowItWorksSectionProps) => {
  const { t } = useLanguage();

  const steps = [
    {
      number: 1,
      icon: ShoppingBag,
      title: t.howItWorks.step1Title,
      body: t.howItWorks.step1Body,
    },
    {
      number: 2,
      icon: Mail,
      title: t.howItWorks.step2Title,
      body: t.howItWorks.step2Body,
    },
    {
      number: 3,
      icon: Smartphone,
      title: t.howItWorks.step3Title,
      body: t.howItWorks.step3Body,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
              {t.howItWorks.title}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-palop-green/10 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-palop-green" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-palop-green text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.body}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            className="border-palop-green text-palop-green hover:bg-palop-green/5"
          >
            <Link to="/plans">{t.howItWorks.cta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
