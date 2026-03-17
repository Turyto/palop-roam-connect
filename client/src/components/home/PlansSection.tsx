import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';

const PlansSection = () => {
  const { t } = useLanguage();

  const plans = [
    {
      key: 'plan1' as const,
      name: t.plans.plan1Name,
      tagline: t.plans.plan1Tagline,
      duration: t.plans.plan1Duration,
      gb: t.plans.plan1Gb,
      price: t.plans.plan1Price,
      popular: false,
    },
    {
      key: 'plan2' as const,
      name: t.plans.plan2Name,
      tagline: t.plans.plan2Tagline,
      duration: t.plans.plan2Duration,
      gb: t.plans.plan2Gb,
      price: t.plans.plan2Price,
      popular: true,
    },
    {
      key: 'plan3' as const,
      name: t.plans.plan3Name,
      tagline: t.plans.plan3Tagline,
      duration: t.plans.plan3Duration,
      gb: t.plans.plan3Gb,
      price: t.plans.plan3Price,
      popular: false,
    },
  ];

  return (
    <section id="plans" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {t.plans.title}
          </h2>
        </div>
        <p className="text-center text-gray-600 max-w-xl mx-auto mb-12">{t.plans.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map(({ key, name, tagline, duration, gb, price, popular }) => (
            <div
              key={key}
              className={`relative rounded-2xl border-2 p-6 flex flex-col space-y-4 ${
                popular
                  ? 'border-palop-green shadow-lg'
                  : 'border-gray-100 shadow-sm hover:shadow-md'
              } transition-shadow`}
              data-testid={`plan-card-${key}`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-palop-green text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {t.plans.popularBadge}
                </span>
              )}

              <div className="space-y-1">
                <h3 className="text-xl font-display font-bold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500">{tagline}</p>
              </div>

              <div className="space-y-0.5">
                <div className="text-4xl font-display font-bold text-palop-green">{gb}</div>
                <div className="text-sm text-gray-500">{t.plans.gbLabel}</div>
                <div className="text-sm text-gray-600 font-medium pt-1">{duration}</div>
              </div>

              <div className="text-2xl font-bold text-gray-900">{price}</div>

              <Button
                asChild
                className={`w-full mt-auto ${
                  popular
                    ? 'bg-palop-green hover:bg-palop-green/90 text-white'
                    : 'border-palop-green text-palop-green hover:bg-palop-green/5'
                }`}
                variant={popular ? 'default' : 'outline'}
                data-testid={`plan-cta-${key}`}
              >
                <Link to="/purchase">{t.plans.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-palop-green"></span>
          {t.plans.note}
        </p>
      </div>
    </section>
  );
};

export default PlansSection;
