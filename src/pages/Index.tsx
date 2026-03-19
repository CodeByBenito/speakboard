import { MainTabs } from "@/components/navigation/MainTabs";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { LogOut, Shield, User } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";

const Index = () => {
  const { signOut, user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };

  if (roleLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-row justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Logo className="w-9 h-9" />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">
                  SpeakBoard
                </h1>
                <p className="hidden sm:block text-[11px] text-muted-foreground">CRM para Professores de Inglês</p>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-medium text-primary hidden sm:inline">Admin</span>
                </div>
              )}
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName || user?.email} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {profile?.displayName 
                      ? profile.displayName.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || <User className="w-3 h-3" />
                    }
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden md:block max-w-[140px] truncate">
                  {profile?.displayName || user?.email?.split('@')[0] || 'Usuário'}
                </span>
              </div>
              
              <ThemeToggle />
              
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                size="sm" 
                className="hover:bg-destructive/10 hover:text-destructive transition-all text-muted-foreground"
              >
                <LogOut className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto">
        {isAdmin ? <AdminDashboard /> : <MainTabs />}
      </main>
    </div>
  );
};

export default Index;
