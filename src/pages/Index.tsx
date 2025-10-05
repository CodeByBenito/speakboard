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
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-soft">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-row justify-between items-center h-16 lg:h-20 gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 lg:gap-4">
              <Logo className="w-12 h-12 lg:w-14 lg:h-14" />
              <div className="flex flex-col">
                <h1 className="text-lg lg:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-none">
                  SpeakBoard
                </h1>
                <p className="hidden sm:block text-xs text-muted-foreground">English Learning Platform</p>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1 px-2 lg:px-3 py-1 bg-gradient-interactive rounded-full shadow-soft">
                  <Shield className="w-3 h-3 text-white" />
                  <span className="text-xs font-medium text-white hidden sm:inline">Admin</span>
                </div>
              )}
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* User Profile Avatar */}
              <div className="flex items-center gap-2">
                <Avatar className="w-9 h-9 lg:w-10 lg:h-10 border-2 border-primary/30 shadow-soft">
                  <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName || user?.email} />
                  <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                    {profile?.displayName 
                      ? profile.displayName.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                    }
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden md:block max-w-[150px] truncate">
                  {profile?.displayName || user?.email?.split('@')[0] || 'Usuário'}
                </span>
              </div>
              
              <ThemeToggle />
              
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                size="sm" 
                className="hover:bg-destructive/20 hover:text-destructive transition-all"
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
