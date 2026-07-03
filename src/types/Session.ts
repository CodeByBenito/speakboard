// Speak&Go Evolution Method — Aula (sessão) + Session Note
// Estende o registro em class_history com campos de nota de sessão.

export const CLASS_STATUS_VALUES = [
  'scheduled',
  'completed',
  'rescheduled',
  'cancelled',
] as const;

export type ClassStatus = (typeof CLASS_STATUS_VALUES)[number];

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  scheduled: 'Agendada',
  completed: 'Concluída',
  rescheduled: 'Remarcada',
  cancelled: 'Cancelada',
};

// Colunas exibidas no Quadro de Aulas (kanban).
export const BOARD_COLUMNS: { status: ClassStatus; label: string }[] = [
  { status: 'scheduled', label: 'Agendada' },
  { status: 'completed', label: 'Concluída' },
  { status: 'rescheduled', label: 'Remarcada' },
];

// Normaliza status legados/desconhecidos para uma coluna do quadro.
export const normalizeClassStatus = (status: string): ClassStatus => {
  if (status === 'scheduled') return 'scheduled';
  if (status === 'rescheduled') return 'rescheduled';
  if (status === 'cancelled') return 'cancelled';
  return 'completed';
};

export interface ClassSession {
  id: string;
  student_id: number;
  user_id?: string;
  class_date: string;
  status: string;
  topic: string | null;
  notes: string | null;
  contexto: string | null;
  vocabulario: string | null;
  pontos_atencao: string | null;
  missao_pos_aula: string | null;
  weekly_planner_id: number | null;
  conteudo_id: number | null;
  created_at: string;
  student_name?: string;
}

export interface SessionNoteInput {
  class_date: string;
  status: string;
  topic?: string | null;
  contexto?: string | null;
  vocabulario?: string | null;
  pontos_atencao?: string | null;
  missao_pos_aula?: string | null;
  notes?: string | null;
  weekly_planner_id?: number | null;
  conteudo_id?: number | null;
}
