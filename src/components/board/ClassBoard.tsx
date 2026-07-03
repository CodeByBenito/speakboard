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
        <div className="text-sm text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className={`rounded-xl border p-3 min-h-[200px] transition-colors ${
                  dragOverCol === col.status
                    ? 'border-primary bg-primary/5'
                    : 'border-border/60 bg-card/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-sm">{col.label}</h2>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>

                <div className="space-y-2">
                  {items.map((c) => (
                    <Card
                      key={c.id}
                      draggable
                      onDragStart={() => setDraggingId(c.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => openEdit(c)}
                      className={`p-3 cursor-pointer hover:border-primary/50 transition-colors ${
                        draggingId === c.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {c.student_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.topic || 'Sem tema'}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {new Date(c.class_date).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Remover esta aula?')) deleteClass(c.id);
                          }}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sem aulas
                    </p>
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
