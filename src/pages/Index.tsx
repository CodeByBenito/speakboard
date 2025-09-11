import { MainTabs } from "@/components/navigation/MainTabs";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Shield, User } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  const { signOut, user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { profile, loading: profileLoading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  if (roleLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-card/50 backdrop-blur-sm border-b shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
              SpeakBoard
            </h1>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-interactive rounded-full shadow-soft">
              <Shield className="w-3 h-3 text-white" />
              <span className="text-xs font-medium text-white">Admin</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {/* User Profile Avatar */}
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border-2 border-primary/20">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName || user?.email} />
              <AvatarFallback className="bg-gradient-primary text-white text-sm">
                {profile?.displayName 
                  ? profile.displayName.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                }
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground hidden md:block">
              {profile?.displayName || user?.email?.split('@')[0] || 'Usuário'}
            </span>
          </div>
          
          <ThemeToggle />
          
          <Button 
            onClick={handleSignOut} 
            variant="ghost" 
            size="sm" 
            className="hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
      
      {isAdmin ? <AdminDashboard /> : <MainTabs />}
    </div>
  );
};

export default Index;
