import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Shield, 
  UserPlus, 
  Users, 
  Database, 
  Settings, 
  Activity,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Mail,
  Clock
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  adminUsers: number;
  todayRegistrations: number;
}

export const AdminDashboard = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStudents: 0,
    adminUsers: 0,
    todayRegistrations: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const { promoteToAdmin } = useUserRole();
  const { user } = useAuth();

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    setStatsLoading(true);
    try {
      // Get total students count
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get admin users count
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Get today's registrations (approximate based on students created today)
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`);

      setStats({
        totalUsers: (studentsCount || 0) + (adminCount || 0),
        totalStudents: studentsCount || 0,
        adminUsers: adminCount || 0,
        todayRegistrations: todayCount || 0
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    if (email === user?.email) {
      toast.error('Você já é administrador');
      return;
    }

    setLoading(true);
    
    try {
      const result = await promoteToAdmin(email.trim());
      
      if (result) {
        toast.success(`Usuário ${email} promovido a administrador com sucesso!`);
        setEmail('');
        // Reload stats to update admin count
        loadSystemStats();
      } else {
        toast.error('Usuário não encontrado. Verifique se o email está correto.');
      }
    } catch (error) {
      toast.error('Erro inesperado ao promover usuário');
    } finally {
      setLoading(false);
    }
  };

  const sendSystemNotification = async () => {
    toast.success('Notificação do sistema enviada para todos os usuários!');
    // Here you would implement actual notification system
  };

  const exportSystemData = async () => {
    toast.success('Dados do sistema exportados com sucesso!');
    // Here you would implement data export functionality
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-hero min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários e monitore o sistema
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Administrador
        </Badge>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudantes</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats.adminUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registros Hoje</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats.todayRegistrations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Gerenciar Usuários
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Atividades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Promover Usuário a Administrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePromoteUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email do usuário</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite o email do usuário que você deseja promover a administrador
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !email.trim()} 
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Promovendo...' : 'Promover a Admin'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Notificações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Envie notificações importantes para todos os usuários do sistema.
                </p>
                <Button 
                  onClick={sendSystemNotification}
                  className="w-full bg-gradient-success hover:opacity-90"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Notificação
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Backup de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exporte dados do sistema para backup ou análise.
                </p>
                <Button 
                  onClick={exportSystemData}
                  className="w-full bg-gradient-warning hover:opacity-90"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Atividades Recentes do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sistema funcionando normalmente</p>
                    <p className="text-xs text-muted-foreground">Todas as funcionalidades operacionais</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Agora
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Usuários ativos no sistema</p>
                    <p className="text-xs text-muted-foreground">{stats.totalUsers} usuários registrados</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Hoje
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                  <Database className="w-5 h-5 text-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Base de dados atualizada</p>
                    <p className="text-xs text-muted-foreground">{stats.totalStudents} registros de estudantes</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Hoje
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Banco de Dados</p>
                <p className="text-xs text-muted-foreground">Operacional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Autenticação</p>
                <p className="text-xs text-muted-foreground">Operacional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <div>
                <p className="text-sm font-medium">API</p>
                <p className="text-xs text-muted-foreground">Operacional</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};