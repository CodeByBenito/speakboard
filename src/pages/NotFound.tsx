import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden select-none">
      {/* Decorative Neon Orange glows */}
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-fade-in" />
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none animate-fade-in" />

      <div className="w-full max-w-md relative z-10 glass-panel rounded-3xl p-8 sm:p-10 border-border/40 text-center animate-slide-in-up">
        {/* Logo and Icon header */}
        <div className="flex justify-center mb-6">
          <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-soft animate-glow-pulse">
            <Logo className="w-10 h-10" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl font-black bg-gradient-primary bg-clip-text text-transparent leading-none select-none tracking-tight">
          404
        </h1>
        
        <h2 className="text-xl font-bold text-foreground mt-4 flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Página não encontrada
        </h2>
        
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
          Ops! O endereço que você tentou acessar não existe ou foi removido definitivamente do sistema.
        </p>

        {/* Return Button */}
        <div className="mt-8">
          <Button
            onClick={() => navigate("/")}
            variant="gradient"
            className="w-full h-11 font-bold rounded-xl text-xs py-4 flex items-center justify-center shadow-soft hover:shadow-medium hover-lift"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar para o Painel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
