
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import AuthForm from '@/components/AuthForm';

const Auth = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth page - Current state:', { 
      hasUser: !!user, 
      userRole: userRole || 'none', 
      loading 
    });
    
    // Only handle redirects when we're not loading and have a user
    if (!loading && user) {
      console.log('Auth page - User authenticated, checking role for redirect...');
      
      // Use setTimeout to ensure state has fully settled
      setTimeout(() => {
        if (userRole === 'admin') {
          console.log('Redirecting admin to dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log('Redirecting user to dashboard');
          navigate('/orders', { replace: true });
        }
      }, 100);
    }
  }, [user, userRole, loading, navigate]);

  // Show loading while we're determining auth state
  if (loading) {
    console.log('Auth page - Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show redirecting message if user is authenticated
  if (user) {
    console.log('Auth page - User authenticated, showing redirect message');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  console.log('Auth page - No user, showing auth form');
  return <AuthForm />;
};

export default Auth;
