import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { useSystemStats } from '@/hooks/useSystemStats';
import { toast } from 'sonner';
import {
  Shield,
  UserPlus,
  Users,
  Database,
  TrendingUp,
  Mail,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { promoteToAdmin } = useUserRole();
  const { user } = useAuth();
  const { stats, loading: statsLoading, refreshStats } = useSystemStats();

  useEffect(() => {
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setTimeout(refreshStats, 1000);
      } else {
        toast.error('Usuário não encontrado. Verifique se o email está correto.');
      }
    } catch (error) {
      toast.error('Erro inesperado ao promover usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Painel Administrativo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estatísticas gerais e gestão de administradores.
          </p>
        </div>
        <Button
          onClick={refreshStats}
          variant="outline"
          size="sm"
          disabled={statsLoading}
          className="rounded-xl"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40 bg-card/60 shadow-card">
          <CardContent className="flex items-center p-5 gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total de Usuários</p>
              <p className="text-2xl font-bold text-foreground">
                {statsLoading ? '...' : stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 shadow-card">
          <CardContent className="flex items-center p-5 gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Estudantes</p>
              <p className="text-2xl font-bold text-foreground">
                {statsLoading ? '...' : stats.totalStudents}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 shadow-card">
          <CardContent className="flex items-center p-5 gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Administradores</p>
              <p className="text-2xl font-bold text-foreground">
                {statsLoading ? '...' : stats.adminUsers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 shadow-card">
          <CardContent className="flex items-center p-5 gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Registros Hoje</p>
              <p className="text-2xl font-bold text-foreground">
                {statsLoading ? '...' : stats.todayRegistrations}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promote user to admin */}
      <Card className="border-border/40 bg-card/60 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="w-5 h-5 text-primary" />
            Promover Usuário a Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromoteUser} className="space-y-4 max-w-md">
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
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Promovendo...' : 'Promover a Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
