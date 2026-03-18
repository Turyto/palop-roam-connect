import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/language';

const CompatibilityFAQSection = () => {
  const { t } = useLanguage();
  const f = t.compatibilityPage.faq;

  const faqs = [
    { q: f.q1, a: f.a1 },
    { q: f.q2, a: f.a2 },
    { q: f.q3, a: f.a3 },
    { q: f.q4, a: f.a4 },
    { q: f.q5, a: f.a5 },
    { q: f.q6, a: f.a6 },
  ];

  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 text-center mb-8">
            {f.title}
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`compat-faq-${index}`}
                className="border border-gray-200 rounded-xl px-5 overflow-hidden bg-white"
                data-testid={`compat-faq-item-${index}`}
              >
                <AccordionTrigger
                  className="text-left font-medium text-gray-900 hover:no-underline py-4"
                  data-testid={`compat-faq-toggle-${index}`}
                >
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default CompatibilityFAQSection;
