
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import AuthForm from '@/components/AuthForm';

const Auth = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only handle redirects when we're not loading and have a user
    if (!loading && user) {
      // Use setTimeout to ensure state has fully settled
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/orders', { replace: true });
        }
      }, 100);
    }
  }, [user, userRole, loading, navigate]);

  // Show loading while we're determining auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show redirecting message if user is authenticated
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
