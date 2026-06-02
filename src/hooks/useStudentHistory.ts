import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ClassHistory {
  id: string;
  student_id: number;
  class_date: string;
  topic: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface PaymentHistory {
  id: string;
  student_id: number;
  amount: number;
  payment_date: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export const useStudentHistory = (studentId: string | number) => {
  const { user } = useAuth();
  const [classHistory, setClassHistory] = useState<ClassHistory[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user || !studentId) return;

    try {
      setLoading(true);

      const numericStudentId = typeof studentId === 'string' ? parseInt(studentId) : studentId;

      // Fetch class history
      const { data: classes, error: classError } = await supabase
        .from('class_history')
        .select('*')
        .eq('student_id', numericStudentId)
        .order('class_date', { ascending: false });

      if (classError) throw classError;

      // Fetch payment history
      const { data: payments, error: paymentError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('student_id', numericStudentId)
        .order('payment_date', { ascending: false });

      if (paymentError) throw paymentError;

      setClassHistory(classes || []);
      setPaymentHistory(payments || []);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const addClassRecord = async (data: {
    class_date: string;
    topic?: string;
    notes?: string;
    status?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('class_history').insert({
        student_id: Number(studentId),
        user_id: user.id,
        class_date: data.class_date,
        topic: data.topic || null,
        notes: data.notes || null,
        status: data.status || 'completed',
      });

      if (error) throw error;

      toast.success('Aula registrada com sucesso');
      await fetchHistory();
    } catch (error: any) {
      console.error('Error adding class record:', error);
      toast.error('Erro ao registrar aula');
    }
  };

  const addPaymentRecord = async (data: {
    amount: number;
    payment_date: string;
    due_date?: string;
    status?: string;
    notes?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('payment_history').insert({
        student_id: Number(studentId),
        user_id: user.id,
        amount: data.amount,
        payment_date: data.payment_date,
        due_date: data.due_date || null,
        status: data.status || 'paid',
        notes: data.notes || null,
      });

      if (error) throw error;

      toast.success('Pagamento registrado com sucesso');
      await fetchHistory();
    } catch (error: any) {
      console.error('Error adding payment record:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  const addReportRecord = async (data: {
    report_date: string;
    title: string;
    content: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('class_history').insert({
        student_id: Number(studentId),
        user_id: user.id,
        class_date: data.report_date,
        topic: data.title || null,
        notes: data.content || null,
        status: 'report',
      });

      if (error) throw error;

      toast.success('Relatório registrado com sucesso');
      await fetchHistory();
    } catch (error: any) {
      console.error('Error adding report record:', error);
      toast.error('Erro ao registrar relatório');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, studentId]);

  return {
    classHistory,
    paymentHistory,
    loading,
    addClassRecord,
    addPaymentRecord,
    addReportRecord,
    refetch: fetchHistory,
  };
};
