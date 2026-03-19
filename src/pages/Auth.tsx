import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';
import { AlertCircle, CheckCircle, Eye, EyeOff, BookOpen, Users, BarChart3 } from 'lucide-react';
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
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!validateEmail(email)) { setError('Por favor, insira um email válido.'); setLoading(false); return; }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) { setError('Erro ao enviar link. Tente novamente.'); }
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

  const features = [
    { icon: Users, title: 'Gestão de Alunos', desc: 'Organize e acompanhe todos os seus alunos em um só lugar' },
    { icon: BookOpen, title: 'Controle de Aulas', desc: 'Registre aulas, tópicos e evolução de cada estudante' },
    { icon: BarChart3, title: 'Financeiro Integrado', desc: 'Controle de pagamentos, receitas e inadimplência' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Hero/Marketing */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img src={authBackground} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,25%,8%)] via-[hsl(215,25%,8%)/0.85] to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 max-w-xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Logo className="w-11 h-11" />
              <span className="text-2xl font-bold text-white tracking-tight">SpeakBoard</span>
            </div>
            <p className="text-sm text-[hsl(210,15%,70%)]">CRM Educacional para Professores de Inglês</p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                Gerencie suas aulas <br />
                <span className="bg-gradient-to-r from-[hsl(210,78%,55%)] to-[hsl(168,55%,48%)] bg-clip-text text-transparent">
                  de forma inteligente
                </span>
              </h2>
              <p className="text-[hsl(210,15%,65%)] mt-4 text-base leading-relaxed">
                A plataforma completa para professores de inglês organizarem alunos, aulas e finanças em um único painel.
              </p>
            </div>

            <div className="space-y-5">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(210,78%,46%)/0.15] border border-[hsl(210,78%,46%)/0.3] flex items-center justify-center flex-shrink-0">
                    <feat.icon className="w-5 h-5 text-[hsl(195,85%,55%)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{feat.title}</h3>
                    <p className="text-[hsl(210,15%,58%)] text-sm">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[hsl(210,15%,45%)]">
            © 2026 SpeakBoard · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[440px] xl:w-[480px] bg-card flex flex-col justify-center p-8 lg:p-12 min-h-screen lg:min-h-0 border-l border-border/50">
        <div className="max-w-sm mx-auto w-full">
          {/* Mobile Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-semibold text-foreground">SpeakBoard</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {mode === 'signin' && 'Bem-vindo de volta'}
              {mode === 'signup' && 'Crie sua conta'}
              {mode === 'reset' && 'Recuperar senha'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'signin' && 'Entre para acessar seu painel de gestão'}
              {mode === 'signup' && 'Comece a gerenciar seus alunos agora'}
              {mode === 'reset' && 'Digite seu email para receber o link'}
            </p>
          </div>

          {/* Sign In */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="bg-background border-border h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-sm">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="bg-background border-border pr-10 h-11" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => switchMode('reset')} className="text-sm text-primary hover:underline">
                  Esqueci minha senha
                </button>
              </div>
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-medium" disabled={loading || !validateEmail(email)}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-primary hover:underline font-medium">Criar conta</button>
              </p>
            </form>
          )}

          {/* Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground text-sm">Email</Label>
                <Input id="signup-email" type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="bg-background border-border h-11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground text-sm">Senha</Label>
                <div className="relative">
                  <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="bg-background border-border pr-10 h-11" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground text-sm">Confirmar Senha</Label>
                <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="Confirme sua senha" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} className="bg-background border-border h-11" required />
              </div>
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              {success && <Alert className="border-success bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-success">{success}</AlertDescription></Alert>}
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 font-medium" disabled={loading || !validateEmail(email) || password.length < 6}>
                {loading ? 'Cadastrando...' : 'Criar Conta'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-primary hover:underline font-medium">Entrar</button>
              </p>
            </form>
          )}

          {/* Reset */}
          {mode === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground text-sm">Email</Label>
                <Input id="reset-email" type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="bg-background border-border h-11" required />
              </div>
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              {success && <Alert className="border-success bg-success/10"><CheckCircle className="h-4 w-4 text-success" /><AlertDescription className="text-success">{success}</AlertDescription></Alert>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => switchMode('signin')} className="flex-1 h-11">Voltar</Button>
                <Button type="submit" className="flex-1 h-11 bg-primary hover:bg-primary/90" disabled={loading || !validateEmail(email)}>
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-muted-foreground text-center mt-8">
            Powered by <span className="font-medium text-foreground">SpeakBoard</span> · CRM Educacional
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
