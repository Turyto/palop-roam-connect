import { Wifi, MessageCircle, ClipboardX, LifeBuoy } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const BenefitsSection = () => {
  const { t } = useLanguage();

  const cards = [
    { icon: Wifi, title: t.benefits.card1Title, body: t.benefits.card1Body },
    { icon: MessageCircle, title: t.benefits.card2Title, body: t.benefits.card2Body },
    { icon: ClipboardX, title: t.benefits.card3Title, body: t.benefits.card3Body },
    { icon: LifeBuoy, title: t.benefits.card4Title, body: t.benefits.card4Body },
  ];

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {t.benefits.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-10 h-10 bg-palop-green/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-palop-green" />
                </div>
                <h3 className="font-display font-semibold text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
