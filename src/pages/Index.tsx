import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import {
  LogOut,
  Shield,
  User,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  Library,
  Users2,
  Menu,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { GeneralDashboard } from "@/components/dashboard/GeneralDashboard";
import { StudentsProgressView } from "@/components/students/StudentsProgressView";
import { ContentLibrary } from "@/components/library/ContentLibrary";
import { TeacherWorkload } from "@/components/team/TeacherWorkload";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";
import { UserProfile } from "@/components/profile/UserProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ViewKey = 'dashboard' | 'students_progress' | 'finance' | 'library' | 'profile' | 'team' | 'admin';

const Index = () => {
  const { user, signOut } = useAuth();
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

  // 4 Pilares Centrais
  const primaryNavItems: { key: ViewKey; label: string; icon: JSX.Element; badge?: string }[] = [
    { key: 'dashboard', label: 'Painel & Aulas', icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: 'students_progress', label: 'Alunos & Progresso', icon: <GraduationCap className="w-5 h-5" /> },
    { key: 'finance', label: 'Financeiro', icon: <DollarSign className="w-5 h-5" /> },
    { key: 'library', label: 'Biblioteca', icon: <Library className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col items-center justify-between py-6 w-20 border-r border-border/40 bg-card/60 backdrop-blur-xl h-screen sticky top-0 z-40">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo Brand */}
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center justify-center p-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-soft hover:scale-105 transition-all"
            title="SpeakBoard Home"
          >
            <Logo className="w-8 h-8" />
          </button>

          {/* Core Navigation Items */}
          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {primaryNavItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={cn(
                  "p-3 rounded-2xl transition-all duration-300 relative group flex items-center justify-center",
                  activeView === item.key
                    ? "bg-primary text-white shadow-soft scale-110"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                title={item.label}
              >
                {item.icon}
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-card pointer-events-none z-50 border border-border/40">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Actions */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={cn(
                "p-3 rounded-2xl transition-all duration-300 relative group flex items-center justify-center",
                activeView === 'admin'
                  ? "bg-primary text-white shadow-soft scale-110"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              title="Painel Admin"
            >
              <Shield className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-card pointer-events-none z-50 border border-border/40">
                Administração
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveView('profile')}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300 relative group flex items-center justify-center",
              activeView === 'profile'
                ? "bg-primary text-white shadow-soft scale-110"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            title="Meu Perfil"
          >
            <User className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-card pointer-events-none z-50 border border-border/40">
              Meu Perfil
            </span>
          </button>

          <button
            onClick={handleSignOut}
            className="p-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group relative"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-destructive text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-card pointer-events-none z-50">
              Sair
            </span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-6 overflow-x-hidden">
        {/* Top Header - Unified */}
        <header className="h-16 border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center justify-center p-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <Logo className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm md:text-base tracking-tight text-foreground">
              {activeView === 'dashboard' && 'Painel & Aulas'}
              {activeView === 'students_progress' && 'Alunos & Progresso'}
              {activeView === 'finance' && 'Financeiro & Cobrança'}
              {activeView === 'library' && 'Biblioteca de Conteúdos'}
              {activeView === 'profile' && 'Perfil do Professor'}
              {activeView === 'admin' && 'Administração'}
              {activeView === 'team' && 'Equipe Docente'}
            </span>
          </div>

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2.5 py-1.5 h-auto rounded-xl hover:bg-muted/50">
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user?.email?.slice(0, 2).toUpperCase() || 'SB'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground hidden sm:inline max-w-[140px] truncate">
                    {user?.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border border-border/40 shadow-card">
                <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground px-2 py-1.5">
                  Minha Conta
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setActiveView('profile')}
                  className="rounded-xl text-xs font-semibold cursor-pointer gap-2 py-2"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Perfil &amp; Configurações
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setActiveView('team')}
                      className="rounded-xl text-xs font-semibold cursor-pointer gap-2 py-2"
                    >
                      <Users2 className="w-4 h-4 text-muted-foreground" />
                      Carga Horária da Equipe
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveView('admin')}
                      className="rounded-xl text-xs font-semibold cursor-pointer gap-2 py-2"
                    >
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      Painel Admin
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="rounded-xl text-xs font-semibold cursor-pointer gap-2 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da Plataforma
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Content View */}
        <main className="flex-1">
          {activeView === 'dashboard' && <GeneralDashboard />}
          {activeView === 'students_progress' && <StudentsProgressView />}
          {activeView === 'finance' && <FinancialDashboard />}
          {activeView === 'library' && <ContentLibrary />}
          {activeView === 'profile' && <UserProfile />}
          {activeView === 'team' && isAdmin && <TeacherWorkload />}
          {activeView === 'admin' && isAdmin && <AdminDashboard />}
        </main>
      </div>

      {/* Floating Bottom Bar - Mobile */}
      <nav className="md:hidden fixed bottom-3 left-4 right-4 h-16 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-elegant flex items-center justify-around px-2 z-50">
        {primaryNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={cn(
              "flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200",
              activeView === item.key
                ? "text-primary scale-110 font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium leading-none">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Index;
