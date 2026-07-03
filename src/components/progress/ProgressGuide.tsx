import { useState, useEffect } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useProgressGuide } from '@/hooks/useProgressGuide';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Target,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Eye,
  BookOpen,
  CalendarClock,
} from 'lucide-react';
import {
  FEEDBACK_AREAS,
  NIVEL_LABELS,
  NIVEL_ORDER,
  NivelPercebido,
} from '@/types/Feedback';
import {
  CICLO_STATUS_LABELS,
  CICLO_TOTAL_SEMANAS,
  HABILIDADES,
  Cycle,
} from '@/types/Cycle';
import { Feedback } from '@/types/Feedback';
import { FeedbackDialog } from './FeedbackDialog';
import { CycleDialog } from './CycleDialog';
import { WeeklyPlannerCard } from '@/components/planner/WeeklyPlannerCard';

type ViewMode = 'professor' | 'aluno';

const habilidadeLabel = (key: string) =>
  HABILIDADES.find((h) => h.key === key)?.label || key;

// Pequeno indicador de intensidade (4 níveis) para o snapshot de habilidades.
const LevelDots = ({ nivel }: { nivel: NivelPercebido | null }) => {
  const value = nivel ? NIVEL_ORDER[nivel] : 0;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i <= value ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
};

export const ProgressGuide = () => {
  const { students, loading: studentsLoading } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('professor');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Cycle | null>(null);

  // Seleciona o primeiro aluno automaticamente.
  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const guide = useProgressGuide(selectedStudentId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const isProfessor = view === 'professor';

  const openNewFeedback = () => {
    setEditingFeedback(null);
    setFeedbackOpen(true);
  };
  const openEditFeedback = (f: Feedback) => {
    setEditingFeedback(f);
    setFeedbackOpen(true);
  };
  const openNewCycle = () => {
    setEditingCycle(null);
    setCycleOpen(true);
  };
  const openEditCycle = (c: Cycle) => {
    setEditingCycle(c);
    setCycleOpen(true);
  };

  const handleSaveFeedback = async (input: any) => {
    if (editingFeedback) await guide.updateFeedback(editingFeedback.id, input);
    else await guide.addFeedback(input);
  };
  const handleSaveCycle = async (input: any) => {
    if (editingCycle) await guide.updateCycle(editingCycle.id, input);
    else await guide.addCycle(input);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-none px-4 md:px-10 space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border/30 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" />
            Guia de Evolução Pedagógica
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Plano integrado composto por Ciclo de Aprendizado (Evolution Plan), Feedback Docente e Aulas.
          </p>
        </div>

        {/* Alternância de visão */}
        <div className="flex items-center gap-1 rounded-xl border border-border/40 p-1.5 bg-card/45 backdrop-blur-md self-start sm:self-auto shadow-soft">
          <button
            onClick={() => setView('professor')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              isProfessor
                ? 'bg-primary text-white shadow-soft scale-105'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Professor
          </button>
          <button
            onClick={() => setView('aluno')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              !isProfessor
                ? 'bg-primary text-white shadow-soft scale-105'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-4 h-4" /> Aluno
          </button>
        </div>
      </div>

      {/* Seletor de aluno */}
      <div className="flex items-center gap-3 bg-card/30 border border-border/40 p-4 rounded-2xl max-w-md shadow-card">
        <GraduationCap className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Estudante Selecionado</label>
          <Select
            value={selectedStudentId ?? undefined}
            onValueChange={(v) => setSelectedStudentId(v)}
            disabled={studentsLoading || students.length === 0}
          >
            <SelectTrigger className="border-border/40 bg-card focus-visible:ring-primary/50 text-xs font-bold h-9">
              <SelectValue placeholder={studentsLoading ? 'Carregando...' : 'Selecione um aluno'} />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs font-semibold">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isProfessor && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-xs text-muted-foreground font-semibold flex items-center gap-2 animate-scale-in">
          <Eye className="w-4 h-4 text-primary shrink-0" />
          <span>Você está na <strong>Visão do Aluno</strong> (somente leitura). Os feedbacks internos do professor não são exibidos.</span>
        </div>
      )}

      {!selectedStudentId ? (
        <Card className="p-16 text-center text-muted-foreground border-dashed border-2 border-border/40 rounded-3xl bg-muted/10">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold">
            {students.length === 0
              ? 'Nenhum aluno cadastrado. Adicione alunos no CRM antes de planejar ciclos.'
              : 'Selecione um aluno para exibir o Guia de Evolução.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Ciclos, Focos, Planner e Métricas (8 Colunas) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Linha 1: Ciclo Atual & Próximo Foco */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ciclo Atual */}
              <Card className="p-6 space-y-5 border-border/40 bg-card/45 backdrop-blur-sm shadow-card rounded-2xl animate-scale-in flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-border/30 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm text-foreground">Ciclo Atual (Evolution Plan)</h2>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Meta macro pedagógica deste ciclo</p>
                      </div>
                    </div>
                    {isProfessor && (
                      <div className="flex gap-1.5 shrink-0">
                        {guide.activeCycle && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg h-8 px-2 text-[10px] font-bold"
                            onClick={() => openEditCycle(guide.activeCycle!)}
                          >
                            <Pencil className="w-3 h-3 mr-1" /> Editar
                          </Button>
                        )}
                        <Button size="sm" className="rounded-lg h-8 px-2 text-[10px] font-bold" onClick={openNewCycle}>
                          <Plus className="w-3 h-3 mr-1" /> Novo
                        </Button>
                      </div>
                    )}
                  </div>

                  {guide.activeCycle ? (
                    <div className="space-y-4">
                      <div className="bg-muted/10 border border-border/40 rounded-xl p-3.5">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Objetivo Geral</span>
                        <p className="text-xs font-bold leading-relaxed text-foreground">
                          {guide.activeCycle.objetivo || 'Sem objetivo macro definido.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-muted-foreground">
                            Semana {guide.activeCycle.semana_atual} de {CICLO_TOTAL_SEMANAS}
                          </span>
                          <Badge variant="secondary" className="rounded-md font-bold uppercase text-[9px] px-2 py-0.5">
                            {CICLO_STATUS_LABELS[guide.activeCycle.status]}
                          </Badge>
                        </div>
                        <Progress
                          value={(guide.activeCycle.semana_atual / CICLO_TOTAL_SEMANAS) * 100}
                          className="h-2 rounded-full"
                        />
                      </div>

                      {guide.activeCycle.habilidades_prioritarias.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest block">
                            Foco de Habilidades Prioritárias
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {guide.activeCycle.habilidades_prioritarias.map((h) => (
                              <Badge key={h} variant="outline" className="rounded-lg text-[9px] font-bold border-primary/20 text-primary bg-primary/5 px-2 py-0.5">
                                {habilidadeLabel(h)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground font-semibold py-8 text-center border border-dashed rounded-xl bg-muted/10">
                      Nenhum ciclo de evolução ativo para este aluno.
                      {isProfessor && <p className="text-[10px] text-muted-foreground mt-1">Crie um ciclo para iniciar o cronograma.</p>}
                    </div>
                  )}
                </div>

                {guide.checkpointDate && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground border-t border-border/20 pt-3 mt-4">
                    <CalendarClock className="w-3.5 h-3.5 text-primary" />
                    <span>Próximo Checkpoint: {new Date(guide.checkpointDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </Card>

              {/* Próximo foco */}
              <Card className="p-6 space-y-4 border-border/40 bg-card/45 backdrop-blur-sm shadow-card rounded-2xl animate-scale-in flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-border/30 pb-4">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-foreground">Próximo Foco Pedagógico</h2>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Direcionamento prioritário</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-foreground min-h-[60px] flex items-center">
                    {guide.proximoFoco || (
                      <span className="text-muted-foreground font-semibold italic">
                        Nenhum foco definido ainda {isProfessor ? '(defina nas configurações do ciclo).' : '.'}
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground border-t border-border/20 pt-3 mt-4">
                  <CalendarClock className="w-3.5 h-3.5 text-primary" />
                  <span>Atualizado constantemente pelo professor</span>
                </div>
              </Card>
            </div>

            {/* Planner semanal */}
            <div className="animate-scale-in">
              <WeeklyPlannerCard cicloId={guide.activeCycle?.id ?? null} editable={isProfessor} />
            </div>

            {/* Linha 3: Conquistas & Selos + Aulas Recentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conquistas */}
              <Card className="p-6 space-y-4 border-border/40 bg-card/45 backdrop-blur-sm shadow-card rounded-2xl animate-scale-in flex flex-col">
                <div className="flex items-center gap-2.5 border-b border-border/30 pb-3">
                  <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-foreground">Conquistas & Selos</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Marcos e conquistas do aluno</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                  {guide.conquistas.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-semibold text-center py-8">
                      Nenhuma conquista registrada neste plano ainda.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {guide.conquistas.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-start gap-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-3 animate-scale-in"
                        >
                          <Trophy className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0 animate-bounce" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground leading-snug">
                              {c.observacao || 'Conquista de evolução alcançada!'}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-semibold mt-1">
                              {new Date(c.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              {/* Aulas recentes */}
              <Card className="p-6 space-y-4 border-border/40 bg-card/45 backdrop-blur-sm shadow-card rounded-2xl animate-scale-in flex flex-col">
                <div className="flex items-center gap-2.5 border-b border-border/30 pb-3">
                  <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-foreground">Aulas Recentes</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Últimas aulas registradas</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                  {guide.recentClasses.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-semibold text-center py-8">
                      Nenhuma aula registrada nos logs do sistema.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {guide.recentClasses.map((cl) => (
                        <li
                          key={cl.id}
                          className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 p-3 hover:bg-muted/15 transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold text-foreground truncate">{cl.topic || 'Aula Regular'}</p>
                            <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                              {new Date(cl.class_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant="secondary" className="rounded-lg font-bold text-[8px] uppercase px-1.5 py-0.5">
                            {cl.status}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Coluna Direita: Níveis e Feedbacks (4 Colunas) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Snapshot Nível Percebido */}
            <Card className="p-6 space-y-5 border-border/40 bg-card/45 backdrop-blur-sm shadow-card rounded-2xl animate-scale-in">
              <div className="flex items-center justify-between border-b border-border/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-foreground">Snapshot Linguístico</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Desempenho avaliado por área</p>
                  </div>
                </div>
                {isProfessor && (
                  <Button size="sm" className="rounded-lg h-8 px-2.5 text-xs font-semibold" onClick={openNewFeedback}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Avaliar
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {FEEDBACK_AREAS.map((area) => {
                  const nivel = guide.snapshot[area.key];
                  return (
                    <div
                      key={area.key}
                      className="rounded-xl border border-border/40 p-4 bg-muted/10 flex items-center justify-between transition-all duration-300 hover:bg-muted/15"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block">{area.label}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {nivel ? NIVEL_LABELS[nivel] : 'Não avaliado'}
                        </span>
                      </div>
                      <LevelDots nivel={nivel} />
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground text-center font-medium">
                Composição dinâmica baseada no feedback docente mais recente.
              </p>
            </Card>

            {/* Histórico Feedbacks */}
            {isProfessor && (
              <Card className="p-6 space-y-4 border-border/40 bg-card/45 backdrop-blur-sm shadow-card rounded-2xl animate-scale-in">
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <h2 className="font-bold text-sm text-foreground">Histórico de Feedbacks (Interno)</h2>
                  <Badge variant="outline" className="rounded-md font-bold text-[9px] border-border/60">
                    {guide.feedbacks.length}
                  </Badge>
                </div>
                {guide.feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-semibold text-center py-4">
                    Nenhum parecer lançado para este aluno.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {guide.feedbacks.map((f) => (
                      <li
                        key={f.id}
                        className="rounded-xl border border-border/40 p-4 bg-muted/10 space-y-3.5 animate-scale-in"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold leading-relaxed text-foreground">
                              {f.observacao || <span className="text-muted-foreground font-semibold italic">Sem observação detalhada</span>}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1">
                              {new Date(f.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              {f.is_conquista && ' · 🏆 Conquista'}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 hover:bg-muted"
                              onClick={() => openEditFeedback(f)}
                            >
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                toast.warning('Deseja excluir este feedback?', {
                                  description: 'Esta ação não poderá ser desfeita no banco de dados.',
                                  action: {
                                    label: 'Excluir',
                                    onClick: () => {
                                      guide.deleteFeedback(f.id);
                                      toast.success('Feedback excluído!');
                                    }
                                  }
                                });
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 border-t border-border/20 pt-2">
                          {FEEDBACK_AREAS.map((area) =>
                            f[area.key] ? (
                              <Badge key={area.key} variant="outline" className="text-[9px] font-bold rounded-lg border-border/50 bg-background/50">
                                {area.label}: {NIVEL_LABELS[f[area.key]!]}
                              </Badge>
                            ) : null,
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Diálogos (apenas professor) */}
      {isProfessor && (
        <>
          <FeedbackDialog
            isOpen={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            onSave={handleSaveFeedback}
            cicloId={guide.activeCycle?.id ?? null}
            studentName={selectedStudent?.name}
            initial={editingFeedback}
          />
          <CycleDialog
            isOpen={cycleOpen}
            onClose={() => setCycleOpen(false)}
            onSave={handleSaveCycle}
            studentName={selectedStudent?.name}
            initial={editingCycle}
          />
        </>
      )}
    </div>
  );
};
