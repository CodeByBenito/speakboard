import { useState, useEffect } from "react";
import { StudentDisplay } from "@/types/Student";
import { useStudentHistory } from "@/hooks/useStudentHistory";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  BookOpen, 
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileText,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface CrmSidebarProps {
  student?: StudentDisplay;
  students: StudentDisplay[];
  updateStudent: (id: string, data: Omit<StudentDisplay, 'id' | 'createdAt'>) => Promise<void>;
  onEdit: (student: StudentDisplay) => void;
  onDelete: (id: string) => void;
  onClearSelection: () => void;
}

export const CrmSidebar = ({
  student,
  students,
  updateStudent,
  onEdit,
  onDelete,
  onClearSelection
}: CrmSidebarProps) => {
  const { profile } = useProfile();
  const history = useStudentHistory(student?.id || "");
  
  // Dialog States
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportToView, setSelectedReportToView] = useState<{ title: string; content: string; date: string } | null>(null);
  
  // Form States
  const [classForm, setClassForm] = useState({
    date: new Date().toISOString().split("T")[0],
    topic: "",
    notes: ""
  });
  
  const [paymentForm, setPaymentForm] = useState({
    amount: student?.paymentAmount?.toString() || "",
    date: new Date().toISOString().split("T")[0],
    status: "paid" as "paid" | "pending" | "overdue",
    notes: ""
  });

  const [reportForm, setReportForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    content: ""
  });

  // Keep payment amount state synced when selected student changes
  useEffect(() => {
    if (student) {
      setPaymentForm(prev => ({
        ...prev,
        amount: student.paymentAmount?.toString() || ""
      }));
    }
  }, [student]);

  // Calendar logic (Current week days for display)
  const [weekDays, setWeekDays] = useState<Array<{ name: string; day: number; active: boolean; date: Date }>>([]);
  
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Go back to Sunday

    const days = [];
    const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];
    
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      days.push({
        name: dayNames[i],
        day: nextDay.getDate(),
        active: nextDay.toDateString() === today.toDateString(),
        date: nextDay
      });
    }
    setWeekDays(days);
  }, []);

  // Format Recharts data for cumulative class history
  const getChartData = () => {
    if (!history.classHistory || history.classHistory.length === 0) {
      return [{ date: "Início", Aulas: 0 }];
    }
    
    // Sort oldest to newest
    const completedClasses = [...history.classHistory]
      .filter(c => c.status === "completed")
      .sort((a, b) => new Date(a.class_date).getTime() - new Date(b.class_date).getTime());
      
    if (completedClasses.length === 0) {
      return [{ date: "Início", Aulas: 0 }];
    }

    return completedClasses.map((c, index) => ({
      date: format(new Date(c.class_date), "dd/MM"),
      Aulas: index + 1
    }));
  };

  const handleLogClass = async () => {
    if (!student) return;
    
    try {
      // 1. Add class record to history
      await history.addClassRecord({
        class_date: new Date(classForm.date).toISOString(),
        topic: classForm.topic || "Aula de Conversação",
        notes: classForm.notes,
        status: "completed"
      });

      // 2. Increment student completed classes
      const updatedCompleted = student.completedClasses + 1;
      const updatedTotal = Math.max(student.totalClasses, updatedCompleted);
      
      const studentData: Omit<StudentDisplay, "id" | "createdAt"> = {
        name: student.name,
        age: student.age,
        contact: student.contact,
        level: student.level,
        totalClasses: updatedTotal,
        completedClasses: updatedCompleted,
        nextClassDate: student.nextClassDate,
        nextLessonTopic: student.nextLessonTopic,
        paymentAmount: student.paymentAmount,
        paymentDueDate: student.paymentDueDate,
        paymentStatus: student.paymentStatus,
        lastPaymentDate: student.lastPaymentDate
      };

      await updateStudent(student.id, studentData);
      
      // Reset form
      setClassForm({
        date: new Date().toISOString().split("T")[0],
        topic: "",
        notes: ""
      });
      setIsClassDialogOpen(false);
      toast.success("Progresso do aluno atualizado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar aula.");
    }
  };

  const handleLogPayment = async () => {
    if (!student) return;

    try {
      const amt = parseFloat(paymentForm.amount) || 0;
      // 1. Add payment record to history
      await history.addPaymentRecord({
        amount: amt,
        payment_date: new Date(paymentForm.date).toISOString(),
        status: paymentForm.status,
        notes: paymentForm.notes
      });

      // 2. Update student payment info
      const studentData: Omit<StudentDisplay, "id" | "createdAt"> = {
        name: student.name,
        age: student.age,
        contact: student.contact,
        level: student.level,
        totalClasses: student.totalClasses,
        completedClasses: student.completedClasses,
        nextClassDate: student.nextClassDate,
        nextLessonTopic: student.nextLessonTopic,
        paymentAmount: student.paymentAmount,
        paymentDueDate: student.paymentDueDate,
        paymentStatus: paymentForm.status,
        lastPaymentDate: paymentForm.status === "paid" ? new Date(paymentForm.date).toISOString() : student.lastPaymentDate
      };

      await updateStudent(student.id, studentData);

      // Reset form
      setPaymentForm(prev => ({
        ...prev,
        date: new Date().toISOString().split("T")[0],
        status: "paid",
        notes: ""
      }));
      setIsPaymentDialogOpen(false);
      toast.success("Pagamento registrado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar pagamento.");
    }
  };

  const handleLogReport = async () => {
    if (!student) return;

    if (!reportForm.title || !reportForm.content) {
      toast.error("Por favor, preencha o título e o conteúdo do relatório.");
      return;
    }

    try {
      await history.addReportRecord({
        report_date: new Date(reportForm.date).toISOString(),
        title: reportForm.title,
        content: reportForm.content
      });

      // Reset form
      setReportForm({
        date: new Date().toISOString().split("T")[0],
        title: "",
        content: ""
      });
      setIsReportDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar relatório.");
    }
  };

  const getLevelBadgeColor = (level?: string) => {
    switch (level) {
      case "Iniciante":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "Intermediário":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "Avançado":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // If no student is selected, display overall stats & profile summary (Teacher view)
  if (!student) {
    // Collect stats from all students
    const totalStudents = students.length;
    const totalCompleted = students.reduce((sum, s) => sum + s.completedClasses, 0);
    const pendingPaymentsCount = students.filter(s => s.paymentStatus !== "paid").length;
    
    // Global next classes
    const upcomingLessons = students
      .filter(s => s.nextClassDate)
      .sort((a, b) => new Date(a.nextClassDate!).getTime() - new Date(b.nextClassDate!).getTime())
      .slice(0, 3);

    return (
      <aside className="w-full flex flex-col bg-card/30 backdrop-blur-xl border-l border-border/50 h-screen sticky top-0 p-6 overflow-y-auto z-30">
        {/* Header - Profile and Theme */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-primary/20 shadow-soft">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback className="bg-gradient-primary text-white font-bold">
                {profile?.displayName?.charAt(0).toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-sm leading-none">{profile?.displayName || "Professor"}</h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                {profile?.isAutonomous ? "Professor Autônomo" : profile?.organization || "SpeakFlow"}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Big Card Profile illustration */}
        <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-hero text-white shadow-elegant mb-6 flex flex-col justify-end min-h-[140px]">
          <div className="absolute top-4 right-4 p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-white/70">Resumo Geral</p>
          <h3 className="text-xl font-bold mt-1">Seu Hub Educacional</h3>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            Selecione um aluno para acompanhar o progresso pedagógico e registrar frequências.
          </p>
        </div>

        {/* Small grid stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="flex flex-col items-center justify-center p-3 bg-muted/40 border border-border/30 rounded-xl">
            <span className="text-lg font-bold text-foreground">{totalStudents}</span>
            <span className="text-[10px] text-muted-foreground text-center mt-1">Alunos</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted/40 border border-border/30 rounded-xl">
            <span className="text-lg font-bold text-foreground">{totalCompleted}</span>
            <span className="text-[10px] text-muted-foreground text-center mt-1">Aulas</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-muted/40 border border-border/30 rounded-xl">
            <span className="text-lg font-bold text-destructive">{pendingPaymentsCount}</span>
            <span className="text-[10px] text-muted-foreground text-center mt-1">Pendentes</span>
          </div>
        </div>

        {/* Calendar Bar Mock */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Cronograma Semanal</h5>
            <span className="text-[11px] text-primary font-medium">Hoje</span>
          </div>
          <div className="flex items-center justify-between bg-muted/20 border border-border/30 rounded-2xl p-3">
            {weekDays.map((wd, i) => (
              <div 
                key={i} 
                className={`flex flex-col items-center p-2 rounded-xl transition-all w-8 ${
                  wd.active 
                    ? "bg-foreground text-background scale-110 shadow-soft font-bold" 
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <span className="text-[9px] uppercase">{wd.name}</span>
                <span className="text-xs mt-1">{wd.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming general lessons */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Próximas Aulas</h5>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
              Ver tudo <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          
          <div className="space-y-3">
            {upcomingLessons.length === 0 ? (
              <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground">
                Nenhuma aula agendada para os próximos dias.
              </div>
            ) : (
              upcomingLessons.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3.5 bg-muted/40 border border-border/30 rounded-2xl hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h6 className="font-semibold text-xs leading-none">{s.name}</h6>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[150px]">
                        {s.nextLessonTopic || "Sem tema definido"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full block border border-border/50">
                      {s.nextClassDate ? format(new Date(s.nextClassDate), "dd/MM") : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Calculate student specific values
  const studentProgress = student.totalClasses > 0 ? (student.completedClasses / student.totalClasses) * 100 : 0;
  const studentReports = history.classHistory ? history.classHistory.filter(r => r.status === 'report') : [];
  
  return (
    <aside className="w-full flex flex-col bg-card/30 backdrop-blur-xl border-l border-border/50 h-screen sticky top-0 p-6 overflow-y-auto z-30">
      {/* Header - Back and Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto hover:bg-transparent"
        >
          &larr; Voltar ao Geral
        </Button>
        <ThemeToggle />
      </div>

      {/* Selected Student Profile Banner */}
      <div className="flex flex-col items-center text-center p-6 bg-muted/30 border border-border/30 rounded-3xl mb-6 relative">
        <Badge className={`absolute top-4 right-4 ${getLevelBadgeColor(student.level)}`}>
          {student.level}
        </Badge>
        
        <Avatar className="w-20 h-20 border-2 border-primary/20 shadow-medium mb-3">
          <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-bold text-lg leading-tight">{student.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{student.age} anos &bull; {student.contact}</p>
      </div>

      {/* Student stats block */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="flex flex-col items-center justify-center p-2.5 bg-muted/40 border border-border/30 rounded-xl">
          <span className="text-sm font-bold">{student.completedClasses}</span>
          <span className="text-[9px] text-muted-foreground text-center mt-0.5">Realizadas</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 bg-muted/40 border border-border/30 rounded-xl">
          <span className="text-sm font-bold">{student.totalClasses}</span>
          <span className="text-[9px] text-muted-foreground text-center mt-0.5">Contratadas</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 bg-muted/40 border border-border/30 rounded-xl">
          <span className={`text-[10px] font-bold uppercase ${
            student.paymentStatus === 'paid' ? 'text-emerald-500' :
            student.paymentStatus === 'overdue' ? 'text-destructive animate-pulse' : 'text-amber-500'
          }`}>
            {student.paymentStatus === 'paid' ? 'Pago' :
             student.paymentStatus === 'overdue' ? 'Atrasado' : 'Pendente'}
          </span>
          <span className="text-[9px] text-muted-foreground text-center mt-0.5">Financeiro</span>
        </div>
      </div>

      {/* Calendar Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Aulas da Semana</h5>
          <span className="text-[11px] text-primary font-medium">Frequência: {studentProgress.toFixed(0)}%</span>
        </div>
        <div className="flex items-center justify-between bg-muted/20 border border-border/30 rounded-2xl p-3">
          {weekDays.map((wd, i) => (
            <div 
              key={i} 
              className={`flex flex-col items-center p-2 rounded-xl transition-all w-8 ${
                wd.active 
                  ? "bg-foreground text-background scale-110 shadow-soft font-bold" 
                  : "text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <span className="text-[9px] uppercase">{wd.name}</span>
              <span className="text-xs mt-1">{wd.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progression Line/Area Chart */}
      <div className="mb-6 p-4 bg-muted/20 border border-border/30 rounded-2xl">
        <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">Curva de Aprendizado</h5>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  fontSize: 10,
                  borderRadius: 8
                }} 
              />
              <defs>
                <linearGradient id="colorAulas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="Aulas" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorAulas)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Gráfico cumulativo de aulas concluídas com sucesso.
        </p>
      </div>

      {/* Next Class details */}
      <div className="p-4 bg-muted/40 border border-border/30 rounded-2xl mb-6">
        <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Próxima Aula Agendada</h5>
        {student.nextClassDate ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {format(new Date(student.nextClassDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            {student.nextLessonTopic && (
              <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5 bg-card/60 p-2.5 rounded-lg border border-border/50">
                <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Tema:</strong> {student.nextLessonTopic}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma aula agendada no momento.</p>
        )}
      </div>

      {/* Recent pedagogical reports */}
      <div className="p-4 bg-muted/40 border border-border/30 rounded-2xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Relatórios Pedagógicos</h5>
          <span className="text-[10px] text-primary font-medium">{studentReports.length} total</span>
        </div>
        {studentReports.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum relatório registrado ainda.</p>
        ) : (
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {studentReports.slice(0, 3).map((report) => (
              <div 
                key={report.id} 
                onClick={() => setSelectedReportToView({
                  title: report.topic || "Relatório sem título",
                  content: report.notes || "",
                  date: format(new Date(report.class_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                })}
                className="p-2.5 bg-card/60 hover:bg-card border border-border/50 rounded-xl cursor-pointer hover:border-primary/50 transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                    {report.topic || "Relatório"}
                  </span>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                    {format(new Date(report.class_date), "dd/MM")}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {report.notes}
                </p>
              </div>
            ))}
            {studentReports.length > 3 && (
              <p className="text-[10px] text-primary text-center pt-1 font-medium hover:underline cursor-pointer" onClick={() => {
                toast.info("Todos os relatórios podem ser vistos em detalhes no Histórico.");
              }}>
                + {studentReports.length - 3} outros no Histórico
              </p>
            )}
          </div>
        )}
      </div>

      {/* CRM Action Buttons */}
      <div className="mt-auto space-y-2">
        <Button 
          onClick={() => setIsClassDialogOpen(true)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl text-xs py-5 shadow-soft hover:shadow-medium"
        >
          <Plus className="w-4 h-4 mr-2" /> Registrar Aula Concluída
        </Button>
        <Button 
          onClick={() => setIsReportDialogOpen(true)}
          variant="outline"
          className="w-full border-primary/20 bg-background text-primary hover:bg-primary/10 font-semibold rounded-xl text-xs py-5 shadow-soft"
        >
          <FileText className="w-4 h-4 mr-2" /> Registrar Relatório
        </Button>
        <Button 
          onClick={() => setIsPaymentDialogOpen(true)}
          variant="outline"
          className="w-full font-semibold rounded-xl text-xs py-5 shadow-soft"
        >
          <DollarSign className="w-4 h-4 mr-2" /> Registrar Pagamento
        </Button>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(student)}
            className="flex-1 hover:bg-primary/10 hover:text-primary text-xs rounded-xl"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Editar Cadastro
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(student.id)}
            className="flex-1 hover:bg-destructive/10 hover:text-destructive text-xs rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Excluir
          </Button>
        </div>
      </div>

      {/* dialog for registering class */}
      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Aula Realizada</DialogTitle>
            <CardDescription>Esta ação incrementará o contador de aulas concluídas deste aluno no CRM.</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="class-date">Data da Aula</Label>
              <Input 
                id="class-date" 
                type="date" 
                value={classForm.date}
                onChange={(e) => setClassForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-topic">Tema / Tópico</Label>
              <Input 
                id="class-topic" 
                placeholder="Ex: Simple Past vs Present Perfect"
                value={classForm.topic}
                onChange={(e) => setClassForm(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-notes">Observações de Progresso</Label>
              <Textarea 
                id="class-notes" 
                placeholder="Como foi o desempenho do aluno? Algum ponto a revisar?"
                rows={3}
                value={classForm.notes}
                onChange={(e) => setClassForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClassDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleLogClass}>Confirmar Aula</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* dialog for registering payment */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <CardDescription>Adicione o registro financeiro e atualize o status de pagamento do aluno.</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pay-amount">Valor (R$)</Label>
                <Input 
                  id="pay-amount" 
                  type="number"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-date">Data</Label>
                <Input 
                  id="pay-date" 
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pay-status">Status de Pagamento do Aluno</Label>
              <select
                id="pay-status"
                className="w-full bg-background border border-input rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={paymentForm.status}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, status: e.target.value as "paid" | "pending" | "overdue" }))}
              >
                <option value="paid">Pago (Mensalidade Quitada)</option>
                <option value="pending">Pendente (Aguardando)</option>
                <option value="overdue">Atrasado (Vencido)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pay-notes">Notas / Observações</Label>
              <Textarea 
                id="pay-notes" 
                placeholder="Ex: Transferência via Pix Banco Inter"
                rows={2}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleLogPayment}>Confirmar Recebimento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* dialog for registering report */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Relatório do Aluno</DialogTitle>
            <CardDescription>Adicione uma observação pedagógica ou feedback geral que não esteja atrelado a uma aula específica.</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="report-date">Data do Relatório</Label>
              <Input 
                id="report-date" 
                type="date" 
                value={reportForm.date}
                onChange={(e) => setReportForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-title">Título / Assunto</Label>
              <Input 
                id="report-title" 
                placeholder="Ex: Desempenho em Conversação, Feedback de Pronúncia"
                value={reportForm.title}
                onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-content">Conteúdo do Relatório</Label>
              <Textarea 
                id="report-content" 
                placeholder="Descreva detalhadamente o progresso, pontos fortes e tópicos a melhorar do aluno..."
                rows={4}
                value={reportForm.content}
                onChange={(e) => setReportForm(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleLogReport}>Salvar Relatório</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* dialog for viewing report details */}
      <Dialog open={!!selectedReportToView} onOpenChange={() => setSelectedReportToView(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">{selectedReportToView?.title}</DialogTitle>
            <CardDescription>Relatório registrado em {selectedReportToView?.date}</CardDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">
            {selectedReportToView?.content}
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedReportToView(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};
