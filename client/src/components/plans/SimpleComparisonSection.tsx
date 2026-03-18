import { useLanguage } from '@/contexts/language';
import { comparisonRows } from '@/content/plansPageContent';

const SimpleComparisonSection = () => {
  const { t, lang } = useLanguage();
  const c = t.plansPage.comparison;

  return (
    <section id="compare-plans" className="py-14 bg-gray-50 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              {c.title}
            </h2>
            <p className="text-sm text-gray-500">{c.subtitle}</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[c.colPlan, c.colData, c.colDuration, c.colCoverage, c.colPrice].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    data-testid={`comparison-row-${row.id}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {row.name[lang]}
                    </td>
                    <td className="px-4 py-3 font-semibold text-palop-green whitespace-nowrap">
                      {row.data}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {row.duration[lang]}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.coverage[lang]}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center mt-5">
            <button
              onClick={() => {
                const el = document.querySelector('#featured-plans');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-semibold text-palop-green underline underline-offset-2 hover:text-palop-green/80 transition-colors"
              data-testid="comparison-view-all"
            >
              {c.viewAllCta}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SimpleComparisonSection;
