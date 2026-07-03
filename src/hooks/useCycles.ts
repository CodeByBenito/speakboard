import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Cycle, CycleInput } from '@/types/Cycle';
import { toast } from 'sonner';

// Hook de Ciclos (Evolution Plan) vinculados a um aluno.
// Segue o padrão de acesso direto ao supabase usado no restante do projeto.
export const useCycles = (studentId?: string | number | null) => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  const numericStudentId =
    studentId == null ? null : typeof studentId === 'string' ? parseInt(studentId) : studentId;

  const fetchCycles = useCallback(async () => {
    if (!user || numericStudentId == null || Number.isNaN(numericStudentId)) {
      setCycles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ciclos')
        .select('*')
        .eq('student_id', numericStudentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCycles((data as Cycle[]) || []);
    } catch (error) {
      console.error('Error fetching cycles:', error);
      toast.error('Erro ao carregar ciclos');
    } finally {
      setLoading(false);
    }
  }, [user, numericStudentId]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  // O ciclo ativo é o mais recente com status 'ativo'.
  const activeCycle = cycles.find((c) => c.status === 'ativo') || null;

  const addCycle = async (input: CycleInput) => {
    if (!user || numericStudentId == null) return null;
    try {
      const { data, error } = await supabase
        .from('ciclos')
        .insert({
          student_id: numericStudentId,
          user_id: user.id,
          objetivo: input.objetivo ?? null,
          semana_atual: input.semana_atual ?? 1,
          habilidades_prioritarias: input.habilidades_prioritarias ?? [],
          status: input.status ?? 'ativo',
          proximo_foco: input.proximo_foco ?? null,
          checkpoint_date: input.checkpoint_date ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Ciclo criado com sucesso');
      await fetchCycles();
      return data as Cycle;
    } catch (error) {
      console.error('Error adding cycle:', error);
      toast.error('Erro ao criar ciclo');
      return null;
    }
  };

  const updateCycle = async (id: number, input: CycleInput) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('ciclos')
        .update({
          ...(input.objetivo !== undefined ? { objetivo: input.objetivo } : {}),
          ...(input.semana_atual !== undefined ? { semana_atual: input.semana_atual } : {}),
          ...(input.habilidades_prioritarias !== undefined
            ? { habilidades_prioritarias: input.habilidades_prioritarias }
            : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.proximo_foco !== undefined ? { proximo_foco: input.proximo_foco } : {}),
          ...(input.checkpoint_date !== undefined ? { checkpoint_date: input.checkpoint_date } : {}),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Ciclo atualizado');
      await fetchCycles();
    } catch (error) {
      console.error('Error updating cycle:', error);
      toast.error('Erro ao atualizar ciclo');
    }
  };

  const deleteCycle = async (id: number) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('ciclos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Ciclo removido');
      await fetchCycles();
    } catch (error) {
      console.error('Error deleting cycle:', error);
      toast.error('Erro ao remover ciclo');
    }
  };

  return {
    cycles,
    activeCycle,
    loading,
    addCycle,
    updateCycle,
    deleteCycle,
    refetch: fetchCycles,
  };
};
