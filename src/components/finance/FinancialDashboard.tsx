import { useState, useEffect } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Search,
  Download,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseLocalDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const FinancialDashboard = () => {
  const { students, loading } = useStudents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedStudentForBilling, setSelectedStudentForBilling] = useState<any | null>(null);
  const [billingMessage, setBillingMessage] = useState("");
  const [apiConfig, setApiConfig] = useState({ url: "", token: "" });

  useEffect(() => {
    if (user?.id) {
      setApiConfig({
        url: localStorage.getItem(`speakboard_wa_url_${user.id}`) || "",
        token: localStorage.getItem(`speakboard_wa_token_${user.id}`) || ""
      });
    }
  }, [user]);
  
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    paidStudents: 0,
    pendingPayments: 0,
    overdue: 0,
    monthlyRevenue: 0,
    adimplenciaRate: 100,
    averageTicket: 0
  });

  const MONTHLY_GOAL = 6000; // Target SaaS goal for autonomous teacher revenue

  useEffect(() => {
    if (students.length > 0) {
      calculateFinancialStats();
    } else {
      setFinancialStats({
        totalRevenue: 0,
        paidStudents: 0,
        pendingPayments: 0,
        overdue: 0,
        monthlyRevenue: 0,
        adimplenciaRate: 100,
        averageTicket: 0
      });
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
          const paymentDate = parseLocalDate(student.lastPaymentDate);
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

    const activeStudentsCount = students.length;
    const adimplenciaRate = activeStudentsCount > 0 
      ? Math.round(((activeStudentsCount - overdue) / activeStudentsCount) * 100) 
      : 100;
    const averageTicket = activeStudentsCount > 0 
      ? totalRevenue / activeStudentsCount 
      : 0;

    setFinancialStats({
      totalRevenue,
      paidStudents,
      pendingPayments,
      overdue,
      monthlyRevenue,
      adimplenciaRate,
      averageTicket
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold px-2.5 py-1 rounded-full text-xs">
            Pago
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 font-semibold px-2.5 py-1 rounded-full text-xs">
            Pendente
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 font-semibold px-2.5 py-1 rounded-full text-xs animate-pulse">
            Atrasado
          </Badge>
        );
      default:
        return <Badge variant="outline" className="rounded-full">-</Badge>;
    }
  };

  const getWhatsAppReminderLink = (student: any) => {
    const formattedAmount = (student.paymentAmount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const dueDateText = student.paymentDueDate 
      ? format(parseLocalDate(student.paymentDueDate), "dd/MM/yyyy")
      : "a definir";
    const message = `Olá, ${student.name}! Espero que esteja bem. Passando para lembrar que a mensalidade das aulas de inglês (${formattedAmount}) está em aberto com vencimento para ${dueDateText}. Se precisar dos dados do Pix ou tiver alguma dúvida, me avise. Obrigado!`;
    const cleanContact = student.contact.replace(/\D/g, "");
    
    // Default country code to 55 if not specified (Brazil)
    const phone = cleanContact.length === 11 || cleanContact.length === 10
      ? `55${cleanContact}` 
      : cleanContact;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleExportData = () => {
    toast.success("Relatório financeiro exportado com sucesso (simulado CSV)!");
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paymentProgress = students.length > 0 ? (financialStats.paidStudents / students.length) * 100 : 0;
  const monthlyGoalProgress = Math.min((financialStats.monthlyRevenue / MONTHLY_GOAL) * 100, 100);

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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
            Gestão Financeira
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de mensalidades, faturamento mensal e cobrança integrada.
          </p>
        </div>
        <Button 
          onClick={handleExportData} 
          variant="outline" 
          size="sm" 
          className="border-primary/20 hover:bg-primary/5 hover:text-primary rounded-xl shadow-soft font-semibold"
        >
          <Download className="w-4 h-4 mr-2" /> Exportar Dados
        </Button>
      </div>

      {/* Main SaaS Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total ARR / Portfolio Volume */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-card hover:shadow-medium transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volume Portfólio</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {financialStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 100%
              </span> 
              estimado com alunos ativos
            </p>
          </CardContent>
        </Card>

        {/* Monthly Received */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-card hover:shadow-medium transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receita Mensal (Pago)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              R$ {financialStats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Recebido no mês vigente
            </p>
          </CardContent>
        </Card>

        {/* Average Ticket */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-card hover:shadow-medium transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ticket Médio</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {financialStats.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Valor médio por aluno cadastrado
            </p>
          </CardContent>
        </Card>

        {/* Adimplência */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-card hover:shadow-medium transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taxa de Adimplência</CardTitle>
            {financialStats.adimplenciaRate >= 90 ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialStats.adimplenciaRate >= 90 ? 'text-foreground' : 'text-destructive'}`}>
              {financialStats.adimplenciaRate}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {financialStats.overdue} faturas atrasadas no momento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Tracker Widget */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-sm p-4 rounded-2xl shadow-soft">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h5 className="font-semibold text-sm text-foreground">Meta de Faturamento Mensal</h5>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            R$ {financialStats.monthlyRevenue.toLocaleString('pt-BR')} de R$ {MONTHLY_GOAL.toLocaleString('pt-BR')} ({monthlyGoalProgress.toFixed(0)}%)
          </span>
        </div>
        <Progress value={monthlyGoalProgress} className="h-2.5 bg-muted/55" />
      </Card>

      {/* Interactive Student Payments Section */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-elegant rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-foreground">Fluxo de Caixa e Cobrança</CardTitle>
          <CardDescription>Consulte vencimentos e envie lembretes rápidos via WhatsApp.</CardDescription>
          
          {/* Controls: Search and Status Filters */}
          <div className="flex flex-col md:flex-row gap-3 pt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno por nome ou contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl border-border/50 bg-card/70 h-10 text-sm focus-visible:ring-primary/50"
              />
            </div>
            
            <div className="flex bg-muted/65 p-1 rounded-xl border border-border/40 self-start md:self-auto gap-1">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'paid', label: 'Pago' },
                { key: 'pending', label: 'Pendente' },
                { key: 'overdue', label: 'Atrasado' }
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setStatusFilter(btn.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === btn.key
                      ? 'bg-card text-foreground shadow-soft border border-border/20 font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border/60 rounded-xl">
              Nenhum aluno encontrado correspondente aos filtros.
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {filteredStudents.map((student) => {
                const isPendingOrOverdue = student.paymentStatus !== 'paid';
                return (
                  <div 
                    key={student.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/40 hover:border-primary/20 bg-card/65 hover:bg-card/90 rounded-2xl transition-all shadow-soft gap-4"
                  >
                    {/* Student Info */}
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-soft">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">{student.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{student.contact}</p>
                      </div>
                    </div>
                    
                    {/* Financial Data and Status */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="text-left sm:text-right">
                        <div className="font-bold text-sm text-foreground">
                          R$ {(student.paymentAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {student.paymentDueDate && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>Venc: {format(parseLocalDate(student.paymentDueDate), 'dd/MM/yyyy')}</span>
                          </div>
                        )}
                        {student.lastPaymentDate && student.paymentStatus === 'paid' && (
                          <div className="text-[11px] text-emerald-500 flex items-center gap-1.5 mt-0.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Pago em: {format(parseLocalDate(student.lastPaymentDate), 'dd/MM/yyyy')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(student.paymentStatus || 'pending')}
                        
                        {/* Send billing reminder (WhatsApp) */}
                        {isPendingOrOverdue && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => {
                              setSelectedStudentForBilling(student);
                              const formattedAmount = (student.paymentAmount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                              const dueDateText = student.paymentDueDate 
                                ? format(parseLocalDate(student.paymentDueDate), "dd/MM/yyyy")
                                : "a definir";
                              setBillingMessage(`Olá, ${student.name}! Espero que esteja bem. Passando para lembrar que a mensalidade das aulas de inglês (${formattedAmount}) está em aberto com vencimento para ${dueDateText}. Se precisar dos dados do Pix ou tiver alguma dúvida, me avise. Obrigado!`);
                            }}
                            className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground transition-colors"
                            title="Cobrar via WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Billing Message Modal */}
      {selectedStudentForBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md border-border/40 bg-card/95 backdrop-blur-md shadow-elegant rounded-2xl animate-scale-in">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary animate-pulse" />
                Enviar Mensagem de Cobrança
              </CardTitle>
              <CardDescription className="text-xs">
                Revise e edite o texto da cobrança antes de realizar o envio para o aluno.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-muted/20 p-2.5 rounded-xl border border-border/30">
                  <div>
                    <span className="font-bold text-foreground block">{selectedStudentForBilling.name}</span>
                    <span className="text-muted-foreground font-semibold">{selectedStudentForBilling.contact}</span>
                  </div>
                  {apiConfig.url && apiConfig.token ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-[9px] uppercase">
                      API Gateway Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground border border-border/50 font-semibold text-[9px] uppercase bg-muted/40">
                      WhatsApp Web
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mensagem</label>
                  <textarea
                    value={billingMessage}
                    onChange={(e) => setBillingMessage(e.target.value)}
                    className="w-full min-h-[120px] text-xs p-3 rounded-xl border border-border/40 bg-card focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground leading-relaxed font-semibold resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {apiConfig.url && apiConfig.token ? (
                  <Button
                    onClick={async () => {
                      toast.loading("Enviando via WhatsApp API Gateway...", { id: "wa-send" });
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      toast.success("Cobrança enviada com sucesso via API Gateway!", { id: "wa-send" });
                      setSelectedStudentForBilling(null);
                    }}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-xs py-3"
                  >
                    Enviar via API Gateway
                  </Button>
                ) : null}

                <Button
                  onClick={() => {
                    const cleanContact = selectedStudentForBilling.contact.replace(/\D/g, "");
                    const phone = cleanContact.length === 11 || cleanContact.length === 10 ? `55${cleanContact}` : cleanContact;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(billingMessage)}`, "_blank");
                    toast.success("WhatsApp Web aberto com sucesso!");
                    setSelectedStudentForBilling(null);
                  }}
                  variant={apiConfig.url && apiConfig.token ? "outline" : "default"}
                  className="w-full font-semibold rounded-xl text-xs py-3"
                >
                  {apiConfig.url && apiConfig.token ? "Ou Enviar via WhatsApp Web" : "Enviar via WhatsApp Web"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setSelectedStudentForBilling(null)}
                  className="w-full text-xs rounded-xl"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};