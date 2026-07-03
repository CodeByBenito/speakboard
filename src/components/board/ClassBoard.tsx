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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Quadro de Aulas
          </h1>
          <p className="text-sm text-muted-foreground">
            Arraste os cards entre as colunas para mudar o status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Select
              value={professorFilter ?? 'all'}
              onValueChange={(v) => setProfessorFilter(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os professores</SelectItem>
                {professors.map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Nova aula
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-semibold text-muted-foreground">Carregando quadro...</p>
        </div>
      ) : (
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
