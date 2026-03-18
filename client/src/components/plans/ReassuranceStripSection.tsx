import { Zap, QrCode, Smartphone, LifeBuoy } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const ReassuranceStripSection = () => {
  const { t } = useLanguage();
  const r = t.plansPage.reassurance;

  const items = [
    { icon: Zap, label: r.item1 },
    { icon: QrCode, label: r.item2 },
    { icon: Smartphone, label: r.item3 },
    { icon: LifeBuoy, label: r.item4 },
  ];

  return (
    <section className="py-12 bg-palop-green/5 border-y border-palop-green/10">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-display font-bold text-center text-gray-900 mb-8">
          {r.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-4 flex items-start gap-3 border border-gray-100 shadow-sm"
            >
              <div className="w-8 h-8 bg-palop-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-palop-green" />
              </div>
              <p className="text-sm font-medium text-gray-700 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReassuranceStripSection;
