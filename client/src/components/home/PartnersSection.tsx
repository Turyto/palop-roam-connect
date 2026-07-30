import { useLanguage } from '@/contexts/language';

const praiaturLogo = '/praiatur-logo.png';
const milleniumLogo = '/millenium-travel-logo.jpg';
const palopianosLogo = '/palopianos-logo.png?v=2';

interface PartnerCard {
  id: string;
  logo: string;
  logoAlt: string;
  badge: string;
  credentials: string[];
  quote: string;
  attribution: string;
  linkLabel: string;
  href: string;
}

export default function PartnersSection() {
  const { t } = useLanguage();
  const p = t.partners;

  const partners: PartnerCard[] = [
    {
      id: 'praiatur',
      logo: praiaturLogo,
      logoAlt: 'Praiatur — Agência de Viagens e Turismo',
      badge: p.partnerBadge,
      credentials: [p.iataCredential, p.yearsCredential, p.airSenegalCredential],
      quote: p.quote,
      attribution: p.attribution,
      linkLabel: p.planLink,
      href: 'https://www.praiaturcaboverde.com',
    },
    {
      id: 'millenium',
      logo: milleniumLogo,
      logoAlt: 'Millenium Travel — Agência de Viagens e Turismo',
      badge: p.milleniumBadge,
      credentials: [p.milleniumFoundedCredential],
      quote: p.milleniumQuote,
      attribution: p.milleniumAttribution,
      linkLabel: p.milleniumLink,
      href: 'http://milleniumtravel.co.mz',
    },
    {
      id: 'palopianos',
      logo: palopianosLogo,
      logoAlt: 'Palopianos — Turismo Sustentável PALOP',
      badge: p.palopianosBadge,
      credentials: [p.palopianosCredential],
      quote: p.palopianosQuote,
      attribution: p.palopianosAttribution,
      linkLabel: p.palopianosLink,
      href: 'https://www.palopianos.com/',
    },
  ];

  return (
    <section
      className="px-4 md:px-6 py-8 md:py-12 bg-gray-50"
      data-testid="section-partners"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{p.heading}</h2>
          <p className="text-sm text-gray-500">{p.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-xl p-6 flex flex-col gap-4"
              style={{ border: '0.5px solid #e5e7eb' }}
              data-testid={`card-partner-${partner.id}`}
            >
              {/* Logo + credentials */}
              <div className="flex flex-col items-center gap-3">
                <div className="h-24 flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={partner.logoAlt}
                    className="max-h-24 w-auto max-w-[176px] object-contain"
                    loading="lazy"
                    data-testid={`img-partner-${partner.id}-logo`}
                  />
                </div>

                <span
                  className="text-xs font-semibold rounded-full px-3 py-1 text-center"
                  style={{ backgroundColor: 'rgba(45,184,75,0.1)', color: '#2DB84B' }}
                  data-testid={`badge-partner-${partner.id}`}
                >
                  {partner.badge}
                </span>

                <div className="flex flex-wrap gap-1.5 justify-center">
                  {partner.credentials.map((cred) => (
                    <span
                      key={cred}
                      className="text-[11px] bg-gray-100 text-gray-600 rounded px-2 py-0.5 font-medium"
                    >
                      {cred}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quote + attribution + link */}
              <div className="flex flex-col justify-between gap-4 flex-1 text-center md:text-left">
                <blockquote
                  className="text-gray-700 text-sm md:text-base leading-relaxed italic"
                  data-testid={`text-partner-${partner.id}-quote`}
                >
                  {partner.quote}
                </blockquote>
                <div>
                  <p
                    className="text-sm text-gray-500 mb-3"
                    data-testid={`text-partner-${partner.id}-attribution`}
                  >
                    {partner.attribution}
                  </p>
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#2DB84B' }}
                    data-testid={`link-partner-${partner.id}`}
                  >
                    {partner.linkLabel}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
