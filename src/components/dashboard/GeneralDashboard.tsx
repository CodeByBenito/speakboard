import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useClassBoard } from '@/hooks/useClassBoard';
import { useStudents } from '@/hooks/useStudents';
import { useContents } from '@/hooks/useContents';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  CalendarDays,
  DollarSign,
  Flag,
  Target,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  Edit,
  Trash2,
  Kanban,
  List,
  Sparkles,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { ClassSession, SessionNoteInput, CLASS_STATUS_LABELS, normalizeClassStatus, BOARD_COLUMNS } from '@/types/Session';
import { SessionNoteDialog } from '@/components/board/SessionNoteDialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled':
      return {
        label: 'Agendada',
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        icon: <Clock className="w-3 h-3" />,
      };
    case 'in_progress':
      return {
        label: 'Em Andamento',
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        icon: <RotateCcw className="w-3 h-3 animate-spin" />,
      };
    case 'completed':
      return {
        label: 'Concluída',
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        icon: <CheckCircle2 className="w-3 h-3" />,
      };
    case 'cancelled':
      return {
        label: 'Cancelada',
        bg: 'bg-destructive/10 text-destructive border-destructive/20',
        icon: <XCircle className="w-3 h-3" />,
      };
    case 'rescheduled':
      return {
        label: 'Remarcada',
        bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        icon: <RotateCcw className="w-3 h-3" />,
      };
    default:
      return {
        label: status,
        bg: 'bg-muted text-muted-foreground',
        icon: null,
      };
  }
};

