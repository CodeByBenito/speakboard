export interface Profile {
  id: string;
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  organization?: string | null;
  is_autonomous?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProfileDisplay {
  id: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  organization?: string;
  isAutonomous: boolean;
  createdAt: string;
  updatedAt?: string;
}