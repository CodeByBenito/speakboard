// Speak&Go Evolution Method — Weekly Planner (vinculado ao Ciclo)

export const PLANNER_STATUS_VALUES = ['pendente', 'concluida'] as const;
export type PlannerStatus = (typeof PLANNER_STATUS_VALUES)[number];

export const PLANNER_STATUS_LABELS: Record<PlannerStatus, string> = {
  pendente: 'Pendente',
  concluida: 'Concluída',
};

export interface WeeklyPlan {
  id: number;
  ciclo_id: number;
  user_id?: string;
  semana: number; // 1..8
  objetivo: string | null;
  missao: string | null;
  status: PlannerStatus;
  created_at: string;
  updated_at?: string;
}

export interface WeeklyPlanInput {
  semana: number;
  objetivo?: string | null;
  missao?: string | null;
  status?: PlannerStatus;
}
