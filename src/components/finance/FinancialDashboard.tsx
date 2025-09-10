import { useState, useEffect } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Calendar,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FinancialDashboard = () => {
  const { students, loading } = useStudents();
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    paidStudents: 0,
    pendingPayments: 0,
    overdue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    if (students.length > 0) {
      calculateFinancialStats();
    }
  }, [students]);

  const calculateFinancialStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalRevenue = 0;
    let paidStudents = 0;
    let pendingPayments = 0;
    let overdue = 0;
    let monthlyRevenue = 0;

    students.forEach(student => {
      const amount = student.paymentAmount || 0;
      totalRevenue += amount;

      if (student.paymentStatus === 'paid') {
        paidStudents++;
        // Check if payment was this month
        if (student.lastPaymentDate) {
          const paymentDate = new Date(student.lastPaymentDate);
          if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
            monthlyRevenue += amount;
          }
        }
      } else if (student.paymentStatus === 'pending') {
        pendingPayments++;
      } else if (student.paymentStatus === 'overdue') {
        overdue++;
      }
    });

    setFinancialStats({
      totalRevenue,
      paidStudents,
      pendingPayments,
      overdue,
      monthlyRevenue
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-success text-success-foreground">Pago</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const paymentProgress = students.length > 0 ? (financialStats.paidStudents / students.length) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Controle Financeiro
          </h2>
          <p className="text-muted-foreground mt-2">
            Gerencie os pagamentos e acompanhe sua receita
          </p>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-soft shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {financialStats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total estimado
            </p>
          </CardContent>
        </Card>

        <Card className="border-soft shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {financialStats.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recebido neste mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-soft shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos em Dia</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {financialStats.paidStudents}
            </div>
            <Progress value={paymentProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {paymentProgress.toFixed(1)}% dos alunos
            </p>
          </CardContent>
        </Card>

        <Card className="border-soft shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {financialStats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialStats.pendingPayments} pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students Payment List */}
      <Card className="border-soft shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status de Pagamentos por Aluno
          </CardTitle>
          <CardDescription>
            Acompanhe o status de pagamento de cada aluno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum aluno cadastrado ainda
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-soft rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.contact}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        R$ {(student.paymentAmount || 0).toFixed(2)}
                      </div>
                      {student.paymentDueDate && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Venc: {format(new Date(student.paymentDueDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      )}
                      {student.lastPaymentDate && student.paymentStatus === 'paid' && (
                        <div className="text-sm text-success flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Pago em: {format(new Date(student.lastPaymentDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      )}
                    </div>
                    {getStatusBadge(student.paymentStatus || 'pending')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};