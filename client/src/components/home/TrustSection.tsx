import { PackageCheck, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const TrustSection = () => {
  const { t } = useLanguage();

  const points = [
    { icon: PackageCheck, label: t.trust.point1 },
    { icon: BookOpen, label: t.trust.point2 },
    { icon: MessageSquare, label: t.trust.point3 },
    { icon: Zap, label: t.trust.point4 },
  ];

  return (
    <section className="py-16 md:py-20 bg-palop-green/5 border-y border-palop-green/10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {t.trust.title}
          </h2>
          <p className="text-base text-gray-600">{t.trust.body}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {points.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 flex flex-col items-center text-center space-y-3 border border-gray-100 shadow-sm"
            >
              <div className="w-10 h-10 bg-palop-green/10 rounded-full flex items-center justify-center">
                <Icon className="h-5 w-5 text-palop-green" />
              </div>
              <p className="text-sm font-medium text-gray-700">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
