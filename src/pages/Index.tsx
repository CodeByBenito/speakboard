import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { LogOut, Shield, User, Users, DollarSign, BookOpen, LayoutDashboard, ClipboardList, Library, Users2 } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { GeneralDashboard } from "@/components/dashboard/GeneralDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ProgressGuide } from "@/components/progress/ProgressGuide";
import { ClassBoard } from "@/components/board/ClassBoard";
import { ContentLibrary } from "@/components/library/ContentLibrary";
import { TeacherWorkload } from "@/components/team/TeacherWorkload";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { UserProfile } from "@/components/profile/UserProfile";
import { toast } from "sonner";

type ViewKey = 'dashboard' | 'students' | 'progress' | 'board' | 'library' | 'finance' | 'profile' | 'team' | 'admin';

const Index = () => {
  const { signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');

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

  const navItems: { key: ViewKey; label: string; icon: JSX.Element }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: 'students', label: 'Alunos', icon: <Users className="w-5 h-5" /> },
    { key: 'progress', label: 'Progresso', icon: <BookOpen className="w-5 h-5" /> },
    { key: 'board', label: 'Aulas', icon: <ClipboardList className="w-5 h-5" /> },
    { key: 'library', label: 'Biblioteca', icon: <Library className="w-5 h-5" /> },
    { key: 'finance', label: 'Financeiro', icon: <DollarSign className="w-5 h-5" /> },
    { key: 'profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
  ];

  const adminItems: { key: ViewKey; label: string; icon: JSX.Element }[] = [
    { key: 'team', label: 'Equipe', icon: <Users2 className="w-5 h-5" /> },
    { key: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col items-center justify-between py-6 w-20 border-r border-border/50 bg-card/40 backdrop-blur-xl h-screen sticky top-0 z-40">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-soft">
            <Logo className="w-9 h-9" />
          </div>

          <nav className="flex flex-col items-center gap-4 w-full px-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`p-3 rounded-xl transition-all duration-300 relative group ${
                  activeView === item.key
                    ? 'bg-primary text-white shadow-soft scale-110'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft pointer-events-none z-50">
                  {item.label}
                </span>
              </button>
            ))}

            {isAdmin && adminItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`p-3 rounded-xl transition-all duration-300 relative group ${
                  activeView === item.key
                    ? 'bg-primary text-white shadow-soft scale-110'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-soft pointer-events-none z-50">
                  {item.label}
                </span>
              </button>
            ))}
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
        <div className="flex-1">
          {activeView === 'dashboard' && <GeneralDashboard />}
          {activeView === 'students' && <StudentDashboard />}
          {activeView === 'progress' && <ProgressGuide />}
          {activeView === 'board' && <ClassBoard />}
          {activeView === 'library' && <ContentLibrary />}
          {activeView === 'finance' && <FinancialDashboard />}
          {activeView === 'profile' && <UserProfile />}
          {activeView === 'team' && isAdmin && <TeacherWorkload />}
          {activeView === 'admin' && isAdmin && <AdminDashboard />}
        </div>
      </div>

      {/* Bottom Bar - Mobile (scrollable) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/85 backdrop-blur-xl border-t border-border/50 flex items-center gap-1 px-2 z-40 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`flex flex-col items-center justify-center w-14 h-12 shrink-0 rounded-xl transition-all ${
              activeView === item.key ? 'text-primary scale-110' : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
        {isAdmin && adminItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`flex flex-col items-center justify-center w-14 h-12 shrink-0 rounded-xl transition-all ${
              activeView === item.key ? 'text-primary scale-110' : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center w-14 h-12 shrink-0 rounded-xl text-muted-foreground active:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default Index;
