import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const UseCasesSection = () => {
  const { t } = useLanguage();

  const items = [
    t.useCases.item1,
    t.useCases.item2,
    t.useCases.item3,
    t.useCases.item4,
    t.useCases.item5,
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
              {t.useCases.title}
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">{t.useCases.intro}</p>
          </div>

          <ul className="space-y-3 pt-4">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-palop-green mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
