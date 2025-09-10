import { MainTabs } from "@/components/navigation/MainTabs";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  const { signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const handleSignOut = async () => {
    await signOut();
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex justify-between items-center p-4 bg-card/50 backdrop-blur-sm border-b shadow-soft">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            SpeakBoard
          </h1>
          {isAdmin && (
            <div className="flex items-center gap-1 px-3 py-1 bg-gradient-interactive rounded-full shadow-soft">
              <Shield className="w-3 h-3 text-white" />
              <span className="text-xs font-medium text-white">Admin</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={handleSignOut} variant="ghost" size="sm" className="hover:bg-destructive/20 hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
      
      {isAdmin ? <AdminDashboard /> : <MainTabs />}
    </div>
  );
};

export default Index;
