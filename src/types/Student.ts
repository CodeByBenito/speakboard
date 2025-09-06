export interface Student {
  id: number;
  user_id?: string;
  name: string;
  age: number;
  contact: string; // telefone ou email
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  total_classes: number;
  completed_classes: number;
  last_class_date?: string | null;
  created_at: string;
  updated_at?: string;
}

// Interface for display (camelCase) - matches the existing component interfaces
export interface StudentDisplay {
  id: string;
  name: string;
  age: number;
  contact: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  totalClasses: number;
  completedClasses: number;
  nextClassDate?: string;
  createdAt: string;
}

export interface ClassSession {
  id: string;
  studentId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export type StudentLevel = Student['level'];