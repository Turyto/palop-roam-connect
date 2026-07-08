
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import AuthForm from '@/components/AuthForm';

function getHashError() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('error=')) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('error') ?? '';
}

const Auth = () => {
  const { user, userRole, roleError, loading } = useAuth();
  const navigate = useNavigate();
  const [hashError] = useState(getHashError);

  useEffect(() => {
    if (!loading && user && userRole !== null && !roleError) {
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'partner') {
          navigate('/partner/dashboard', { replace: true });
        } else {
          navigate('/orders', { replace: true });
        }
      }, 100);
    }
  }, [user, userRole, roleError, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">A carregar...</div>
      </div>
    );
  }

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
          >
            Tentar novamente / Try again
          </button>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">A redirecionar...</div>
      </div>
    );
  }

  const expiredLink = hashError === 'access_denied';

  return <AuthForm expiredLink={expiredLink} defaultTab="magic" />;
};

export default Auth;
