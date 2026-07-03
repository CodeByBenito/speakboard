// Speak&Go Evolution Method — Ciclo (Evolution Plan)

export const CICLO_STATUS_VALUES = ['ativo', 'concluido', 'renovado'] as const;
export type CicloStatus = (typeof CICLO_STATUS_VALUES)[number];

export const CICLO_STATUS_LABELS: Record<CicloStatus, string> = {
  ativo: 'Ativo',
  concluido: 'Concluído',
  renovado: 'Renovado',
};

// Habilidades prioritárias possíveis num ciclo.
export const HABILIDADES = [
  { key: 'speaking', label: 'Speaking' },
  { key: 'listening', label: 'Listening' },
  { key: 'vocabulary', label: 'Vocabulário' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'pronunciation', label: 'Pronunciation' },
] as const;

export type HabilidadeKey = (typeof HABILIDADES)[number]['key'];

export const CICLO_TOTAL_SEMANAS = 8;

export interface Cycle {
  id: number;
  student_id: number;
  user_id?: string;
  objetivo: string | null;
  semana_atual: number; // 1..8
  habilidades_prioritarias: string[];
  status: CicloStatus;
  proximo_foco: string | null; // campo editável do Guia de Progresso
  checkpoint_date: string | null; // data do próximo checkpoint
  created_at: string;
  updated_at?: string;
}

export interface CycleInput {
  objetivo?: string | null;
  semana_atual?: number;
  habilidades_prioritarias?: string[];
  status?: CicloStatus;
  proximo_foco?: string | null;
  checkpoint_date?: string | null;
}
