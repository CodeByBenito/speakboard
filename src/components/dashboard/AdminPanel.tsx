import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

export const AdminPanel = () => {
  const { isAdmin, promoteToAdmin } = useUserRole();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handlePromoteUser = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await promoteToAdmin(email.trim());
      if (result) {
        toast({
          title: "Sucesso",
          description: `Usuário ${email} promovido a administrador com sucesso!`,
        });
        setEmail('');
      } else {
        toast({
          title: "Erro",
          description: "Usuário não encontrado. Verifique se o email está correto.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao promover usuário. Verifique se o email está correto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Painel Administrativo
        </CardTitle>
        <CardDescription>
          Gerenciar usuários e permissões do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Shield className="w-3 h-3 mr-1" />
            Administrador
          </Badge>
          <span className="text-sm text-muted-foreground">
            Você tem acesso total ao sistema
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="promote-email">Promover usuário a administrador</Label>
          <div className="flex gap-2">
            <Input
              id="promote-email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={handlePromoteUser}
              disabled={loading || !email.trim()}
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Promovendo...' : 'Promover'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            O usuário deve ter uma conta registrada no sistema
          </p>
        </div>
      </CardContent>
    </Card>
  );
};