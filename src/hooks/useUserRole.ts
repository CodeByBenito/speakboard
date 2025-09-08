import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
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

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
          setRole('user');
          setIsAdmin(false);
        } else if (data) {
          setRole(data.role);
          setIsAdmin(data.role === 'admin');
        } else {
          // No role found, default to user
          setRole('user');
          setIsAdmin(false);
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
    if (!isAdmin) {
      throw new Error('Only admins can promote users');
    }

    try {
      const { data, error } = await supabase.rpc('promote_to_admin', {
        user_email: userEmail
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  };

  return {
    role,
    isAdmin,
    loading,
    promoteToAdmin,
  };
};