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
      if (session) navigate('/');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        toast({ title: "Login realizado com sucesso!", description: "Bem-vindo ao SpeakBoard." });
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const validateEmail = (email: string) => email.includes('@') && email.includes('.');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) setError('Email ou senha incorretos.');
        else if (error.message.includes('Email not confirmed')) setError('Confirme seu email antes de fazer login.');
        else setError('Erro ao fazer login. Tente novamente.');
      }
    } catch { setError('Erro inesperado. Tente novamente.'); }
    finally { setLoading(false); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); setLoading(false); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); setLoading(false); return; }
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/email-confirmation` }
      });
      if (error) {
        setError(error.message.includes('User already registered') ? 'Este email já está cadastrado.' : 'Erro ao cadastrar. Tente novamente.');
      } else {
        setSuccess('Cadastro realizado! Verifique seu email.');
        setEmail(''); setPassword(''); setConfirmPassword('');
        toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      }
    } catch { setError('Erro inesperado. Tente novamente.'); }
    finally { setLoading(false); }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    if (!validateEmail(email)) { setError('Por favor, insira um email válido.'); setLoading(false); return; }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) setError('Erro ao enviar link. Tente novamente.');
      else {
        setSuccess('Link de recuperação enviado!');
        toast({ title: "Link enviado!", description: "Verifique seu email para redefinir sua senha." });
        setTimeout(() => setMode('signin'), 3000);
      }
    } catch { setError('Erro inesperado. Tente novamente.'); }
    finally { setLoading(false); }
  };

  const clearForm = () => { setEmail(''); setPassword(''); setConfirmPassword(''); setError(null); setSuccess(null); };
  const switchMode = (newMode: AuthMode) => { clearForm(); setMode(newMode); };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Blue gradient branding */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-[hsl(210,78%,46%)] via-[hsl(210,78%,38%)] to-[hsl(215,60%,22%)]">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="flex items-center gap-3">
            <Logo className="w-11 h-11" />
            <span className="text-xl font-bold text-white tracking-tight">SpeakBoard</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Hello<br />SpeakBoard!
              <span className="inline-block ml-2 text-3xl">👋</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Gerencie seus alunos, aulas e finanças de forma inteligente. A plataforma completa para professores de inglês.
            </p>
          </div>

          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} SpeakBoard. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 lg:flex-none lg:w-[480px] xl:w-[520px] flex flex-col justify-center bg-background min-h-screen lg:min-h-0 border-l border-border/50">
        <div className="w-full max-w-sm mx-auto px-6 sm:px-8 lg:px-0">
          {/* Mobile header */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <Logo className="w-10 h-10" />
            <span className="text-lg font-semibold text-foreground">SpeakBoard</span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'signin' && 'SpeakBoard'}
              {mode === 'signup' && 'Criar Conta'}
              {mode === 'reset' && 'Recuperar Senha'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'signin' && (
                <>Bem-vindo de volta! <span className="text-muted-foreground/70">Acesse sua conta agora, é rápido e leva menos de 1 minuto.</span></>
              )}
              {mode === 'signup' && 'Preencha seus dados para começar.'}
              {mode === 'reset' && 'Digite seu email para receber o link de recuperação.'}
            </p>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground text-sm font-medium">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="h-11 bg-muted/50 border-border" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="h-11 bg-muted/50 border-border pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

              <Button type="submit" className="w-full h-11 font-medium" disabled={loading || !validateEmail(email)}>
                {loading ? 'Entrando...' : 'Login Now'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => switchMode('reset')} className="text-muted-foreground hover:text-foreground transition-colors">
                  Esqueceu a senha? <span className="text-primary font-medium hover:underline">Clique aqui</span>
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-primary hover:underline font-medium">Criar conta</button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-foreground text-sm font-medium">Email</Label>
                <Input id="signup-email" type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="h-11 bg-muted/50 border-border" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-foreground text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="h-11 bg-muted/50 border-border pr-10" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-foreground text-sm font-medium">Confirmar Senha</Label>
                <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="Confirme sua senha" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 bg-muted/50 border-border" required />
              </div>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              {success && <Alert className="border-success bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-success">{success}</AlertDescription></Alert>}

              <Button type="submit" className="w-full h-11 font-medium" disabled={loading || !validateEmail(email) || password.length < 6}>
                {loading ? 'Cadastrando...' : 'Criar Conta'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-primary hover:underline font-medium">Entrar</button>
              </p>
            </form>
          )}

          {/* Reset Form */}
          {mode === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-foreground text-sm font-medium">Email</Label>
                <Input id="reset-email" type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="h-11 bg-muted/50 border-border" required />
              </div>

              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              {success && <Alert className="border-success bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-success">{success}</AlertDescription></Alert>}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => switchMode('signin')} className="flex-1 h-11">Voltar</Button>
                <Button type="submit" className="flex-1 h-11" disabled={loading || !validateEmail(email)}>
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
