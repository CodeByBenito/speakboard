import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole('user');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user');
          setIsAdmin(false);
        } else {
          const userRole = data?.role as UserRole || 'user';
          setRole(userRole);
          setIsAdmin(userRole === 'admin');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const promoteToAdmin = async (userEmail: string) => {
    try {
      const { data, error } = await supabase.rpc('promote_to_admin', {
        user_email: userEmail
      });

      if (error) {
        throw error;
      }

      return { success: data, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    role,
    isAdmin,
    loading,
    promoteToAdmin,
  };
};