import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  adminUsers: number;
  todayRegistrations: number;
}

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStudents: 0,
    adminUsers: 0,
    todayRegistrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const loadStats = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try using the RPC function first
      try {
        const { data, error: rpcError } = await supabase.rpc('get_system_stats');
        
        if (rpcError) throw rpcError;
        
        if (data && typeof data === 'object' && data !== null) {
          const statsData = data as any;
          setStats({
            totalUsers: Number(statsData.total_users) || 0,
            totalStudents: Number(statsData.total_students) || 0,
            adminUsers: Number(statsData.admin_users) || 0,
            todayRegistrations: Number(statsData.today_registrations) || 0
          });
          setLoading(false);
          return;
        }
      } catch (rpcError) {
        console.warn('RPC function failed, falling back to individual queries:', rpcError);
      }

      // Fallback to individual queries
      const [studentsResult, adminResult, todayResult] = await Promise.all([
        supabase
          .from('students')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin'),
        supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0] + 'T00:00:00')
      ]);

      const studentsCount = studentsResult.count || 0;
      const adminCount = adminResult.count || 0;
      const todayCount = todayResult.count || 0;

      setStats({
        totalUsers: studentsCount + adminCount,
        totalStudents: studentsCount,
        adminUsers: adminCount,
        todayRegistrations: todayCount
      });
    } catch (err: any) {
      console.error('Error loading system stats:', err);
      setError(err.message || 'Erro ao carregar estatísticas do sistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user, isAdmin]);

  const refreshStats = () => {
    loadStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};