import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile, ProfileDisplay } from '@/types/Profile';
import { toast } from '@/hooks/use-toast';

const profileToDisplay = (profile: Profile): ProfileDisplay => ({
  id: profile.id,
  userId: profile.user_id,
  displayName: profile.display_name || '',
  avatarUrl: profile.avatar_url || '',
  organization: profile.organization || '',
  isAutonomous: profile.is_autonomous || false,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at
});

const displayToProfile = (display: Omit<ProfileDisplay, 'id' | 'createdAt' | 'updatedAt'>): Omit<Profile, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: display.userId,
  display_name: display.displayName || null,
  avatar_url: display.avatarUrl || null,
  organization: display.organization || null,
  is_autonomous: display.isAutonomous
});

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(profileToDisplay(data));
      } else {
        // Create default profile if none exists
        const defaultProfile = {
          userId: user.id,
          displayName: user.email?.split('@')[0] || 'Usuário',
          avatarUrl: '',
          organization: '',
          isAutonomous: false
        };
        await createProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<ProfileDisplay, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([displayToProfile(profileData)])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar perfil: " + error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setProfile(profileToDisplay(data));
        toast({
          title: "Sucesso",
          description: "Perfil criado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar perfil",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (profileData: Partial<Omit<ProfileDisplay, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!user || !profile) return;

    try {
      const updateData = {
        display_name: profileData.displayName !== undefined ? profileData.displayName : profile.displayName,
        avatar_url: profileData.avatarUrl !== undefined ? profileData.avatarUrl : profile.avatarUrl,
        organization: profileData.organization !== undefined ? profileData.organization : profile.organization,
        is_autonomous: profileData.isAutonomous !== undefined ? profileData.isAutonomous : profile.isAutonomous
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil: " + error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setProfile(profileToDisplay(data));
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar perfil",
        variant: "destructive",
      });
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da foto: " + uploadError.message,
          variant: "destructive",
        });
        return null;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no upload da foto",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile
  };
};