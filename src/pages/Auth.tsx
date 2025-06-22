
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import AuthForm from '@/components/AuthForm';

const Auth = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth page - user:', user?.id || 'none', 'role:', userRole || 'none', 'loading:', loading);
    
    if (!loading && user) {
      console.log('Auth page - User authenticated, checking role for redirect...');
      
      if (userRole === 'admin') {
        console.log('Redirecting admin to dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Redirecting user to homepage');
        navigate('/', { replace: true });
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
