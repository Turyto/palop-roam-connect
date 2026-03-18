import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, BookOpen, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const UtilityLinksSection = () => {
  const { t } = useLanguage();
  const u = t.plansPage.utility;

  const cards = [
    {
      icon: Smartphone,
      title: u.card1Title,
      desc: u.card1Desc,
      cta: u.card1Cta,
      href: '/esim',
    },
    {
      icon: BookOpen,
      title: u.card2Title,
      desc: u.card2Desc,
      cta: u.card2Cta,
      href: '/esim',
    },
    {
      icon: MessageCircle,
      title: u.card3Title,
      desc: u.card3Desc,
      cta: u.card3Cta,
      href: '/support',
    },
  ];

  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-gray-900 mb-8">
          {u.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {cards.map(({ icon: Icon, title, desc, cta, href }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col space-y-4"
              data-testid={`utility-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-10 h-10 bg-palop-green/10 rounded-full flex items-center justify-center">
                <Icon className="h-5 w-5 text-palop-green" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-display font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
              <Button
                asChild
                variant="outline"
                className="border-palop-green text-palop-green hover:bg-palop-green/5 w-full"
                data-testid={`utility-cta-${cta.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Link to={href}>{cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UtilityLinksSection;
