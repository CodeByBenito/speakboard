import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardCheckpoint {
  ciclo_id: number;
  student_name: string;
  checkpoint_date: string;
  objetivo: string | null;
}

export interface DashboardClass {
  id: string;
  class_date: string;
  status: string;
  topic: string | null;
  student_name: string;
}

export interface DashboardFinance {
  student_name: string;
  payment_status: string;
  payment_amount: number | null;
  payment_due_date: string | null;
}

export interface DashboardData {
  totalStudents: number;
  cycleStatus: { ativo: number; concluido: number; renovado: number; semCiclo: number };
  weekClasses: DashboardClass[];
  financePending: DashboardFinance[];
  upcomingCheckpoints: DashboardCheckpoint[];
}

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // segunda = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const useDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalStudents: 0,
    cycleStatus: { ativo: 0, concluido: 0, renovado: 0, semCiclo: 0 },
    weekClasses: [],
    financePending: [],
    upcomingCheckpoints: [],
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const in14 = new Date(today);
      in14.setDate(in14.getDate() + 14);

      const [studentsRes, ciclosRes, classesRes] = await Promise.all([
        supabase.from('students').select('id, name, payment_status, payment_amount, payment_due_date'),
        supabase.from('ciclos').select('student_id, status, checkpoint_date, objetivo, students(name)'),
        supabase
          .from('class_history')
          .select('id, class_date, status, topic, students(name)')
          .neq('status', 'report')
          .gte('class_date', weekStart.toISOString())
          .lt('class_date', weekEnd.toISOString())
          .order('class_date', { ascending: true }),
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (ciclosRes.error) throw ciclosRes.error;
      if (classesRes.error) throw classesRes.error;

      const students = studentsRes.data || [];
      const ciclos = (ciclosRes.data as any[]) || [];
      const classes = (classesRes.data as any[]) || [];

      // Status de ciclo por aluno (prioriza ativo)
      const statusByStudent = new Map<number, string>();
      for (const c of ciclos) {
        const prev = statusByStudent.get(c.student_id);
        if (!prev || c.status === 'ativo') statusByStudent.set(c.student_id, c.status);
      }
      const cycleStatus = { ativo: 0, concluido: 0, renovado: 0, semCiclo: 0 };
      for (const s of students) {
        const st = statusByStudent.get(s.id);
        if (st === 'ativo') cycleStatus.ativo++;
        else if (st === 'concluido') cycleStatus.concluido++;
        else if (st === 'renovado') cycleStatus.renovado++;
        else cycleStatus.semCiclo++;
      }

      const financePending: DashboardFinance[] = students
        .filter((s: any) => s.payment_status === 'pending' || s.payment_status === 'overdue')
        .map((s: any) => ({
          student_name: s.name,
          payment_status: s.payment_status,
          payment_amount: s.payment_amount,
          payment_due_date: s.payment_due_date,
        }));

      const upcomingCheckpoints: DashboardCheckpoint[] = ciclos
        .filter((c: any) => {
          if (!c.checkpoint_date || c.status !== 'ativo') return false;
          const d = new Date(c.checkpoint_date + 'T00:00:00');
          return d >= today && d <= in14;
        })
        .map((c: any) => ({
          ciclo_id: c.student_id,
          student_name: c.students?.name ?? '—',
          checkpoint_date: c.checkpoint_date,
          objetivo: c.objetivo,
        }))
        .sort((a, b) => a.checkpoint_date.localeCompare(b.checkpoint_date));

      const weekClasses: DashboardClass[] = classes.map((c: any) => ({
        id: c.id,
        class_date: c.class_date,
        status: c.status,
        topic: c.topic,
        student_name: c.students?.name ?? '—',
      }));

      setData({
        totalStudents: students.length,
        cycleStatus,
        weekClasses,
        financePending,
        upcomingCheckpoints,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refetch: load };
};
