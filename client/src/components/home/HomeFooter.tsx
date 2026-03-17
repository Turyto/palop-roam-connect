import { useLanguage } from '@/contexts/language';

const HomeFooter = () => {
  const { t } = useLanguage();

  const year = new Date().getFullYear();
  const copyright = t.footer.copyright.replace('{year}', String(year));

  const navLinks = [
    { label: t.footer.plans, href: '#plans' },
    { label: t.footer.compatibility, href: '#compatibility' },
    { label: t.footer.howItWorks, href: '#how-it-works' },
    { label: t.footer.faq, href: '#faq' },
    { label: t.footer.support, href: '#support' },
  ];

  const legalLinks = [
    { label: t.footer.terms, href: '/terms' },
    { label: t.footer.privacy, href: '/privacy' },
  ];

  const handleScroll = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-1 space-y-3">
            <span className="font-display font-bold text-xl text-white">
              <span className="text-palop-green">{t.footer.brandName.split(' ')[0]}</span>
              {' '}
              <span>{t.footer.brandName.split(' ').slice(1).join(' ')}</span>
            </span>
            <p className="text-sm leading-relaxed">{t.footer.brandTagline}</p>
          </div>

          <div className="space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll(link.href);
                }}
                className="block text-sm hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="space-y-3">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
