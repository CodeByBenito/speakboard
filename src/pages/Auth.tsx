import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';
import { Mail, Lock, User, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao SpeakBoard.",
        });
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login.');
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
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
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
        } else {
          setError(error.message);
        }
      } else {
        setSuccess('Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
    } catch (err) {
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
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Link de recuperação enviado! Verifique seu email.');
        toast({
          title: "Link enviado!",
          description: "Verifique seu email para redefinir sua senha.",
        });
        setTimeout(() => setResetMode(false), 3000);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4 overflow-y-auto">
      {/* Modern dark background with red accents - FIAP inspired */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo className="w-20 h-20" />
          </div>
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SpeakBoard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Learn English Platform</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Shield className="w-3 h-3 mr-1" />
            Sistema Seguro
          </Badge>
        </div>

        <Card className="shadow-elegant bg-card/95 backdrop-blur-sm border border-border/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">
              {resetMode ? 'Recuperar Senha' : 'Acesse sua Conta'}
            </CardTitle>
            <CardDescription className="text-center text-sm">
              {resetMode 
                ? 'Digite seu email para receber o link de recuperação'
                : 'Faça login ou crie sua conta para continuar'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-4 max-h-[70vh] overflow-y-auto">
            {!resetMode ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="signin" className="flex items-center gap-2 text-xs sm:text-sm">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Entrar</span>
                    <span className="sm:hidden">Login</span>
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2 text-xs sm:text-sm">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Cadastrar</span>
                    <span className="sm:hidden">Registro</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setResetMode(true)}
                        className="text-xs sm:text-sm text-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-sm" 
                      disabled={loading || !validateEmail(email)}
                      size="default"
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Crie uma senha (min. 6 caracteres)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 text-sm"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 text-sm"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="border-success bg-success/10 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <AlertDescription className="text-success text-xs sm:text-sm">{success}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-success hover:opacity-90 transition-opacity text-sm" 
                      disabled={loading || !validateEmail(email) || password.length < 6}
                      size="default"
                    >
                      {loading ? 'Cadastrando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-success bg-success/10 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success text-xs sm:text-sm">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setResetMode(false)}
                    className="flex-1 text-sm"
                    size="default"
                  >
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-warning hover:opacity-90 transition-opacity text-sm" 
                    disabled={loading || !validateEmail(email)}
                    size="default"
                  >
                    {loading ? 'Enviando...' : 'Enviar Link'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Sistema seguro com autenticação por email
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-success" />
              Dados protegidos
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-primary" />
              Criptografia SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;