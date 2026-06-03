import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';
import { 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Users, 
  DollarSign, 
  FileText, 
  Sparkles, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

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
        toast({ title: "Login realizado!", description: "Bem-vindo de volta ao SpeakBoard." });
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
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email na caixa de entrada antes de fazer login.');
        } else {
          setError(error.message || 'Erro ao fazer login. Tente novamente.');
        }
      }
    } catch { 
      setError('Erro inesperado ao conectar ao servidor. Tente novamente.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
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
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/email-confirmation` }
      });
      if (error) {
        setError(error.message.includes('User already registered') 
          ? 'Este email já está cadastrado em nossa base.' 
          : error.message || 'Erro ao cadastrar. Tente novamente.');
      } else {
        setSuccess('Cadastro realizado! Enviamos um link de confirmação para o seu email.');
        setEmail(''); setPassword(''); setConfirmPassword('');
        toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar a conta." });
      }
    } catch { 
      setError('Erro inesperado no cadastro. Tente novamente.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    if (!validateEmail(email)) { 
      setError('Por favor, insira um endereço de email válido.'); 
      setLoading(false); 
      return; 
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        setError(error.message || 'Erro ao enviar link de recuperação. Tente novamente.');
      } else {
        setSuccess('Link de recuperação enviado com sucesso!');
        toast({ title: "Link enviado!", description: "Verifique seu email para redefinir sua senha." });
        setTimeout(() => setMode('signin'), 4000);
      }
    } catch { 
      setError('Erro inesperado ao solicitar recuperação. Tente novamente.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const clearForm = () => { setEmail(''); setPassword(''); setConfirmPassword(''); setError(null); setSuccess(null); };
  const switchMode = (newMode: AuthMode) => { clearForm(); setMode(newMode); };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Glowing Pitch Black / SaaS Showcase */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-neutral-950 via-zinc-900 to-black select-none">
        
        {/* Glow Effects */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.02]" />

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo & Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Logo className="w-9 h-9" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SpeakBoard</span>
            <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20 text-primary rounded-full ml-1.5 font-bold uppercase tracking-wider py-0.5">
              SaaS v1.1
            </Badge>
          </div>

          {/* Core Feature Showcase */}
          <div className="max-w-md my-auto space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
                Ensine com maestria.<br />
                Gerencie com <span className="bg-gradient-primary bg-clip-text text-transparent">precisão</span>.
              </h1>
              <p className="text-white/60 text-sm leading-relaxed">
                A plataforma SaaS completa projetada exclusivamente para professores e escolas de idiomas de alto desempenho.
              </p>
            </div>

            {/* Feature Badges stack */}
            <div className="space-y-4 pt-4">
              
              {/* Feature 1 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md hover:border-primary/25 transition-all duration-300">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">CRM de Alunos</h3>
                  <p className="text-xs text-white/50 mt-1 leading-normal">
                    Fichas pedagógicas detalhadas, metas de ensino, contatos e progresso individual centralizados.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md hover:border-primary/25 transition-all duration-300">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gestão Financeira</h3>
                  <p className="text-xs text-white/50 mt-1 leading-normal">
                    Controle de pagamentos pendentes, vencimentos e relatórios de fluxo de caixa em poucos cliques.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md hover:border-primary/25 transition-all duration-300">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Acompanhamento Pedagógico</h3>
                  <p className="text-xs text-white/50 mt-1 leading-normal">
                    Registre relatórios de progresso das aulas e envie feedbacks profissionais que encantam seus alunos.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer branding */}
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>© {new Date().getFullYear()} SpeakBoard Corp.</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-primary" /> Premium Web System</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Premium Minimalist Form */}
      <div className="flex-1 lg:flex-none lg:w-[480px] xl:w-[520px] flex flex-col justify-center bg-background min-h-screen lg:min-h-0 border-l border-border/40 p-6 sm:p-12 relative overflow-hidden">
        
        {/* Decorative elements for mobile screens */}
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-primary/5 blur-3xl lg:hidden pointer-events-none" />

        <div className="w-full max-w-sm mx-auto space-y-8 z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="flex items-center gap-3 lg:hidden mb-4">
            <div className="p-1.5 bg-primary/10 rounded-xl border border-primary/20">
              <Logo className="w-8 h-8" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">SpeakBoard</span>
          </div>

          {/* Title Stack */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              {mode === 'signin' && 'Acessar Plataforma'}
              {mode === 'signup' && 'Criar Conta Grátis'}
              {mode === 'reset' && 'Recuperar Senha'}
            </h2>
            <p className="text-xs text-muted-foreground leading-normal">
              {mode === 'signin' && 'Bem-vindo de volta! Insira suas credenciais abaixo para entrar.'}
              {mode === 'signup' && 'Comece a gerenciar seus alunos como um profissional hoje mesmo.'}
              {mode === 'reset' && 'Insira seu email de cadastro para receber o link de redefinição.'}
            </p>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Senha</Label>
                  <button 
                    type="button" 
                    onClick={() => switchMode('reset')} 
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl pr-10" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl animate-fade-in p-3.5">
                  <div className="flex gap-2.5 items-start">
                    <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                    <AlertDescription className="text-xs font-medium leading-relaxed">{error}</AlertDescription>
                  </div>
                </Alert>
              )}

              <Button 
                type="submit" 
                variant="gradient"
                className="w-full h-11 font-bold rounded-xl text-xs py-4 shadow-soft hover:shadow-medium" 
                disabled={loading || !validateEmail(email)}
              >
                {loading ? 'Entrando...' : 'Acessar Painel'} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-4">
                Ainda não tem cadastro?{' '}
                <button 
                  type="button" 
                  onClick={() => switchMode('signup')} 
                  className="text-primary hover:underline font-bold"
                >
                  Criar conta grátis
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Senha</Label>
                <div className="relative">
                  <Input 
                    id="signup-password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Mínimo 6 caracteres" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl pr-10" 
                    required 
                    minLength={6} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirmar Senha</Label>
                <Input 
                  id="confirm-password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirme sua senha" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl" 
                  required 
                />
              </div>

              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl animate-fade-in p-3.5">
                  <div className="flex gap-2.5 items-start">
                    <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                    <AlertDescription className="text-xs font-medium leading-relaxed">{error}</AlertDescription>
                  </div>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-success/20 bg-success/10 text-success rounded-xl animate-fade-in p-3.5">
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle className="h-4.5 w-4.5 text-success flex-shrink-0 mt-0.5" />
                    <AlertDescription className="text-xs font-medium leading-relaxed text-success">{success}</AlertDescription>
                  </div>
                </Alert>
              )}

              <Button 
                type="submit" 
                variant="gradient"
                className="w-full h-11 font-bold rounded-xl text-xs py-4 shadow-soft" 
                disabled={loading || !validateEmail(email) || password.length < 6}
              >
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Já tem uma conta?{' '}
                <button 
                  type="button" 
                  onClick={() => switchMode('signin')} 
                  className="text-primary hover:underline font-bold"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email da Conta</Label>
                <Input 
                  id="reset-email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl" 
                  required 
                />
              </div>

              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl animate-fade-in p-3.5">
                  <div className="flex gap-2.5 items-start">
                    <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                    <AlertDescription className="text-xs font-medium leading-relaxed">{error}</AlertDescription>
                  </div>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-success/20 bg-success/10 text-success rounded-xl animate-fade-in p-3.5">
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle className="h-4.5 w-4.5 text-success flex-shrink-0 mt-0.5" />
                    <AlertDescription className="text-xs font-medium leading-relaxed text-success">{success}</AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => switchMode('signin')} 
                  className="flex-1 h-11 rounded-xl text-xs py-4"
                >
                  Voltar
                </Button>
                <Button 
                  type="submit" 
                  variant="gradient"
                  className="flex-1 h-11 rounded-xl text-xs py-4 shadow-soft" 
                  disabled={loading || !validateEmail(email)}
                >
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
