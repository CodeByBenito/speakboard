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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant border-border/50">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo className="w-16 h-16" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Digite sua nova senha abaixo
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && !success && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center space-y-4 py-6">
              <CheckCircle className="w-16 h-16 text-success mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-success">Senha redefinida!</h3>
                <p className="text-muted-foreground mt-2">
                  Redirecionando para o login...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-soft"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
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
