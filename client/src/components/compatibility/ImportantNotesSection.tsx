import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const ImportantNotesSection = () => {
  const { t } = useLanguage();
  const n = t.compatibilityPage.notes;

  const items = [n.item1, n.item2, n.item3, n.item4, n.item5];

  return (
    <section className="py-10 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <h2 className="text-base font-display font-bold text-amber-800">
                {n.title}
              </h2>
            </div>
            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-amber-900 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImportantNotesSection;
