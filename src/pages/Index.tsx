import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

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
      <div className="flex justify-between items-center p-4 bg-card/50 backdrop-blur-sm border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Controller Dashboard
          </h1>
          {isAdmin && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">Admin</span>
            </div>
          )}
        </div>
        <Button onClick={handleSignOut} variant="ghost" size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
      
      {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
};

export default Index;
