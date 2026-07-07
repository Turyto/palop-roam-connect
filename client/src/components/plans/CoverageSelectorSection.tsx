import { useLanguage } from '@/contexts/language';
import { CoverageTab, regions } from '@/content/plansPageContent';

interface CoverageSelectorSectionProps {
  selectedTab: CoverageTab;
  onTabChange: (tab: CoverageTab) => void;
}

const CoverageSelectorSection = ({ selectedTab, onTabChange }: CoverageSelectorSectionProps) => {
  const { t, lang } = useLanguage();
  const c = t.plansPage.coverage;

  const selectedRegion = regions.find((r) => r.id === selectedTab) ?? regions[0];

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
            {c.title}
          </h2>
          <p className="text-sm text-gray-500">{c.helper}</p>
          <div
            className="inline-flex flex-wrap justify-center rounded-full border border-gray-200 bg-gray-50 p-1 gap-1"
            role="tablist"
            aria-label="Coverage selector"
          >
            {regions.map((region) => (
              <button
                key={region.id}
                role="tab"
                aria-selected={selectedTab === region.id}
                onClick={() => onTabChange(region.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedTab === region.id
                    ? 'bg-palop-green text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
                data-testid={`coverage-tab-${region.id}`}
              >
                {region.tabLabel[lang]}
              </button>
            ))}
          </div>
          <p
            className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto"
            data-testid={`coverage-line-${selectedRegion.id}`}
          >
            {selectedRegion.coverageLine[lang]}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CoverageSelectorSection;
