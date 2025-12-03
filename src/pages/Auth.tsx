import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import authBackground from '@/assets/auth-background.jpg';

type AuthMode = 'signin' | 'signup' | 'reset';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao SpeakBoard."
        });
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login.');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado.');
        } else {
          setError('Erro ao cadastrar. Tente novamente.');
        }
      } else {
        setSuccess('Cadastro realizado! Verifique seu email.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta."
        });
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setError('Erro ao enviar link. Tente novamente.');
      } else {
        setSuccess('Link de recuperação enviado!');
        toast({
          title: "Link enviado!",
          description: "Verifique seu email para redefinir sua senha."
        });
        setTimeout(() => setMode('signin'), 3000);
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  const switchMode = (newMode: AuthMode) => {
    clearForm();
    setMode(newMode);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-[420px] xl:w-[480px] bg-card flex flex-col justify-center p-8 lg:p-12 min-h-screen lg:min-h-0">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo & Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-semibold text-foreground">SpeakBoard</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {mode === 'signin' && 'Entrar'}
              {mode === 'signup' && 'Criar conta'}
              {mode === 'reset' && 'Recuperar senha'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'signin' && 'Acesse sua conta para continuar'}
              {mode === 'signup' && 'Preencha os dados para se cadastrar'}
              {mode === 'reset' && 'Digite seu email para receber o link'}
            </p>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading || !validateEmail(email)}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Criar aqui
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha (min. 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-success bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading || !validateEmail(email) || password.length < 6}
              >
                {loading ? 'Cadastrando...' : 'Criar Conta'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-primary hover:underline font-medium"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-success bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => switchMode('signin')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={loading || !validateEmail(email)}
                >
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </Button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-8">
            Powered by <span className="font-medium text-foreground">SpeakBoard</span>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block flex-1 relative">
        <img
          src={authBackground}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card/20" />
      </div>
    </div>
  );
};

export default Auth;
