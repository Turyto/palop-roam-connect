
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

type AuthTab = 'magic' | 'password';
type PasswordMode = 'signin' | 'signup' | 'forgot';

interface AuthFormProps {
  defaultTab?: AuthTab;
  expiredLink?: boolean;
}

const AuthForm = ({ defaultTab = 'magic', expiredLink = false }: AuthFormProps) => {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: true,
        },
      });
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        setMagicSent(true);
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro. Tenta novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } else {
        setResetSent(true);
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro. Tenta novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (passwordMode === 'forgot') return handleForgotPassword(e);
    setLoading(true);
    try {
      let result;
      if (passwordMode === 'signup') {
        result = await signUp(email, password, fullName);
        if (!result.error) {
          toast({ title: 'Conta criada!', description: 'Verifica o teu email para confirmar a conta.' });
          setPasswordMode('signin');
          setEmail(''); setPassword(''); setFullName('');
        }
      } else {
        result = await signIn(email, password);
        if (!result.error) return;
      }
      if (result.error) {
        toast({ title: 'Erro', description: result.error.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro', description: 'Ocorreu um erro inesperado. Tenta novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">

        {expiredLink && !magicSent && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3 items-start">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-amber-900 text-sm mb-0.5">
                    O link expirou
                  </p>
                  <p className="text-amber-800 text-sm leading-snug">
                    Os links são válidos por 1 hora e de uso único.
                    Introduz o teu email para receber um novo link de acesso — sem palavra-passe.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {resetSent ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle className="mx-auto mb-4 text-palop-green" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifica o teu email</h2>
              <p className="text-gray-600 mb-1">Enviámos um link de recuperação para</p>
              <p className="font-medium text-gray-900 mb-4">{email}</p>
              <p className="text-sm text-gray-500 mb-6">
                Clica no link para escolheres uma nova palavra-passe.
                O link é válido por 1 hora.
              </p>
              <button
                onClick={() => { setResetSent(false); setPasswordMode('signin'); setEmail(''); }}
                className="text-sm text-palop-green hover:underline"
                data-testid="button-back-to-signin"
              >
                Voltar ao início de sessão
              </button>
            </CardContent>
          </Card>
        ) : magicSent ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle className="mx-auto mb-4 text-palop-green" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifica o teu email</h2>
              <p className="text-gray-600 mb-1">Enviámos um link de acesso para</p>
              <p className="font-medium text-gray-900 mb-4">{email}</p>
              <p className="text-sm text-gray-500 mb-6">
                Clica no link para aceder às tuas encomendas — sem palavra-passe.
                O link é válido por 1 hora.
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail(''); }}
                className="text-sm text-palop-green hover:underline"
              >
                Usar outro email
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Aceder à minha conta</CardTitle>
              <CardDescription>PALOP Connect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex rounded-lg border border-gray-200 p-1 mb-6 bg-gray-50">
                <button
                  onClick={() => setTab('magic')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    tab === 'magic'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  data-testid="tab-magic-link"
                >
                  <Mail size={15} />
                  Link por email
                </button>
                <button
                  onClick={() => setTab('password')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    tab === 'password'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  data-testid="tab-password"
                >
                  <Lock size={15} />
                  Palavra-passe
                </button>
              </div>

              {tab === 'magic' && (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="magic-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="o.teu@email.com"
                      required
                      disabled={loading}
                      data-testid="input-magic-email"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-palop-green hover:bg-palop-green/90"
                    disabled={loading}
                    data-testid="button-send-magic-link"
                  >
                    {loading ? 'A enviar...' : 'Enviar link de acesso'}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Receberás um email com um link de acesso instantâneo — sem palavra-passe.
                  </p>
                </form>
              )}

              {tab === 'password' && passwordMode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Introduz o teu email e enviamos-te um link para escolheres
                    uma nova palavra-passe.
                  </p>
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="o.teu@email.com"
                      required
                      disabled={loading}
                      data-testid="input-forgot-email"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-palop-green hover:bg-palop-green/90"
                    disabled={loading}
                    data-testid="button-send-reset-link"
                  >
                    {loading ? 'A enviar...' : 'Enviar link de recuperação'}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => !loading && setPasswordMode('signin')}
                      className="text-sm text-palop-green hover:underline disabled:opacity-50"
                      disabled={loading}
                      data-testid="button-cancel-forgot"
                    >
                      Voltar ao início de sessão
                    </button>
                  </div>
                </form>
              )}

              {tab === 'password' && passwordMode !== 'forgot' && (
                <form onSubmit={handlePassword} className="space-y-4">
                  {passwordMode === 'signup' && (
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome completo
                      </label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="O teu nome"
                        required
                        disabled={loading}
                        data-testid="input-full-name"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="pw-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="pw-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="o.teu@email.com"
                      required
                      disabled={loading}
                      data-testid="input-password-email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Palavra-passe
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="A tua palavra-passe"
                      required
                      minLength={6}
                      disabled={loading}
                      data-testid="input-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-palop-green hover:bg-palop-green/90"
                    disabled={loading}
                    data-testid="button-password-submit"
                  >
                    {loading ? 'A processar...' : passwordMode === 'signin' ? 'Entrar' : 'Criar conta'}
                  </Button>
                  <div className="text-center space-y-2">
                    {passwordMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => !loading && setPasswordMode('forgot')}
                        className="block w-full text-sm text-gray-500 hover:text-palop-green hover:underline disabled:opacity-50"
                        disabled={loading}
                        data-testid="button-forgot-password"
                      >
                        Esqueceste a palavra-passe?
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!loading) {
                          setPasswordMode(passwordMode === 'signin' ? 'signup' : 'signin');
                          setEmail(''); setPassword(''); setFullName('');
                        }
                      }}
                      className="text-sm text-palop-green hover:underline disabled:opacity-50"
                      disabled={loading}
                    >
                      {passwordMode === 'signin' ? 'Não tens conta? Criar conta' : 'Já tens conta? Entrar'}
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
