import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export interface TeacherWorkload {
  user_id: string;
  name: string;
  totalStudents: number;
  activeStudents: number; // com ciclo ativo
  weekClasses: number;
}

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // segunda = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Carga de trabalho por professor. Admin vê todos; professor vê a si mesmo.
// RLS já limita as linhas visíveis para não-admin.
export const useTeacherWorkload = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [rows, setRows] = useState<TeacherWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const weekStart = startOfWeek(new Date());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const [profilesRes, studentsRes, ciclosRes, classesRes] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name'),
        supabase.from('students').select('id, user_id'),
        supabase.from('ciclos').select('student_id, user_id, status').eq('status', 'ativo'),
        supabase
          .from('class_history')
          .select('id, user_id, status, class_date')
          .neq('status', 'report')
          .gte('class_date', weekStart.toISOString())
          .lt('class_date', weekEnd.toISOString()),
      ]);

      const profiles = (profilesRes.data as any[]) || [];
      const students = (studentsRes.data as any[]) || [];
      const ciclos = (ciclosRes.data as any[]) || [];
      const classes = (classesRes.data as any[]) || [];

      // Conjunto de professores: todos que aparecem em profiles/students/classes.
      const nameByUser = new Map<string, string>();
      for (const p of profiles) nameByUser.set(p.user_id, p.display_name || 'Sem nome');

      const ids = new Set<string>();
      students.forEach((s) => ids.add(s.user_id));
      classes.forEach((c) => ids.add(c.user_id));
      profiles.forEach((p) => ids.add(p.user_id));
      if (!isAdmin) {
        // não-admin: apenas o próprio (RLS já garante, mas filtramos por clareza)
        ids.clear();
        ids.add(user.id);
      }

      const activeStudentsByUser = new Map<string, Set<number>>();
      for (const c of ciclos) {
        if (!activeStudentsByUser.has(c.user_id))
          activeStudentsByUser.set(c.user_id, new Set());
        activeStudentsByUser.get(c.user_id)!.add(c.student_id);
      }

      const result: TeacherWorkload[] = Array.from(ids).map((uid) => ({
        user_id: uid,
        name: nameByUser.get(uid) || (uid === user.id ? 'Você' : 'Professor'),
        totalStudents: students.filter((s) => s.user_id === uid).length,
        activeStudents: activeStudentsByUser.get(uid)?.size || 0,
        weekClasses: classes.filter((c) => c.user_id === uid).length,
      }));

      // Ordena por total de alunos desc, oculta professores totalmente vazios.
      result.sort((a, b) => b.totalStudents - a.totalStudents);
      setRows(result.filter((r) => r.totalStudents > 0 || r.weekClasses > 0));
    } catch (error) {
      console.error('Error loading teacher workload:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, isAdmin, refetch: load };
};
