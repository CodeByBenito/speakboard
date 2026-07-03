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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Guia de Progresso
          </h1>
          <p className="text-sm text-muted-foreground">
            Composto automaticamente a partir de Ciclo, Feedback e Aulas.
          </p>
        </div>

        {/* Alternância de visão */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card/40">
          <button
            onClick={() => setView('professor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              isProfessor
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Professor
          </button>
          <button
            onClick={() => setView('aluno')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              !isProfessor
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-4 h-4" /> Aluno
          </button>
        </div>
      </div>

      {/* Seletor de aluno */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Aluno:</span>
        <Select
          value={selectedStudentId ?? undefined}
          onValueChange={(v) => setSelectedStudentId(v)}
          disabled={studentsLoading || students.length === 0}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder={studentsLoading ? 'Carregando...' : 'Selecione um aluno'} />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isProfessor && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-2 text-xs text-muted-foreground">
          Você está vendo a <strong>visão do aluno</strong> (somente leitura). Campos
          internos do professor ficam ocultos.
        </div>
      )}

      {!selectedStudentId ? (
        <Card className="p-10 text-center text-muted-foreground">
          {students.length === 0
            ? 'Nenhum aluno cadastrado ainda. Cadastre um aluno no módulo Alunos.'
            : 'Selecione um aluno para ver o Guia de Progresso.'}
        </Card>
      ) : (
        <>
          {/* Ciclo atual */}
          <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Ciclo atual (Evolution Plan)</h2>
              </div>
              {isProfessor && (
                <div className="flex gap-2">
                  {guide.activeCycle && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditCycle(guide.activeCycle!)}
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                  )}
                  <Button size="sm" onClick={openNewCycle}>
                    <Plus className="w-4 h-4 mr-1" /> Novo ciclo
                  </Button>
                </div>
              )}
            </div>

            {guide.activeCycle ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Objetivo</p>
                  <p className="font-medium">
                    {guide.activeCycle.objetivo || 'Sem objetivo definido'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Semana {guide.activeCycle.semana_atual} de {CICLO_TOTAL_SEMANAS}
                    </span>
                    <Badge variant="secondary">
                      {CICLO_STATUS_LABELS[guide.activeCycle.status]}
                    </Badge>
                  </div>
                  <Progress
                    value={(guide.activeCycle.semana_atual / CICLO_TOTAL_SEMANAS) * 100}
                  />
                </div>

                {guide.activeCycle.habilidades_prioritarias.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Habilidades prioritárias
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {guide.activeCycle.habilidades_prioritarias.map((h) => (
                        <Badge key={h} variant="outline">
                          {habilidadeLabel(h)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {guide.checkpointDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="w-4 h-4" />
                    Próximo checkpoint:{' '}
                    {new Date(guide.checkpointDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Nenhum ciclo ativo.{' '}
                {isProfessor && 'Crie um ciclo para começar o acompanhamento.'}
              </div>
            )}
          </Card>

          {/* Planner semanal (vinculado ao ciclo ativo) */}
          <WeeklyPlannerCard cicloId={guide.activeCycle?.id ?? null} editable={isProfessor} />

          {/* Snapshot das áreas */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Nível percebido (snapshot)</h2>
              {isProfessor && (
                <Button size="sm" onClick={openNewFeedback}>
                  <Plus className="w-4 h-4 mr-1" /> Registrar feedback
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEEDBACK_AREAS.map((area) => {
                const nivel = guide.snapshot[area.key];
                return (
                  <div
                    key={area.key}
                    className="rounded-lg border border-border/60 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{area.label}</span>
                      <LevelDots nivel={nivel} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {nivel ? NIVEL_LABELS[nivel] : 'Sem avaliação'}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Composto a partir do feedback mais recente de cada área.
            </p>
          </Card>

          {/* Próximo foco */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Próximo foco</h2>
            </div>
            <p className="text-sm">
              {guide.proximoFoco || (
                <span className="text-muted-foreground">
                  Ainda não definido{isProfessor ? ' (edite o ciclo para definir).' : '.'}
                </span>
              )}
            </p>
          </Card>

          {/* Conquistas */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold">Conquistas</h2>
            </div>
            {guide.conquistas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conquista registrada ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {guide.conquistas.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3"
                  >
                    <Trophy className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm">
                        {c.observacao || 'Conquista registrada'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Aulas recentes (composição a partir de Aula) */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Aulas recentes</h2>
            </div>
            {guide.recentClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma aula registrada.</p>
            ) : (
              <ul className="space-y-2">
                {guide.recentClasses.map((cl) => (
                  <li
                    key={cl.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{cl.topic || 'Aula'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cl.class_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary">{cl.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Histórico de feedbacks — apenas visão do professor (campo interno) */}
          {isProfessor && (
            <Card className="p-5 space-y-3">
              <h2 className="font-semibold">Histórico de feedbacks (interno)</h2>
              {guide.feedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum feedback registrado ainda.
                </p>
              ) : (
                <ul className="space-y-2">
                  {guide.feedbacks.map((f) => (
                    <li
                      key={f.id}
                      className="rounded-lg border border-border/60 p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm">
                            {f.observacao || (
                              <span className="text-muted-foreground">Sem observação</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(f.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                            {f.is_conquista && ' · Conquista'}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openEditFeedback(f)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              if (window.confirm('Excluir este feedback?'))
                                guide.deleteFeedback(f.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {FEEDBACK_AREAS.map((area) =>
                          f[area.key] ? (
                            <Badge key={area.key} variant="outline" className="text-xs">
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
        </>
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
