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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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

const VIEW_TITLES: Record<ViewKey, string> = {
  dashboard: 'Painel & Aulas',
  students_progress: 'Alunos & Progresso',
  finance: 'Financeiro & Cobrança',
  library: 'Biblioteca de Conteúdos',
  profile: 'Perfil do Professor',
  admin: 'Administração',
  team: 'Equipe Docente',
};

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
  const primaryNavItems: { key: ViewKey; label: string; icon: JSX.Element }[] = [
    { key: 'dashboard', label: 'Painel & Aulas', icon: <LayoutDashboard /> },
    { key: 'students_progress', label: 'Alunos & Progresso', icon: <GraduationCap /> },
    { key: 'finance', label: 'Financeiro', icon: <DollarSign /> },
    { key: 'library', label: 'Biblioteca', icon: <Library /> },
  ];

  return (
    <SidebarProvider>
      {/* Left Sidebar - Desktop, collapsible via SidebarTrigger */}
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="px-2 py-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 px-1 rounded-xl hover:opacity-90 transition-opacity group-data-[collapsible=icon]:justify-center"
            title="SpeakBoard Home"
          >
            <Logo className="w-9 h-9 shrink-0" />
            <span className="font-black text-base tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              SpeakBoard
            </span>
          </button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {primaryNavItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activeView === item.key}
                    tooltip={item.label}
                    onClick={() => setActiveView(item.key)}
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:font-semibold"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === 'admin'}
                  tooltip="Administração"
                  onClick={() => setActiveView('admin')}
                  className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:font-semibold"
                >
                  <Shield />
                  <span>Administração</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeView === 'profile'}
                tooltip="Meu Perfil"
                onClick={() => setActiveView('profile')}
                className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:font-semibold"
              >
                <User />
                <span>Meu Perfil</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sair"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Container */}
      <SidebarInset className="pb-20 md:pb-0">
        {/* Top Header - Unified */}
        <header className="h-16 border-b border-border/60 bg-card/60 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <SidebarTrigger className="hidden md:flex text-muted-foreground hover:text-foreground" />
            <div className="md:hidden flex items-center justify-center p-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <Logo className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm md:text-base tracking-tight text-foreground">
              {VIEW_TITLES[activeView]}
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
        <div className="flex-1">
          {activeView === 'dashboard' && <GeneralDashboard />}
          {activeView === 'students_progress' && <StudentsProgressView />}
          {activeView === 'finance' && <FinancialDashboard />}
          {activeView === 'library' && <ContentLibrary />}
          {activeView === 'profile' && <UserProfile />}
          {activeView === 'team' && isAdmin && <TeacherWorkload />}
          {activeView === 'admin' && isAdmin && <AdminDashboard />}
        </div>
      </SidebarInset>

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
    </SidebarProvider>
  );
};

export default Index;
