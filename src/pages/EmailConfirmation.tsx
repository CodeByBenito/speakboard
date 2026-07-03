import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Home, MailOpen } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const EmailConfirmation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setError('Link de confirmação inválido ou expirado');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess(true);
        }
      } catch (err) {
        setError('Erro ao confirmar email');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Decorative Orange Glow ambient spots */}
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-fade-in" />
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-fade-in" />
      
      <Card className="w-full max-w-md relative z-10 glass-panel shadow-elegant border-border/40 rounded-3xl animate-slide-in-up">
        <CardHeader className="text-center pb-4 space-y-3">
          <div className="mx-auto flex justify-center">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-soft animate-glow-pulse">
              <Logo className="w-10 h-10" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-black bg-gradient-primary bg-clip-text text-transparent tracking-tight">
              SpeakBoard
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1.5 uppercase font-bold tracking-wider">
              Confirmação de Conta
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-xs font-semibold text-muted-foreground">Validando seu link de confirmação...</p>
            </div>
          )}

          {success && (
            <div className="space-y-5 py-2 animate-scale-in">
              <Alert className="border-success/20 bg-success/10 text-success rounded-xl p-3.5">
                <div className="flex gap-2.5 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <AlertDescription className="text-xs font-medium leading-relaxed text-success">
                    Seu endereço de e-mail foi verificado com sucesso! Sua conta agora está ativa e pronta para uso.
                  </AlertDescription>
                </div>
              </Alert>
              
              <Button 
                onClick={handleGoHome}
                variant="gradient"
                className="w-full h-11 rounded-xl text-xs py-4 font-bold shadow-soft hover-lift"
              >
                <Home className="w-4 h-4 mr-2" />
                Acessar Plataforma
              </Button>
            </div>
          )}

          {error && (
            <div className="space-y-5 py-2 animate-scale-in">
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl p-3.5">
                <div className="flex gap-2.5 items-start">
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <AlertDescription className="text-xs font-medium leading-relaxed">
                    {error}
                  </AlertDescription>
                </div>
              </Alert>
              
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="w-full h-11 rounded-xl text-xs py-4 border-primary/20 hover:bg-primary/5 hover:text-primary hover-lift"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;