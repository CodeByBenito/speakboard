import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ClassSession, SessionNoteInput } from '@/types/Session';
import { toast } from 'sonner';

// Quadro de Aulas: busca as aulas (class_history) visíveis ao usuário.
// RLS já limita ao professor dono; admin enxerga todas.
// Exclui status 'report' (relatórios pedagógicos legados).
export const useClassBoard = (professorFilter?: string | null) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    if (!user) {
      setClasses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let query = supabase
        .from('class_history')
        .select('*, students(name)')
        .neq('status', 'report')
        .order('class_date', { ascending: false });

      if (professorFilter) query = query.eq('user_id', professorFilter);

      const { data, error } = await query;
      if (error) throw error;

      const mapped: ClassSession[] = (data || []).map((row: any) => ({
        id: row.id,
        student_id: row.student_id,
        user_id: row.user_id,
        class_date: row.class_date,
        status: row.status,
        topic: row.topic,
        notes: row.notes,
        contexto: row.contexto,
        vocabulario: row.vocabulario,
        pontos_atencao: row.pontos_atencao,
        missao_pos_aula: row.missao_pos_aula,
        weekly_planner_id: row.weekly_planner_id,
        conteudo_id: row.conteudo_id,
        created_at: row.created_at,
        student_name: row.students?.name ?? '—',
      }));
      setClasses(mapped);
    } catch (error) {
      console.error('Error fetching class board:', error);
      toast.error('Erro ao carregar o quadro de aulas');
    } finally {
      setLoading(false);
    }
  }, [user, professorFilter]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const updateStatus = async (id: string, status: string) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      const { error } = await supabase
        .from('class_history')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating class status:', error);
      toast.error('Erro ao mover a aula');
      fetchClasses();
    }
  };

  const saveSession = async (
    input: SessionNoteInput,
    opts: { id?: string; student_id?: number },
  ) => {
    if (!user) return;
    const payload = {
      class_date: input.class_date,
      status: input.status,
      topic: input.topic ?? null,
      contexto: input.contexto ?? null,
      vocabulario: input.vocabulario ?? null,
      pontos_atencao: input.pontos_atencao ?? null,
      missao_pos_aula: input.missao_pos_aula ?? null,
      notes: input.notes ?? null,
      weekly_planner_id: input.weekly_planner_id ?? null,
      conteudo_id: input.conteudo_id ?? null,
    };
    try {
      if (opts.id) {
        const { error } = await supabase
          .from('class_history')
          .update(payload)
          .eq('id', opts.id);
        if (error) throw error;
        toast.success('Aula atualizada');
      } else {
        if (!opts.student_id) {
          toast.error('Selecione um aluno');
          return;
        }
        const { error } = await supabase.from('class_history').insert({
          ...payload,
          student_id: opts.student_id,
          user_id: user.id,
        });
        if (error) throw error;
        toast.success('Aula criada');
      }
      await fetchClasses();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Erro ao salvar a aula');
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const { error } = await supabase.from('class_history').delete().eq('id', id);
      if (error) throw error;
      toast.success('Aula removida');
      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Erro ao remover a aula');
    }
  };

  return { classes, loading, updateStatus, saveSession, deleteClass, refetch: fetchClasses };
};
