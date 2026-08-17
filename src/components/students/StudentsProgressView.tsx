import { useState, useEffect } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useProgressGuide } from '@/hooks/useProgressGuide';
import { useClassBoard } from '@/hooks/useClassBoard';
import { useContents } from '@/hooks/useContents';
import { StudentDisplay, StudentLevel } from '@/types/Student';
import { Cycle } from '@/types/Cycle';
import { Feedback, HABILIDADES, NIVEL_ORDER, NivelPercebido, NIVEL_LABELS } from '@/types/Feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  BookOpen,
  Trophy,
  Target,
  GraduationCap,
  Calendar,
  ArrowLeft,
  CalendarDays,
  MessageSquareQuote,
  ChevronRight,
} from 'lucide-react';
import { StudentModal } from '@/components/dashboard/StudentModal';
import { FeedbackDialog } from '@/components/progress/FeedbackDialog';
import { CycleDialog } from '@/components/progress/CycleDialog';
import { SessionNoteDialog } from '@/components/board/SessionNoteDialog';
import { WeeklyPlannerCard } from '@/components/planner/WeeklyPlannerCard';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const LevelDots = ({ nivel }: { nivel: NivelPercebido | null }) => {
  const value = nivel ? NIVEL_ORDER[nivel] : 0;
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            'h-2 w-2 rounded-full transition-all duration-300',
            i <= value ? 'bg-primary scale-110 shadow-soft' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
};

