import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { WeeklyPlan, WeeklyPlanInput } from '@/types/WeeklyPlanner';
import { toast } from 'sonner';

// Weekly Planner vinculado a um Ciclo.
export const useWeeklyPlanner = (cicloId?: number | null) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user || cicloId == null) {
      setPlans([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weekly_planner')
        .select('*')
        .eq('ciclo_id', cicloId)
        .order('semana', { ascending: true });
      if (error) throw error;
      setPlans((data as WeeklyPlan[]) || []);
    } catch (error) {
      console.error('Error fetching weekly planner:', error);
      toast.error('Erro ao carregar o planner semanal');
    } finally {
      setLoading(false);
    }
  }, [user, cicloId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const upsertPlan = async (input: WeeklyPlanInput, id?: number) => {
    if (!user || cicloId == null) return;
    try {
      if (id) {
        const { error } = await supabase
          .from('weekly_planner')
          .update({
            semana: input.semana,
            objetivo: input.objetivo ?? null,
            missao: input.missao ?? null,
            status: input.status ?? 'pendente',
          })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('weekly_planner').insert({
          ciclo_id: cicloId,
          user_id: user.id,
          semana: input.semana,
          objetivo: input.objetivo ?? null,
          missao: input.missao ?? null,
          status: input.status ?? 'pendente',
        });
        if (error) throw error;
      }
      toast.success('Planner salvo');
      await fetchPlans();
    } catch (error: any) {
      console.error('Error saving weekly plan:', error);
      if (error?.code === '23505') toast.error('Já existe um plano para essa semana');
      else toast.error('Erro ao salvar o planner');
    }
  };

  const toggleStatus = async (plan: WeeklyPlan) => {
    const next = plan.status === 'concluida' ? 'pendente' : 'concluida';
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, status: next } : p)));
    try {
      const { error } = await supabase
        .from('weekly_planner')
        .update({ status: next })
        .eq('id', plan.id);
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Erro ao atualizar o status');
      fetchPlans();
    }
  };

  const deletePlan = async (id: number) => {
    try {
      const { error } = await supabase.from('weekly_planner').delete().eq('id', id);
      if (error) throw error;
      toast.success('Semana removida');
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao remover a semana');
    }
  };

  return { plans, loading, upsertPlan, toggleStatus, deletePlan, refetch: fetchPlans };
};
