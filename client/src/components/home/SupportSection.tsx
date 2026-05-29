import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LifeBuoy, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const SupportSection = () => {
  const { t } = useLanguage();

  return (
    <section id="support" className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-palop-green/10 rounded-full flex items-center justify-center">
              <LifeBuoy className="h-8 w-8 text-palop-green" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {t.support.title}
          </h2>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed">{t.support.body}</p>

          <p className="text-sm text-palop-green font-medium">{t.support.helperLine}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              className="bg-palop-green hover:bg-palop-green/90 text-white"
              data-testid="support-primary-cta"
            >
              <Link to="/how-it-works">{t.support.primaryCta}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-palop-green text-palop-green hover:bg-palop-green/5"
              data-testid="support-secondary-cta"
            >
              <Link to="/support">{t.support.secondaryCta}</Link>
            </Button>
          </div>

          <a
            href="https://wa.me/351911186695"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:underline"
            data-testid="link-whatsapp-home-support"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp +351 911 186 695 · 8h–20h · resposta em 20 min
          </a>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
