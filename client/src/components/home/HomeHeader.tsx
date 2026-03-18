import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';
import UserMenu from '@/components/UserMenu';
import type { Lang } from '@/lib/translations';

const HomeHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  type NavItem = { label: string; href: string; anchor?: string };

  const navItems: NavItem[] = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.plans, href: '/plans' },
    { label: t.nav.compatibility, href: '/compatibility' },
    { label: t.nav.howItWorks, href: '#how-it-works', anchor: 'how-it-works' },
    { label: t.nav.faq, href: '#faq', anchor: 'faq' },
    { label: t.nav.support, href: '/support' },
  ];

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    setIsOpen(false);
    if (item.anchor) {
      e.preventDefault();
      if (isHome) {
        const el = document.querySelector(`#${item.anchor}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${item.anchor}`);
      }
    }
  };

  const renderAuthSection = () => {
    if (loading) return null;
    if (user) return <UserMenu />;
    return (
      <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:border-palop-green hover:text-palop-green" data-testid="header-sign-in">
        <Link to="/auth">{t.nav.signIn}</Link>
      </Button>
    );
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-display font-bold text-xl">
              <span className="text-palop-green">PALOP</span>
              <span className="text-gray-900"> Connect</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.anchor ? (isHome ? item.href : `/#${item.anchor}`) : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="text-sm font-medium text-gray-600 hover:text-palop-green transition-colors"
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center rounded-full border border-gray-200 overflow-hidden text-sm font-medium">
              <button
                onClick={() => setLang('pt')}
                className={`px-3 py-1.5 transition-colors ${lang === 'pt' ? 'bg-palop-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                data-testid="lang-pt"
              >
                PT
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-palop-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                data-testid="lang-en"
              >
                EN
              </button>
            </div>
            {renderAuthSection()}
            <Button asChild className="bg-palop-green hover:bg-palop-green/90 text-white" data-testid="header-buy-now">
              <Link to="/plans">{t.nav.buyNow}</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-palop-green"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.anchor ? (isHome ? item.href : `/#${item.anchor}`) : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="block text-sm font-medium text-gray-700 hover:text-palop-green transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 flex items-center space-x-3">
              <div className="flex items-center rounded-full border border-gray-200 overflow-hidden text-sm font-medium">
                <button
                  onClick={() => setLang('pt')}
                  className={`px-3 py-1.5 transition-colors ${lang === 'pt' ? 'bg-palop-green text-white' : 'text-gray-600'}`}
                >
                  PT
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-palop-green text-white' : 'text-gray-600'}`}
                >
                  EN
                </button>
              </div>
              {!loading && !user && (
                <Button asChild variant="outline" size="sm" className="border-gray-300">
                  <Link to="/auth">{t.nav.signIn}</Link>
                </Button>
              )}
              {!loading && user && <UserMenu />}
              <Button asChild className="bg-palop-green text-white flex-1" size="sm">
                <Link to="/plans">{t.nav.buyNow}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HomeHeader;
