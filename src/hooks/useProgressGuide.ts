import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCycles } from './useCycles';
import { useFeedbacks } from './useFeedbacks';

export interface RecentClass {
  id: string;
  class_date: string;
  topic: string | null;
  notes: string | null;
  status: string;
}

// Guia de Progresso: NÃO guarda dados duplicados.
// Ele COMPÕE a visão a partir de Ciclo (useCycles) + Feedback (useFeedbacks)
// + Aula (class_history). Os únicos campos editáveis próprios do guia
// (próximo foco e data do checkpoint) vivem no ciclo ativo.
export const useProgressGuide = (studentId?: string | number | null) => {
  const { user } = useAuth();
  const cycles = useCycles(studentId);
  const feedbacks = useFeedbacks(studentId);
  const [recentClasses, setRecentClasses] = useState<RecentClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const numericStudentId =
    studentId == null ? null : typeof studentId === 'string' ? parseInt(studentId) : studentId;

  const fetchClasses = useCallback(async () => {
    if (!user || numericStudentId == null || Number.isNaN(numericStudentId)) {
      setRecentClasses([]);
      setLoadingClasses(false);
      return;
    }
    try {
      setLoadingClasses(true);
      const { data, error } = await supabase
        .from('class_history')
        .select('id, class_date, topic, notes, status')
        .eq('student_id', numericStudentId)
        .neq('status', 'report') // 'report' são relatórios antigos, não aulas
        .order('class_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentClasses((data as RecentClass[]) || []);
    } catch (error) {
      console.error('Error fetching recent classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  }, [user, numericStudentId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const activeCycle = cycles.activeCycle;

  return {
    // composição
    activeCycle,
    allCycles: cycles.cycles,
    snapshot: feedbacks.snapshot,
    conquistas: feedbacks.conquistas,
    feedbacks: feedbacks.feedbacks,
    latestFeedback: feedbacks.latest,
    proximoFoco: activeCycle?.proximo_foco ?? null,
    checkpointDate: activeCycle?.checkpoint_date ?? null,
    recentClasses,
    loading: cycles.loading || feedbacks.loading || loadingClasses,
    // ações (delegadas)
    addCycle: cycles.addCycle,
    updateCycle: cycles.updateCycle,
    deleteCycle: cycles.deleteCycle,
    addFeedback: feedbacks.addFeedback,
    updateFeedback: feedbacks.updateFeedback,
    deleteFeedback: feedbacks.deleteFeedback,
    refetch: async () => {
      await Promise.all([cycles.refetch(), feedbacks.refetch(), fetchClasses()]);
    },
  };
};
