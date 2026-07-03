import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/ui/logo";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have the recovery token
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');
    
    if (type !== 'recovery' || !accessToken) {
      setError("Link de recuperação inválido ou expirado.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Senha redefinida com sucesso!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative Orange Glow ambient spots */}
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-fade-in" />
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-fade-in" />

      <Card className="w-full max-w-md relative z-10 glass-panel shadow-elegant border-border/40 rounded-3xl animate-slide-in-up">
        <CardHeader className="space-y-4 text-center pb-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-soft">
              <Logo className="w-12 h-12" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-black bg-gradient-primary bg-clip-text text-transparent tracking-tight">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1.5 uppercase font-bold tracking-wider">
              Digite sua nova senha abaixo
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && !success && (
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/20 text-destructive rounded-xl animate-fade-in">
              <AlertDescription className="text-xs font-medium leading-relaxed">{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center space-y-4 py-6 animate-scale-in">
              <CheckCircle className="w-16 h-16 text-success mx-auto animate-glow-pulse rounded-full" />
              <div>
                <h3 className="text-lg font-bold text-success">Senha redefinida!</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Redirecionando para a tela de login...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider" htmlFor="password">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider" htmlFor="confirmPassword">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-muted/20 border-border/40 focus-visible:ring-primary/25 rounded-xl"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 font-bold rounded-xl text-xs py-4 shadow-soft hover:shadow-medium hover-lift mt-2"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full h-11 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/auth")}
              >
                Voltar ao Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