const getLevelBadgeClass = (level: StudentLevel) => {
  switch (level) {
    case 'Iniciante':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'Intermediário':
      return 'bg-primary/15 text-primary border-primary/30';
    case 'Avançado':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const StudentsProgressView = () => {
  const { students, loading: studentsLoading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { contents } = useContents();
  const { saveSession } = useClassBoard();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<StudentLevel | 'all'>('all');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Dialogs
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentDisplay | undefined>();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);

  const [cycleOpen, setCycleOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);

  const [classDialogOpen, setClassDialogOpen] = useState(false);

  // Guide data for currently selected student
  const guide = useProgressGuide(selectedStudentId);

  // Auto-select first student on desktop
  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.contact && student.contact.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setMobileDetailOpen(true);
  };

  const handleOpenNewStudent = () => {
    setEditingStudent(undefined);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: StudentDisplay) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleDeleteCurrentStudent = (id: string) => {
    if (confirm('Tem certeza que deseja remover este aluno?')) {
      deleteStudent(id);
      if (selectedStudentId === id) {
        setSelectedStudentId(null);
        setMobileDetailOpen(false);
      }
    }
  };

  const handleSaveStudent = async (studentData: Omit<StudentDisplay, 'id' | 'createdAt'>) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, studentData);
    } else {
      await addStudent(studentData);
    }
  };

  const openWhatsApp = (contact: string, name: string) => {
    if (!contact) {
      toast.error('Aluno não possui telefone cadastrado.');
      return;
    }
    const cleanNumber = contact.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name}! Tudo bem? Passando para conversarmos sobre suas aulas de inglês.`);
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, '_blank');
  };

  if (studentsLoading && students.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando alunos e progresso pedagógico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-border/40 shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Alunos &amp; Progresso</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Acompanhe o desenvolvimento pedagógico, ciclo de 12 semanas, feedbacks e habilidades dos estudantes.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/30 text-xs font-semibold text-muted-foreground">
            <span>{students.length} {students.length === 1 ? 'Aluno' : 'Alunos'}</span>
          </div>
          <Button onClick={handleOpenNewStudent} className="gap-2 shadow-soft">
            <Plus className="w-4 h-4" />
            Novo Aluno
          </Button>
        </div>
      </div>

      {/* Main Master-Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & Student List */}
        <div className={cn(
          "lg:col-span-4 space-y-4",
          mobileDetailOpen ? "hidden lg:block" : "block"
        )}>
          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card/50 border-border/40 rounded-xl"
              />
            </div>

            {/* Level Badges filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['all', 'Iniciante', 'Intermediário', 'Avançado'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    levelFilter === lvl
                      ? "bg-primary text-white shadow-soft"
                      : "bg-card/50 text-muted-foreground hover:text-foreground border border-border/30"
                  )}
                >
                  {lvl === 'all' ? 'Todos' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Student Cards List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-border/60 bg-card/30">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum aluno encontrado</p>
                <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={handleOpenNewStudent}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Cadastrar Aluno
                </Button>
              </Card>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentId === student.id;
                return (
                  <Card
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className={cn(
                      "p-3.5 cursor-pointer transition-all duration-200 border hover-lift",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-soft ring-1 ring-primary/40"
                        : "border-border/40 bg-card/50 hover:bg-card/80"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-border/40 shrink-0">
                          {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {student.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate text-foreground leading-tight">
                            {student.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-[10px] py-0 px-1.5 font-medium", getLevelBadgeClass(student.level))}>
                              {student.level}
                            </Badge>
                            {student.paymentStatus === 'paid' && (
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Mensalidade em dia" />
                            )}
                            {student.paymentStatus === 'overdue' && (
                              <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" title="Mensalidade atrasada" />
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 shrink-0 transition-transform", isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground")} />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Complete Pedagogical Sheet (Ficha do Aluno) */}
        <div className={cn(
          "lg:col-span-8 space-y-6",
          mobileDetailOpen ? "block" : "hidden lg:block"
        )}>
          {selectedStudent ? (
            <div className="space-y-6 animate-fade-in">
              {/* Mobile Back Button */}
              <div className="lg:hidden flex items-center justify-between pb-2 border-b border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileDetailOpen(false)}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para lista de alunos
                </Button>
              </div>

              {/* Student Hero Header */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-card p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-soft">
                      {selectedStudent.avatarUrl && <AvatarImage src={selectedStudent.avatarUrl} />}
                      <AvatarFallback className="bg-primary text-white font-black text-lg">
                        {selectedStudent.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">{selectedStudent.name}</h2>
                        <Badge className={cn("text-xs font-semibold py-0.5 px-2", getLevelBadgeClass(selectedStudent.level))}>
                          {selectedStudent.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{selectedStudent.contact || 'Sem telefone'}</span>
                        {selectedStudent.paymentAmount ? (
                          <span>• R$ {selectedStudent.paymentAmount}/mês</span>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                    {selectedStudent.contact && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWhatsApp(selectedStudent.contact, selectedStudent.name)}
                        className="gap-1.5 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditStudent(selectedStudent)}
                      className="gap-1.5 text-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setClassDialogOpen(true)}
                      className="gap-1.5 text-xs shadow-soft"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      Nova Aula
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteCurrentStudent(selectedStudent.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Excluir aluno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 12-Week Pedagogical Cycle Card */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-card p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-foreground">
                        Ciclo Pedagógico de 12 Semanas
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {guide.activeCycle
                          ? `Semana ${guide.activeCycle.semana_atual || 1} de 12 • Foco: ${guide.activeCycle.objetivo_geral || 'Geral'}`
                          : 'Nenhum ciclo ativo no momento'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {guide.activeCycle ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCycle(guide.activeCycle);
                          setCycleOpen(true);
                        }}
                        className="text-xs gap-1"
                      >
                        <Edit className="w-3 h-3" /> Editar Ciclo
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingCycle(null);
                          setCycleOpen(true);
                        }}
                        className="text-xs gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Iniciar Ciclo
                      </Button>
                    )}
                  </div>
                </div>

                {guide.activeCycle && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Evolução do Ciclo</span>
                      <span className="text-primary font-mono">
                        {Math.round(((guide.activeCycle.semana_atual || 1) / 12) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={((guide.activeCycle.semana_atual || 1) / 12) * 100}
                      className="h-2.5 bg-muted/60"
                    />

                    {/* Weekly Planner inside Cycle */}
                    <div className="pt-2">
                      <WeeklyPlannerCard cicloId={guide.activeCycle.id} editable={true} />
                    </div>
                  </div>
                )}
              </Card>

              {/* Snapshot de Habilidades & Radar Pedagógico */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-card p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-foreground">
                        Snapshot de Habilidades
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Nível percebido nas competências essenciais
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingFeedback(null);
                      setFeedbackOpen(true);
                    }}
                    className="text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Novo Feedback
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {HABILIDADES.map((hab) => {
                    const nivel = guide.snapshot?.[hab.key as keyof typeof guide.snapshot] as NivelPercebido | null;
                    return (
                      <div
                        key={hab.key}
                        className="p-3 rounded-xl border border-border/30 bg-card/40 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-foreground">{hab.label}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {nivel ? NIVEL_LABELS[nivel] : 'Não avaliado'}
                          </p>
                        </div>
                        <LevelDots nivel={nivel || null} />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Feedbacks & Anotações Recentes */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-card p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <MessageSquareQuote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-foreground">
                        Histórico de Feedbacks
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Pontos fortes, melhorias e orientações
                      </p>
                    </div>
                  </div>
                </div>

                {guide.feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Nenhum feedback registrado ainda para este estudante.
                  </p>
                ) : (
                  <div className="space-y-3 pt-2">
                    {guide.feedbacks.slice(0, 3).map((fb) => (
                      <div
                        key={fb.id}
                        className="p-3.5 rounded-xl border border-border/30 bg-card/40 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {fb.created_at ? format(new Date(fb.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR }) : 'Data não informada'}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingFeedback(fb);
                              setFeedbackOpen(true);
                            }}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                        {fb.pontos_fortes && (
                          <p className="text-muted-foreground">
                            <strong className="text-emerald-600 dark:text-emerald-400">Pontos Fortes:</strong> {fb.pontos_fortes}
                          </p>
                        )}
                        {fb.pontos_melhoria && (
                          <p className="text-muted-foreground">
                            <strong className="text-amber-600 dark:text-amber-400">O que Praticar:</strong> {fb.pontos_melhoria}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Aulas Recentes do Aluno */}
              <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-card p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-foreground">
                        Aulas &amp; Conteúdo Trabalhado
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Últimas aulas registradas no histórico
                      </p>
                    </div>
                  </div>
                </div>

                {guide.recentClasses.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Nenhuma aula registrada ainda para este estudante.
                  </p>
                ) : (
                  <div className="space-y-2 pt-2">
                    {guide.recentClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-3 rounded-xl border border-border/30 bg-card/40 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">
                            {cls.topic || 'Aula sem tópico definido'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {cls.class_date ? format(new Date(cls.class_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ''}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {cls.status === 'completed' ? 'Concluída' : cls.status === 'scheduled' ? 'Agendada' : cls.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-border/60 bg-card/30">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-base text-foreground">Nenhum aluno selecionado</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Selecione um estudante na lista ao lado para visualizar a ficha pedagógica completa, ciclo e feedbacks.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Modals & Dialogs */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(undefined);
        }}
        onSave={handleSaveStudent}
        student={editingStudent}
      />

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        studentId={selectedStudentId}
        initial={editingFeedback}
        onSaved={guide.refetch}
      />

      <CycleDialog
        open={cycleOpen}
        onOpenChange={setCycleOpen}
        studentId={selectedStudentId}
        initial={editingCycle}
        onSaved={guide.refetch}
      />

      <SessionNoteDialog
        isOpen={classDialogOpen}
        onClose={() => setClassDialogOpen(false)}
        onSave={async (input, opts) => {
          await saveSession(input, opts);
          guide.refetch();
        }}
        students={students}
        contents={contents}
        initial={selectedStudentId ? ({ student_id: parseInt(selectedStudentId), status: 'scheduled' } as any) : null}
      />
    </div>
  );
};
