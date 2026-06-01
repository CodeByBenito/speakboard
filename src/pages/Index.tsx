import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { LogOut, Shield, User, Users, DollarSign } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { UserProfile } from "@/components/profile/UserProfile";
import { toast } from "sonner";

const Index = () => {
  const { signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'students' | 'finance' | 'profile' | 'admin'>('students');

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

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col items-center justify-between py-6 w-20 border-r border-border/50 bg-card/40 backdrop-blur-xl h-screen sticky top-0 z-40">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-soft">
            <Logo className="w-9 h-9" />
          </div>
          
          <nav className="flex flex-col items-center gap-4 w-full px-2">
            <button
              onClick={() => setActiveView('students')}
              className={`p-3 rounded-xl transition-all duration-300 relative group ${
                activeView === 'students'
                  ? 'bg-primary text-white shadow-soft scale-110'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title="CRM de Alunos"
            >
              <Users className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft pointer-events-none z-50">
                Alunos
              </span>
            </button>

            <button
              onClick={() => setActiveView('finance')}
              className={`p-3 rounded-xl transition-all duration-300 relative group ${
                activeView === 'finance'
                  ? 'bg-primary text-white shadow-soft scale-110'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title="Controle Financeiro"
            >
              <DollarSign className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft pointer-events-none z-50">
                Financeiro
              </span>
            </button>

            <button
              onClick={() => setActiveView('profile')}
              className={`p-3 rounded-xl transition-all duration-300 relative group ${
                activeView === 'profile'
                  ? 'bg-primary text-white shadow-soft scale-110'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title="Meu Perfil"
            >
              <User className="w-5 h-5" />
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft pointer-events-none z-50">
                Perfil
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveView('admin')}
                className={`p-3 rounded-xl transition-all duration-300 relative group ${
                  activeView === 'admin'
                    ? 'bg-primary text-white shadow-soft scale-110'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title="Administração"
              >
                <Shield className="w-5 h-5" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft pointer-events-none z-50">
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>

        <button
          onClick={handleSignOut}
          className="p-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group relative"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-destructive text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft pointer-events-none z-50">
            Sair
          </span>
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0 overflow-x-hidden">
        {/* Render View */}
        <div className="flex-1">
          {activeView === 'students' && <StudentDashboard />}
          {activeView === 'finance' && <FinancialDashboard />}
          {activeView === 'profile' && <UserProfile />}
          {activeView === 'admin' && isAdmin && <AdminDashboard />}
        </div>
      </div>

      {/* Bottom Bar - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/85 backdrop-blur-xl border-t border-border/50 flex items-center justify-around px-4 z-40">
        <button
          onClick={() => setActiveView('students')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeView === 'students' ? 'text-primary scale-110' : 'text-muted-foreground'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Alunos</span>
        </button>
        <button
          onClick={() => setActiveView('finance')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeView === 'finance' ? 'text-primary scale-110' : 'text-muted-foreground'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Financeiro</span>
        </button>
        <button
          onClick={() => setActiveView('profile')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeView === 'profile' ? 'text-primary scale-110' : 'text-muted-foreground'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Perfil</span>
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveView('admin')}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
              activeView === 'admin' ? 'text-primary scale-110' : 'text-muted-foreground'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Admin</span>
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-muted-foreground active:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default Index;
