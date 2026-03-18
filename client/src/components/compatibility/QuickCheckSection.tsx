import { Settings, Wifi, PlusCircle, Unlock } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const QuickCheckSection = () => {
  const { t } = useLanguage();
  const q = t.compatibilityPage.quickCheck;

  const steps = [
    { icon: Settings, title: q.step1Title, desc: q.step1Desc },
    { icon: Wifi, title: q.step2Title, desc: q.step2Desc },
    { icon: PlusCircle, title: q.step3Title, desc: q.step3Desc },
    { icon: Unlock, title: q.step4Title, desc: q.step4Desc },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 text-center">
            {q.title}
          </h2>

          <div className="space-y-4">
            {steps.map(({ icon: Icon, title, desc }, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-gray-50 rounded-xl p-5"
                data-testid={`quick-check-step-${index + 1}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-palop-green text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-palop-green flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-palop-green/10 border border-palop-green/20 rounded-xl px-5 py-4 text-center">
            <p className="text-sm font-medium text-palop-green">{q.helperText}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickCheckSection;
