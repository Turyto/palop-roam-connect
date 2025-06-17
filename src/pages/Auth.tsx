
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';

const Auth = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userRole) {
      // Redirect admin users to admin dashboard, regular users to homepage
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <AuthForm />;
};

export default Auth;
