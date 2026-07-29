
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
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
  const { t } = useLanguage();
  const a = t.auth;
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
        toast({ title: a.errorTitle, description: error.message, variant: 'destructive' });
      } else {
        setMagicSent(true);
      }
    } catch {
      toast({ title: a.errorTitle, description: a.genericError, variant: 'destructive' });
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
        toast({ title: a.errorTitle, description: error.message, variant: 'destructive' });
      } else {
        setResetSent(true);
      }
    } catch {
      toast({ title: a.errorTitle, description: a.genericError, variant: 'destructive' });
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
          toast({ title: a.accountCreatedTitle, description: a.accountCreatedDesc });
          setPasswordMode('signin');
          setEmail(''); setPassword(''); setFullName('');
        }
      } else {
        result = await signIn(email, password);
        if (!result.error) return;
      }
      if (result.error) {
        toast({ title: a.errorTitle, description: result.error.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: a.errorTitle, description: a.unexpectedError, variant: 'destructive' });
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
                    {a.expiredTitle}
                  </p>
                  <p className="text-amber-800 text-sm leading-snug">
                    {a.expiredDesc}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{a.checkEmailTitle}</h2>
              <p className="text-gray-600 mb-1">{a.resetSentIntro}</p>
              <p className="font-medium text-gray-900 mb-4">{email}</p>
              <p className="text-sm text-gray-500 mb-6">
                {a.resetSentHelper}
              </p>
              <button
                onClick={() => { setResetSent(false); setPasswordMode('signin'); setEmail(''); }}
                className="text-sm text-palop-green hover:underline"
                data-testid="button-back-to-signin"
              >
                {a.backToSignIn}
              </button>
            </CardContent>
          </Card>
        ) : magicSent ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle className="mx-auto mb-4 text-palop-green" size={48} />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{a.checkEmailTitle}</h2>
              <p className="text-gray-600 mb-1">{a.magicSentIntro}</p>
              <p className="font-medium text-gray-900 mb-4">{email}</p>
              <p className="text-sm text-gray-500 mb-6">
                {a.magicSentHelper}
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail(''); }}
                className="text-sm text-palop-green hover:underline"
              >
                {a.useAnotherEmail}
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">{a.cardTitle}</CardTitle>
              <CardDescription>{a.cardSubtitle}</CardDescription>
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
                  {a.tabMagic}
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
                  {a.tabPassword}
                </button>
              </div>

              {tab === 'magic' && (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-1">
                      {a.emailLabel}
                    </label>
                    <Input
                      id="magic-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={a.emailPlaceholder}
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
                    {loading ? a.sending : a.sendMagicLink}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    {a.magicHelper}
                  </p>
                </form>
              )}

              {tab === 'password' && passwordMode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {a.forgotIntro}
                  </p>
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                      {a.emailLabel}
                    </label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={a.emailPlaceholder}
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
                    {loading ? a.sending : a.sendResetLink}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => !loading && setPasswordMode('signin')}
                      className="text-sm text-palop-green hover:underline disabled:opacity-50"
                      disabled={loading}
                      data-testid="button-cancel-forgot"
                    >
                      {a.backToSignIn}
                    </button>
                  </div>
                </form>
              )}

              {tab === 'password' && passwordMode !== 'forgot' && (
                <form onSubmit={handlePassword} className="space-y-4">
                  {passwordMode === 'signup' && (
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        {a.fullNameLabel}
                      </label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={a.fullNamePlaceholder}
                        required
                        disabled={loading}
                        data-testid="input-full-name"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="pw-email" className="block text-sm font-medium text-gray-700 mb-1">
                      {a.emailLabel}
                    </label>
                    <Input
                      id="pw-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={a.emailPlaceholder}
                      required
                      disabled={loading}
                      data-testid="input-password-email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {a.passwordLabel}
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={a.passwordPlaceholder}
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
                    {loading ? a.processing : passwordMode === 'signin' ? a.signIn : a.createAccount}
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
                        {a.forgotPassword}
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
                      {passwordMode === 'signin' ? a.noAccount : a.haveAccount}
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
