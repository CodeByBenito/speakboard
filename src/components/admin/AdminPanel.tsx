import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { UserPlus, Shield } from 'lucide-react';

export const AdminPanel = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { promoteToAdmin } = useUserRole();

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    
    try {
      const { success, error } = await promoteToAdmin(email.trim());
      
      if (success) {
        toast.success(`Usuário ${email} promovido a administrador com sucesso!`);
        setEmail('');
      } else {
        toast.error(error || 'Erro ao promover usuário. Verifique se o email está correto.');
      }
    } catch (error) {
      toast.error('Erro inesperado ao promover usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b bg-card/30">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            Painel Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromoteUser} className="space-y-4">
            <div>
              <Label htmlFor="email">Promover usuário a administrador</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite o email do usuário que você deseja promover a administrador
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Promovendo...' : 'Promover a Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};