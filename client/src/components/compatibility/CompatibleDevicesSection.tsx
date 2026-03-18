import { Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const CompatibleDevicesSection = () => {
  const { t } = useLanguage();
  const d = t.compatibilityPage.devices;

  const brands = [
    {
      label: d.appleLabel,
      items: [d.apple1, d.apple2, d.apple3, d.apple4, d.apple5, d.apple6],
      color: 'bg-gray-50 border-gray-200',
      dot: 'bg-gray-800',
    },
    {
      label: d.samsungLabel,
      items: [d.samsung1, d.samsung2, d.samsung3, d.samsung4],
      color: 'bg-blue-50 border-blue-100',
      dot: 'bg-blue-600',
    },
    {
      label: d.googleLabel,
      items: [d.google1, d.google2, d.google3],
      color: 'bg-green-50 border-green-100',
      dot: 'bg-green-600',
    },
    {
      label: d.othersLabel,
      items: [d.others1, d.others2, d.others3, d.others4],
      color: 'bg-purple-50 border-purple-100',
      dot: 'bg-purple-600',
    },
  ];

  return (
    <section id="device-list" className="py-14 bg-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-palop-green/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-palop-green" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              {d.title}
            </h2>
            <p className="text-sm text-gray-500">{d.intro}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {brands.map(({ label, items, color, dot }) => (
              <div
                key={label}
                className={`rounded-2xl border p-5 space-y-3 ${color}`}
                data-testid={`device-brand-${label.toLowerCase()}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`}></span>
                  <h3 className="font-display font-bold text-gray-900">{label}</h3>
                </div>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0 mt-2"></span>
                      <span className="text-sm text-gray-700 leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 italic">{d.disclaimer}</p>
        </div>
      </div>
    </section>
  );
};

export default CompatibleDevicesSection;
