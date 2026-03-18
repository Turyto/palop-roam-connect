import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QrCode, FileX2, Headset, Wifi } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const PhoneMockup = () => (
  <div className="relative w-full max-w-xs mx-auto select-none" aria-hidden="true">
    <div className="relative mx-auto w-56 h-96 bg-gray-900 rounded-[2.5rem] border-4 border-gray-800 shadow-2xl flex flex-col overflow-hidden">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-gray-700 rounded-full z-10" />

      <div className="flex-1 bg-white flex flex-col items-center justify-between p-4 pt-8">
        <div className="w-full text-center space-y-1">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">PALOP Connect</div>
          <div className="text-sm font-bold text-gray-900">eSIM ativo</div>
          <div className="flex items-center justify-center gap-1 text-palop-green">
            <Wifi className="h-4 w-4" />
            <span className="text-xs font-semibold">Portugal · 4G/5G</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="24" height="24" rx="2" fill="#1a7a4a"/>
              <rect x="8" y="8" width="16" height="16" rx="1" fill="white"/>
              <rect x="10" y="10" width="4" height="4" fill="#1a7a4a"/>
              <rect x="16" y="10" width="4" height="4" fill="#1a7a4a"/>
              <rect x="10" y="16" width="4" height="4" fill="#1a7a4a"/>
              <rect x="52" y="4" width="24" height="24" rx="2" fill="#1a7a4a"/>
              <rect x="56" y="8" width="16" height="16" rx="1" fill="white"/>
              <rect x="58" y="10" width="4" height="4" fill="#1a7a4a"/>
              <rect x="64" y="10" width="4" height="4" fill="#1a7a4a"/>
              <rect x="64" y="16" width="4" height="4" fill="#1a7a4a"/>
              <rect x="4" y="52" width="24" height="24" rx="2" fill="#1a7a4a"/>
              <rect x="8" y="56" width="16" height="16" rx="1" fill="white"/>
              <rect x="10" y="58" width="4" height="4" fill="#1a7a4a"/>
              <rect x="10" y="64" width="4" height="4" fill="#1a7a4a"/>
              <rect x="16" y="64" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="4" width="4" height="4" fill="#1a7a4a"/>
              <rect x="40" y="4" width="4" height="4" fill="#1a7a4a"/>
              <rect x="46" y="4" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="10" width="4" height="4" fill="#1a7a4a"/>
              <rect x="46" y="10" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="16" width="8" height="4" fill="#1a7a4a"/>
              <rect x="46" y="16" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="22" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="34" width="8" height="4" fill="#1a7a4a"/>
              <rect x="46" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="52" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="58" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="64" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="70" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="4" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="10" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="16" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="22" y="34" width="4" height="4" fill="#1a7a4a"/>
              <rect x="4" y="40" width="4" height="4" fill="#1a7a4a"/>
              <rect x="16" y="40" width="4" height="4" fill="#1a7a4a"/>
              <rect x="22" y="40" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="40" width="4" height="4" fill="#1a7a4a"/>
              <rect x="46" y="40" width="4" height="4" fill="#1a7a4a"/>
              <rect x="58" y="40" width="8" height="4" fill="#1a7a4a"/>
              <rect x="4" y="46" width="4" height="4" fill="#1a7a4a"/>
              <rect x="10" y="46" width="4" height="4" fill="#1a7a4a"/>
              <rect x="22" y="46" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="46" width="8" height="4" fill="#1a7a4a"/>
              <rect x="52" y="46" width="4" height="4" fill="#1a7a4a"/>
              <rect x="58" y="46" width="4" height="4" fill="#1a7a4a"/>
              <rect x="70" y="46" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="52" width="4" height="4" fill="#1a7a4a"/>
              <rect x="46" y="52" width="4" height="4" fill="#1a7a4a"/>
              <rect x="52" y="52" width="4" height="4" fill="#1a7a4a"/>
              <rect x="64" y="52" width="4" height="4" fill="#1a7a4a"/>
              <rect x="70" y="52" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="58" width="4" height="4" fill="#1a7a4a"/>
              <rect x="40" y="58" width="4" height="4" fill="#1a7a4a"/>
              <rect x="52" y="58" width="4" height="4" fill="#1a7a4a"/>
              <rect x="64" y="58" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="64" width="8" height="4" fill="#1a7a4a"/>
              <rect x="46" y="64" width="4" height="4" fill="#1a7a4a"/>
              <rect x="58" y="64" width="8" height="4" fill="#1a7a4a"/>
              <rect x="70" y="64" width="4" height="4" fill="#1a7a4a"/>
              <rect x="34" y="70" width="4" height="4" fill="#1a7a4a"/>
              <rect x="46" y="70" width="4" height="4" fill="#1a7a4a"/>
              <rect x="52" y="70" width="4" height="4" fill="#1a7a4a"/>
              <rect x="64" y="70" width="4" height="4" fill="#1a7a4a"/>
            </svg>
          </div>
          <span className="text-[10px] text-gray-500 font-medium">Digitaliza para ativar</span>
        </div>

        <div className="w-full space-y-2">
          <div className="bg-palop-green/10 border border-palop-green/20 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-palop-green">Plano Ligação</span>
            <span className="text-xs text-gray-600">5 GB · 7 dias</span>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
            <span className="text-[10px] text-gray-500">Entrega por email · Ativação imediata</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-700 rounded-full" />
    </div>

    <div className="absolute -right-4 top-12 bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 flex items-center gap-2">
      <div className="w-7 h-7 bg-palop-green/10 rounded-full flex items-center justify-center">
        <Wifi className="h-3.5 w-3.5 text-palop-green" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-gray-900">Online</div>
        <div className="text-[9px] text-gray-500">4G · Portugal</div>
      </div>
    </div>

    <div className="absolute -left-4 bottom-20 bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-center">
      <div className="text-[10px] font-bold text-palop-green">€9.99</div>
      <div className="text-[9px] text-gray-500">7 dias</div>
    </div>
  </div>
);

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-palop-green/5 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div className="space-y-7 text-center md:text-left">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-palop-green uppercase tracking-wider" data-testid="hero-eyebrow">
                {t.hero.eyebrow}
              </p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
                {t.hero.headline}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.hero.subheadline}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-palop-green hover:bg-palop-green/90 text-white text-base px-8 py-6"
                data-testid="hero-primary-cta"
              >
                <Link to="/plans">{t.hero.primaryCta}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-palop-green text-palop-green bg-transparent hover:bg-palop-green/5 px-8 py-6 text-base"
                data-testid="hero-secondary-cta"
              >
                <Link to="/compatibility">{t.hero.secondaryCta}</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {[
                { icon: QrCode, label: t.hero.trust1 },
                { icon: FileX2, label: t.hero.trust2 },
                { icon: Headset, label: t.hero.trust3 },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Icon className="h-4 w-4 text-palop-green flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 bg-palop-green/10 text-palop-green text-xs font-semibold px-3 py-1.5 rounded-full" data-testid="hero-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-palop-green inline-block"></span>
              {t.hero.badge}
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
