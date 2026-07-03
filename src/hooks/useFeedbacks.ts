import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import {
  Feedback,
  FeedbackInput,
  FeedbackSnapshot,
  FEEDBACK_AREAS,
} from '@/types/Feedback';
import { toast } from 'sonner';

// Compõe o snapshot das áreas a partir do feedback mais recente que preencheu
// cada área (feedbacks já vêm ordenados por data desc).
const composeSnapshot = (feedbacks: Feedback[]): FeedbackSnapshot => {
  const snapshot = Object.fromEntries(
    FEEDBACK_AREAS.map((a) => [a.key, null]),
  ) as FeedbackSnapshot;

  for (const area of FEEDBACK_AREAS) {
    const found = feedbacks.find((f) => f[area.key] != null);
    if (found) snapshot[area.key] = found[area.key];
  }
  return snapshot;
};

export const useFeedbacks = (studentId?: string | number | null) => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const numericStudentId =
    studentId == null ? null : typeof studentId === 'string' ? parseInt(studentId) : studentId;

  const fetchFeedbacks = useCallback(async () => {
    if (!user || numericStudentId == null || Number.isNaN(numericStudentId)) {
      setFeedbacks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('student_id', numericStudentId)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks((data as Feedback[]) || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Erro ao carregar feedbacks');
    } finally {
      setLoading(false);
    }
  }, [user, numericStudentId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const addFeedback = async (input: FeedbackInput) => {
    if (!user || numericStudentId == null) return;
    try {
      const { error } = await supabase.from('feedbacks').insert({
        student_id: numericStudentId,
        user_id: user.id,
        ciclo_id: input.ciclo_id ?? null,
        observacao: input.observacao ?? null,
        data: input.data,
        nivel_speaking: input.nivel_speaking ?? null,
        nivel_listening: input.nivel_listening ?? null,
        nivel_vocabulary: input.nivel_vocabulary ?? null,
        nivel_grammar: input.nivel_grammar ?? null,
        nivel_pronunciation: input.nivel_pronunciation ?? null,
        nivel_confianca: input.nivel_confianca ?? null,
        is_conquista: input.is_conquista ?? false,
      });

      if (error) throw error;
      toast.success('Feedback registrado');
      await fetchFeedbacks();
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast.error('Erro ao registrar feedback');
    }
  };

  const updateFeedback = async (id: number, input: FeedbackInput) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({
          ciclo_id: input.ciclo_id ?? null,
          observacao: input.observacao ?? null,
          data: input.data,
          nivel_speaking: input.nivel_speaking ?? null,
          nivel_listening: input.nivel_listening ?? null,
          nivel_vocabulary: input.nivel_vocabulary ?? null,
          nivel_grammar: input.nivel_grammar ?? null,
          nivel_pronunciation: input.nivel_pronunciation ?? null,
          nivel_confianca: input.nivel_confianca ?? null,
          is_conquista: input.is_conquista ?? false,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Feedback atualizado');
      await fetchFeedbacks();
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Erro ao atualizar feedback');
    }
  };

  const deleteFeedback = async (id: number) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('feedbacks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Feedback removido');
      await fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Erro ao remover feedback');
    }
  };

  const snapshot = composeSnapshot(feedbacks);
  const conquistas = feedbacks.filter((f) => f.is_conquista);
  const latest = feedbacks[0] || null;

  return {
    feedbacks,
    snapshot,
    conquistas,
    latest,
    loading,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    refetch: fetchFeedbacks,
  };
};
