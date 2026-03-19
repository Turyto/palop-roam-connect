import { useLanguage } from '@/contexts/language';
import { CoverageTab } from '@/content/plansPageContent';

interface CoverageSelectorSectionProps {
  selectedTab: CoverageTab;
  onTabChange: (tab: CoverageTab) => void;
}

const CoverageSelectorSection = ({ selectedTab, onTabChange }: CoverageSelectorSectionProps) => {
  const { t } = useLanguage();
  const c = t.plansPage.coverage;

  const tabs: { id: CoverageTab; label: string }[] = [
    { id: 'portugal', label: c.tabPortugal },
    { id: 'europe', label: c.tabEurope },
  ];

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
            {c.title}
          </h2>
          <p className="text-sm text-gray-500">{c.helper}</p>
          <div
            className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1 gap-1"
            role="tablist"
            aria-label="Coverage selector"
          >
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                aria-selected={selectedTab === id}
                onClick={() => onTabChange(id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedTab === id
                    ? 'bg-palop-green text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
                data-testid={`coverage-tab-${id}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageSelectorSection;
