import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

function getHashError() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('error=')) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return params.get('error') ?? '';
}

// True when the URL carries a recovery token supabase-js still needs to
// consume (it signs the user in from the hash shortly after page load).
function hasRecoveryToken() {
  const hash = window.location.hash;
  return !!hash && (hash.includes('access_token=') || hash.includes('type=recovery'));
}

/**
 * Set a new password. Reached two ways:
 * 1. From the password-recovery email link (Supabase signs the user in
 *    via the URL hash, then this form saves the new password).
 * 2. By a signed-in user who wants to change their password.
 */
const ResetPassword = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hashError] = useState(getHashError);
  // Auth "loading" can flip false before supabase-js finishes consuming the
  // recovery token from the URL hash. Keep showing the spinner while a token
  // is pending so the user never flashes the "no session" card.
  const [awaitingRecovery, setAwaitingRecovery] = useState(hasRecoveryToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (password.length < 6) {
      toast({
        title: 'Palavra-passe demasiado curta',
        description: 'Utiliza pelo menos 6 caracteres. / Use at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: 'As palavras-passe não coincidem',
        description: 'Confirma que escreveste a mesma palavra-passe nos dois campos.',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        setDone(true);
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro. Tenta novamente. / Something went wrong, try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!awaitingRecovery) return;
    if (user) {
      setAwaitingRecovery(false);
      return;
    }
    // Safety net: if the token is invalid and no session ever arrives,
    // stop waiting so the fallback cards can render.
    const timer = setTimeout(() => setAwaitingRecovery(false), 6000);
    return () => clearTimeout(timer);
  }, [awaitingRecovery, user]);

  if (loading || (awaitingRecovery && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">A carregar...</div>
      </div>
    );
  }

  // Recovery link expired or was already used.
  if (!user && hashError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md border-amber-200">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-amber-500" size={44} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">O link expirou</h2>
            <p className="text-gray-600 text-sm mb-6">
              Os links de recuperação são válidos por 1 hora e de uso único.
              Pede um novo link na página de acesso.
              <span className="block mt-1 text-gray-400">
                The reset link expired — request a new one from the sign-in page.
              </span>
            </p>
            <Button asChild className="bg-palop-green hover:bg-palop-green/90">
              <Link to="/auth">Pedir novo link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Arrived without a session (e.g. typed the URL directly).
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Lock className="mx-auto mb-4 text-gray-400" size={44} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Recuperar palavra-passe
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Para definires uma nova palavra-passe, pede um link de recuperação
              na página de acesso.
              <span className="block mt-1 text-gray-400">
                To set a new password, request a reset link from the sign-in page.
              </span>
            </p>
            <Button asChild className="bg-palop-green hover:bg-palop-green/90">
              <Link to="/auth">Ir para a página de acesso</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="mx-auto mb-4 text-palop-green" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Palavra-passe atualizada!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Já podes usar a nova palavra-passe na próxima vez que entrares.
              <span className="block mt-1 text-gray-400">Your password has been updated.</span>
            </p>
            <Button
              onClick={() => navigate('/auth', { replace: true })}
              className="bg-palop-green hover:bg-palop-green/90"
              data-testid="button-reset-continue"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Nova palavra-passe</CardTitle>
          <CardDescription>
            {user.email} · escolhe a tua nova palavra-passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova palavra-passe
              </label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Pelo menos 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
                disabled={saving}
                data-testid="input-new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar palavra-passe
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repete a palavra-passe"
                required
                minLength={6}
                autoComplete="new-password"
                disabled={saving}
                data-testid="input-confirm-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-palop-green hover:bg-palop-green/90"
              disabled={saving}
              data-testid="button-save-password"
            >
              {saving ? 'A guardar...' : 'Guardar nova palavra-passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
