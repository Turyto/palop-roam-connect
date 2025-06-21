
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';

const Auth = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth page - user:', user?.id || 'none', 'role:', userRole || 'none', 'loading:', loading);
    
    if (!loading && user) {
      console.log('Auth page - User authenticated, checking role for redirect...');
      
      // Wait a bit for userRole to be fetched if user exists but role is still loading
      if (userRole) {
        if (userRole === 'admin') {
          console.log('Redirecting admin to dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else {
          console.log('Redirecting user to homepage');
          navigate('/', { replace: true });
        }
      } else {
        // If user exists but role is not yet loaded, wait a bit more
        console.log('User exists but role not yet loaded, waiting...');
        const timeout = setTimeout(() => {
          // If still no role after timeout, default to homepage
          if (!userRole) {
            console.log('No role found after timeout, redirecting to homepage');
            navigate('/', { replace: true });
          }
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    console.log('Auth page - Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't show auth form if user is already authenticated
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