export const GeneralDashboard = () => {
  const { data, loading: dashLoading } = useDashboard();
  const { classes, loading: classLoading, updateStatus, saveSession, deleteClass } = useClassBoard();
  const { students } = useStudents();
  const { contents } = useContents();

  const [classViewMode, setClassViewMode] = useState<'list' | 'kanban'>('list');
  const [classSearch, setClassSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      (c.student_name && c.student_name.toLowerCase().includes(classSearch.toLowerCase())) ||
      (c.topic && c.topic.toLowerCase().includes(classSearch.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNewClass = () => {
    setEditingSession(null);
    setDialogOpen(true);
  };

  const handleOpenEditClass = (session: ClassSession) => {
    setEditingSession(session);
    setDialogOpen(true);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta aula?')) {
      deleteClass(id);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Modern EdTech Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-card/60 p-6 md:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full py-1 px-3 font-semibold text-[11px] shadow-soft">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            SpeakBoard Pedagógico
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Painel Geral &amp; Agenda de Aulas
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl font-medium leading-relaxed">
            Visão consolidada de estudantes, aulas programadas, status pedagógico e saúde financeira da sua escola.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button onClick={handleOpenNewClass} className="gap-2 shadow-soft h-11 px-5 rounded-xl font-semibold">
            <Plus className="w-4 h-4" />
            Agendar Nova Aula
          </Button>
        </div>
      </div>

      {/* KPI Cards / Indicadores Principais */}
      {dashLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 h-24 animate-pulse bg-muted/30 border-border/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center gap-4 border-border/40 bg-card/60 backdrop-blur-sm shadow-card hover-lift transition-all">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-soft">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground tracking-tight">{data.totalStudents}</p>
              <p className="text-xs text-muted-foreground font-medium">Alunos Ativos</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 border-border/40 bg-card/60 backdrop-blur-sm shadow-card hover-lift transition-all">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shadow-soft">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground tracking-tight">{data.weekClasses.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Aulas na Semana</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 border-border/40 bg-card/60 backdrop-blur-sm shadow-card hover-lift transition-all">
            <div className={cn(
              "p-3 rounded-2xl shadow-soft",
              data.financePending.length > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
            )}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground tracking-tight">{data.financePending.length}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {data.financePending.length === 0 ? 'Sem Pendências' : 'Pendências Fin.'}
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4 border-border/40 bg-card/60 backdrop-blur-sm shadow-card hover-lift transition-all">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 shadow-soft">
              <Flag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground tracking-tight">{data.upcomingCheckpoints.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Checkpoints Próximos</p>
            </div>
          </Card>
        </div>
      )}

      {/* Interactive Class Hub (Agenda e Status das Aulas) */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-card p-5 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Gerenciamento de Aulas &amp; Presença
              </h2>
              <p className="text-xs text-muted-foreground">
                Altere o status da aula em 1 clique ou faça anotações pedagógicas detalhadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/30">
              <button
                onClick={() => setClassViewMode('list')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  classViewMode === 'list'
                    ? "bg-primary text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
              <button
                onClick={() => setClassViewMode('kanban')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  classViewMode === 'kanban'
                    ? "bg-primary text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Kanban className="w-3.5 h-3.5" />
                Quadro
              </button>
            </div>
          </div>
        </div>

        {/* Search and Status Pills */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aula por aluno ou tópico..."
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              className="pl-10 bg-card/40 border-border/40 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'scheduled', label: 'Agendadas' },
              { key: 'in_progress', label: 'Em Andamento' },
              { key: 'completed', label: 'Concluídas' },
              { key: 'cancelled', label: 'Canceladas' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                  statusFilter === st.key
                    ? "bg-primary text-white shadow-soft"
                    : "bg-card/40 text-muted-foreground hover:text-foreground border border-border/30"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Content */}
        {classLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl border-border/60 bg-muted/10 space-y-3">
            <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <p className="text-sm font-semibold text-muted-foreground">Nenhuma aula encontrada</p>
            <Button size="sm" onClick={handleOpenNewClass} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Agendar Aula
            </Button>
          </div>
        ) : classViewMode === 'list' ? (
          /* List Mode */
          <div className="space-y-3">
            {filteredClasses.map((cls) => {
              const badgeInfo = getStatusBadge(cls.status);
              return (
                <div
                  key={cls.id}
                  className="p-4 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{cls.student_name}</span>
                      <Badge variant="outline" className={cn("text-[11px] py-0.5 px-2 font-medium flex items-center gap-1", badgeInfo.bg)}>
                        {badgeInfo.icon}
                        {badgeInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {cls.topic ? <strong className="text-foreground">{cls.topic} • </strong> : null}
                      {cls.class_date ? format(new Date(cls.class_date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : ''}
                    </p>
                    {cls.notes && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">
                        &quot;{cls.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* 1-Click Status Toggles & Edit Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap self-end md:self-auto">
                    <span className="text-[10px] text-muted-foreground font-bold mr-1 hidden sm:inline">Status:</span>
                    
                    <button
                      onClick={() => updateStatus(cls.id, 'scheduled')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border",
                        cls.status === 'scheduled'
                          ? "bg-blue-500 text-white border-blue-500 shadow-soft"
                          : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted"
                      )}
                      title="Marcar como Agendada"
                    >
                      Agendada
                    </button>

                    <button
                      onClick={() => updateStatus(cls.id, 'in_progress')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border",
                        cls.status === 'in_progress'
                          ? "bg-amber-500 text-white border-amber-500 shadow-soft"
                          : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted"
                      )}
                      title="Marcar como Em Andamento"
                    >
                      Em Andamento
                    </button>

                    <button
                      onClick={() => updateStatus(cls.id, 'completed')}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border",
                        cls.status === 'completed'
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-soft"
                          : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted"
                      )}
                      title="Marcar como Concluída"
                    >
                      Concluída
                    </button>

                    <button
                      onClick={() => updateStatus(cls.id, 'cancelled')}
                      className={cn(
                        "px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border",
                        cls.status === 'cancelled'
                          ? "bg-destructive text-white border-destructive shadow-soft"
                          : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-muted"
                      )}
                      title="Marcar como Cancelada"
                    >
                      Cancelada
                    </button>

                    <div className="h-4 w-[1px] bg-border/50 mx-1" />

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEditClass(cls)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Editar anotação"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClass(cls.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Excluir aula"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Kanban Mode */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BOARD_COLUMNS.map((col) => {
              const colClasses = filteredClasses.filter((c) => normalizeClassStatus(c.status) === col.status);
              return (
                <div key={col.status} className="p-4 rounded-2xl border border-border/40 bg-card/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/30">
                    <span className="font-bold text-xs text-foreground uppercase tracking-wider">{col.label}</span>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {colClasses.length}
                    </Badge>
                  </div>

                  <div className="space-y-2.5 min-h-[150px]">
                    {colClasses.map((cls) => (
                      <Card
                        key={cls.id}
                        className="p-3.5 border-border/40 bg-card/60 hover:bg-card/90 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground truncate">{cls.student_name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEditClass(cls)}
                            className="h-6 w-6 text-muted-foreground"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {cls.topic || 'Sem tópico'}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {cls.class_date ? format(new Date(cls.class_date), "dd/MM 'às' HH:mm", { locale: ptBR }) : ''}
                        </p>

                        <div className="flex items-center gap-1 pt-1 border-t border-border/30">
                          {col.status !== 'scheduled' && (
                            <button
                              onClick={() => updateStatus(cls.id, 'scheduled')}
                              className="text-[10px] text-blue-500 font-semibold hover:underline"
                            >
                              Agendar
                            </button>
                          )}
                          {col.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(cls.id, 'completed')}
                              className="text-[10px] text-emerald-500 font-semibold hover:underline ml-auto"
                            >
                              Concluir
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Bottom Insights: Checkpoints e Pendências */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checkpoints a vencer */}
        <Card className="p-6 space-y-4 border-border/40 bg-card/60 backdrop-blur-sm shadow-card">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-sm text-foreground">Checkpoints Próximos (14 dias)</h2>
          </div>
          {data.upcomingCheckpoints.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Nenhum checkpoint próximo.</p>
          ) : (
            <div className="space-y-2.5">
              {data.upcomingCheckpoints.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/20 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{c.student_name}</p>
                    <p className="text-muted-foreground text-[11px]">
                      Ciclo termina em {new Date(c.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-border/40">
                    Foco: {c.focus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pendências financeiras */}
        <Card className="p-6 space-y-4 border-border/40 bg-card/60 backdrop-blur-sm shadow-card">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h2 className="font-bold text-sm text-foreground">Pendências Financeiras</h2>
          </div>
          {data.financePending.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Nenhuma pendência financeira.</p>
          ) : (
            <div className="space-y-2.5">
              {data.financePending.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/20 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{f.student_name}</p>
                    {f.payment_due_date && (
                      <p className="text-muted-foreground text-[11px]">
                        Vencimento: {new Date(f.payment_due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {f.payment_amount != null && (
                      <span className="font-bold text-foreground">
                        R$ {Number(f.payment_amount).toFixed(2)}
                      </span>
                    )}
                    <Badge
                      variant={f.payment_status === 'overdue' ? 'destructive' : 'secondary'}
                      className="text-[10px] uppercase font-bold"
                    >
                      {f.payment_status === 'overdue' ? 'Atrasado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Dialog for Creating or Editing a Class */}
      <SessionNoteDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSession(null);
        }}
        onSave={async (input, opts) => {
          await saveSession(input, opts);
        }}
        students={students}
        contents={contents}
        initial={editingSession}
      />
    </div>
  );
};
