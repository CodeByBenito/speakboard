import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClassBoard } from '@/hooks/useClassBoard';
import { useStudents } from '@/hooks/useStudents';
import { useUserRole } from '@/hooks/useUserRole';
import { useContents } from '@/hooks/useContents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, CalendarDays, GripVertical } from 'lucide-react';
import {
  BOARD_COLUMNS,
  ClassSession,
  SessionNoteInput,
  normalizeClassStatus,
} from '@/types/Session';
import { SessionNoteDialog } from './SessionNoteDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Professor {
  user_id: string;
  name: string;
}

export const ClassBoard = () => {
  const { isAdmin } = useUserRole();
  const { students } = useStudents();
  const { contents } = useContents();
  const [professorFilter, setProfessorFilter] = useState<string | null>(null);
  const { classes, loading, updateStatus, saveSession, deleteClass } =
    useClassBoard(professorFilter);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassSession | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [boardView, setBoardView] = useState<'kanban' | 'calendar'>('kanban');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const openNewPrefilled = (dateStr: string) => {
    setEditing({
      class_date: dateStr,
      status: 'scheduled',
      student_name: '',
    } as any);
    setDialogOpen(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('user_id, display_name');
      if (data) {
        setProfessors(
          data.map((p: any) => ({
            user_id: p.user_id,
            name: p.display_name || 'Sem nome',
          })),
        );
      }
    })();
  }, [isAdmin]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: ClassSession) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const handleSave = async (input: SessionNoteInput, opts: { id?: string; student_id?: number }) => {
    await saveSession(input, opts);
  };

  const onDrop = (status: string) => {
    if (draggingId) updateStatus(draggingId, status);
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-none px-4 md:px-10 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border/30 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-primary" />
            Agenda &amp; Quadro de Aulas
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            Gerencie o agendamento de aulas e acompanhe as aulas ministradas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de visualização (Abas) */}
          <div className="flex items-center gap-1 rounded-xl border border-border/40 p-1.5 bg-card/45 backdrop-blur-md shadow-soft">
            <button
              onClick={() => setBoardView('kanban')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                boardView === 'kanban'
                  ? "bg-primary text-white shadow-soft scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Quadro Kanban
            </button>
            <button
              onClick={() => setBoardView('calendar')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                boardView === 'calendar'
                  ? "bg-primary text-white shadow-soft scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Calendário
            </button>
          </div>

          {isAdmin && (
            <Select
              value={professorFilter ?? 'all'}
              onValueChange={(v) => setProfessorFilter(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-44 border-border/40 bg-card/40 focus:ring-primary/50 text-xs font-semibold h-9 rounded-lg">
                <SelectValue placeholder="Professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Todos os professores</SelectItem>
                {professors.map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={openNew} className="rounded-lg h-9 text-xs font-semibold">
            <Plus className="w-4 h-4 mr-1" /> Nova Aula
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-semibold text-muted-foreground">Carregando quadro...</p>
        </div>
      ) : (
        <>
          {boardView === 'kanban' && (
            <div className="flex md:grid md:grid-cols-3 overflow-x-auto pb-4 gap-4 md:overflow-x-visible md:pb-0 scrollbar-thin">
              {BOARD_COLUMNS.map((col) => {
                const items = classes.filter(
                  (c) => normalizeClassStatus(c.status) === col.status,
                );
                return (
                  <div
                    key={col.status}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCol(col.status);
                    }}
                    onDragLeave={() => setDragOverCol((s) => (s === col.status ? null : s))}
                    onDrop={() => onDrop(col.status)}
                    className={cn(
                      "rounded-2xl border p-4 min-h-[350px] w-[280px] shrink-0 md:w-auto transition-all duration-300 bg-card/30 backdrop-blur-md shadow-soft flex flex-col",
                      dragOverCol === col.status
                        ? 'border-primary bg-primary/5 shadow-medium'
                        : 'border-border/60'
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-sm text-foreground">{col.label}</h2>
                      <Badge variant="secondary" className="rounded-lg font-bold text-[10px] px-2 py-0.5">
                        {items.length}
                      </Badge>
                    </div>

                    <div className="space-y-3 flex-1 flex flex-col">
                      {items.map((c) => (
                        <Card
                          key={c.id}
                          draggable
                          onDragStart={() => setDraggingId(c.id)}
                          onDragEnd={() => setDraggingId(null)}
                          onClick={() => openEdit(c)}
                          className={cn(
                            "p-4 cursor-pointer border-border/55 bg-card/85 backdrop-blur-sm shadow-card hover:border-primary/40 hover:shadow-medium hover-lift transition-all duration-300 rounded-xl group flex flex-col gap-2.5",
                            draggingId === c.id ? 'opacity-50 scale-95' : ''
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors cursor-grab" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {c.student_name}
                              </p>
                              <p className="text-xs text-muted-foreground font-semibold truncate mt-0.5">
                                {c.topic || 'Sem tema definido'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.warning('Tem certeza de que deseja remover esta aula?', {
                                  description: 'Esta ação não pode ser desfeita.',
                                  action: {
                                    label: 'Remover',
                                    onClick: () => {
                                      deleteClass(c.id);
                                      toast.success('Aula removida com sucesso!');
                                    }
                                  }
                                });
                              }}
                              className="text-muted-foreground hover:text-destructive shrink-0 transition-colors p-1 rounded-md hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10px] mt-1 text-muted-foreground">
                            <span className="font-semibold bg-muted/60 px-2 py-0.5 rounded-md border border-border/50 flex items-center gap-1.5 animate-fade-in">
                              <CalendarDays className="w-3 h-3 text-primary" />
                              {new Date(c.class_date).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </Card>
                      ))}
                      {items.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-border/50 rounded-xl bg-muted/10 text-muted-foreground text-center">
                          <CalendarDays className="w-8 h-8 text-muted-foreground/30 mb-2" />
                          <p className="text-[11px] font-semibold">Sem aulas cadastradas</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {boardView === 'calendar' && (
            <Card className="p-6 border-border/40 bg-card/45 backdrop-blur-sm shadow-card rounded-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-foreground capitalize">
                  {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-semibold"
                    onClick={() => {
                      const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                      setCurrentMonth(prev);
                    }}
                  >
                    Mês Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-semibold"
                    onClick={() => {
                      const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                      setCurrentMonth(next);
                    }}
                  >
                    Próximo Mês
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2 text-center border-b border-border/20 pb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <span key={d} className="text-xs font-bold text-muted-foreground uppercase py-1">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2.5 min-h-[350px]">
                {getDaysInMonth(currentMonth).map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="bg-muted/5 rounded-xl border border-transparent" />;
                  }

                  const dayClasses = classes.filter(c => {
                    const classDate = new Date(c.class_date);
                    return classDate.getDate() === day.getDate() &&
                           classDate.getMonth() === day.getMonth() &&
                           classDate.getFullYear() === day.getFullYear();
                  });

                  const isToday = new Date().toDateString() === day.toDateString();

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => {
                        const yyyy = day.getFullYear();
                        const mm = String(day.getMonth() + 1).padStart(2, '0');
                        const dd = String(day.getDate()).padStart(2, '0');
                        openNewPrefilled(`${yyyy}-${mm}-${dd}T09:00:00`);
                      }}
                      className={cn(
                        "rounded-xl border p-2 flex flex-col min-h-[100px] justify-between cursor-pointer transition-all duration-300 hover:border-primary/40 hover:bg-muted/10",
                        isToday ? "border-primary bg-primary/5 shadow-soft" : "border-border/40 bg-muted/5"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-bold self-end pr-1",
                        isToday ? "text-primary font-black" : "text-muted-foreground"
                      )}>
                        {day.getDate()}
                      </span>

                      <div className="space-y-1.5 mt-1 flex-1 overflow-y-auto max-h-[80px] scrollbar-none">
                        {dayClasses.map(c => (
                          <div
                            key={c.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(c);
                            }}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-primary/20 bg-primary/10 text-primary truncate hover:scale-105 transition-transform"
                            title={`${c.student_name} - ${c.topic || 'Sem tema'}`}
                          >
                            {c.student_name.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      <SessionNoteDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={editing}
        students={students}
        contents={contents}
      />
    </div>
  );
};
