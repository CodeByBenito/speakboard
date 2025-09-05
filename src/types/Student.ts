export interface Student {
  id: string;
  name: string;
  age: number;
  contact: string; // telefone ou email
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