import { useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Handshake, LayoutDashboard, Euro, Package, LogOut } from 'lucide-react';

const SECTIONS = [
  { path: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/partner/commissions', label: 'Comissões / Commissions', icon: Euro },
  { path: '/partner/consignment', label: 'Consignação / Consignment', icon: Package },
];

const PartnerArea = () => {
  const { user, userRole, roleError, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }
      if (userRole && userRole !== 'partner') {
        // Redirect other roles to their own area
        navigate(userRole === 'admin' ? '/admin/dashboard' : '/orders', { replace: true });
      }
    }
  }, [user, userRole, loading, navigate]);

  if (user && roleError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-sm text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-800 font-medium mb-1">
            Não foi possível carregar o tipo de conta.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Could not load your account type. Please try again or contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-palop-green underline hover:opacity-75"
            data-testid="button-partner-role-retry"
          >
            Tentar novamente / Try again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !user || userRole !== 'partner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">A carregar... / Loading...</div>
      </div>
    );
  }

  if (location.pathname === '/partner' || location.pathname === '/partner/') {
    return <Navigate to="/partner/dashboard" replace />;
  }

  const active = SECTIONS.find((s) => s.path === location.pathname) ?? SECTIONS[0];

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake className="h-6 w-6 text-palop-green" />
            <h1 className="text-lg font-semibold" data-testid="text-partner-title">
              Área de Parceiro / Partner Area
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} data-testid="button-partner-signout">
            <LogOut className="h-4 w-4 mr-2" />
            Sair / Sign out
          </Button>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 flex-wrap">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = s.path === active.path;
            return (
              <Link
                key={s.path}
                to={s.path}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  isActive
                    ? 'bg-palop-green text-white border-palop-green'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
                data-testid={`link-partner-${s.path.split('/').pop()}`}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-partner-section-title">{active.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600" data-testid="text-partner-placeholder">
              Em breve — esta secção está a ser preparada.
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Coming soon — this section is being prepared.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PartnerArea;
