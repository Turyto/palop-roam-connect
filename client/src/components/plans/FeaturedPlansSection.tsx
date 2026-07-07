import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';
import { planCards, palopCountries, CoverageTab, PlanCard } from '@/content/plansPageContent';

interface FeaturedPlansSectionProps {
  selectedTab: CoverageTab;
}

const FeaturedPlansSection = ({ selectedTab }: FeaturedPlansSectionProps) => {
  const { t, lang } = useLanguage();
  const f = t.plansPage.featured;

  const filteredPlans = planCards.filter((p) => p.coverage === selectedTab);

  const renderCard = (plan: PlanCard) => (
    <div
      key={plan.id}
      className={`relative rounded-2xl border-2 p-6 flex flex-col space-y-4 transition-shadow ${
        plan.popular
          ? 'border-palop-green shadow-lg'
          : 'border-gray-100 shadow-sm hover:shadow-md'
      } ${!plan.available ? 'opacity-80' : ''}`}
      data-testid={`plan-card-${plan.id}`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-palop-green text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          {f.mostPopular}
        </span>
      )}

      <div className="space-y-1">
        <h3 className="text-lg font-display font-bold text-gray-900">
          {plan.name[lang]}
        </h3>
        <p className="text-sm text-gray-500">{plan.subtitle[lang]}</p>
      </div>

      <div className="space-y-0.5">
        <div className="text-4xl font-display font-bold text-palop-green">{plan.data}</div>
        <div className="text-xs text-gray-500">{f.dataLabel}</div>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">{f.durationLabel}</span>
          <span className="font-medium text-gray-800">{plan.validity[lang]}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">{f.coverageLabel}</span>
          <span className="font-medium text-gray-800 text-right max-w-[55%]">{plan.coverageLabel[lang]}</span>
        </div>
      </div>

      <div className="text-2xl font-bold text-gray-900">{plan.price}</div>

      {plan.available ? (
        <Button
          asChild
          className={`w-full mt-auto ${
            plan.popular
              ? 'bg-palop-green hover:bg-palop-green/90 text-white'
              : 'border-palop-green text-palop-green hover:bg-palop-green/5'
          }`}
          variant={plan.popular ? 'default' : 'outline'}
          data-testid={`plan-cta-${plan.id}`}
        >
          <Link to={plan.href}>{f.choosePlan}</Link>
        </Button>
      ) : (
        <Button
          className="w-full mt-auto"
          variant="outline"
          disabled
          data-testid={`plan-cta-${plan.id}`}
        >
          {f.comingSoon}
        </Button>
      )}
    </div>
  );

  const gridClass = (count: number) =>
    `grid gap-6 max-w-4xl mx-auto ${
      count === 1
        ? 'grid-cols-1 max-w-xs'
        : count === 2
        ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
        : count === 4
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl'
        : 'grid-cols-1 md:grid-cols-3'
    }`;

  return (
    <section id="featured-plans" className="py-14 md:py-16 bg-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
            {f.title}
          </h2>
        </div>
        <p className="text-center text-gray-500 max-w-md mx-auto mb-10 text-sm">{f.subtitle}</p>

        {selectedTab === 'palop' ? (
          <div className="space-y-12 max-w-4xl mx-auto">
            {palopCountries.map((country) => {
              const countryPlans = filteredPlans.filter((p) => p.countryKey === country.key);
              if (countryPlans.length === 0) return null;
              return (
                <div key={country.key} data-testid={`palop-group-${country.key}`}>
                  <h3 className="flex items-center justify-center gap-2 text-xl font-display font-bold text-gray-900 mb-6">
                    <span aria-hidden="true">{country.flag}</span>
                    {country.name[lang]}
                  </h3>
                  <div className={gridClass(countryPlans.length)}>
                    {countryPlans.map(renderCard)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={gridClass(filteredPlans.length)}>
            {filteredPlans.map(renderCard)}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-10 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-palop-green"></span>
          {f.instantNote}
        </p>
      </div>
    </section>
  );
};

export default FeaturedPlansSection;
