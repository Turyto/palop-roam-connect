
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import AuthForm from '@/components/AuthForm';

const Auth = () => {
  const { user, userRole, roleError, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect once we have the user AND the role has been resolved without error.
    // userRole starts as null and is set asynchronously; waiting for it (and for no roleError)
    // prevents admin users from being silently downgraded to customer on redirect.
    if (!loading && user && userRole !== null && !roleError) {
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/orders', { replace: true });
        }
      }, 100);
    }
  }, [user, userRole, roleError, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Role resolution failed — show safe message, do not redirect.
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

  // User is authenticated and role is pending — show redirect holding state.
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  return <AuthForm />;
};

export default Auth;
