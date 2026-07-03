// Speak&Go Evolution Method — Feedback com "nível percebido"
// Escala qualitativa (não numérica).

export const NIVEL_VALUES = [
  'comecando',
  'em_construcao',
  'confortavel',
  'confiante',
] as const;

export type NivelPercebido = (typeof NIVEL_VALUES)[number];

export const NIVEL_LABELS: Record<NivelPercebido, string> = {
  comecando: 'Começando',
  em_construcao: 'Em construção',
  confortavel: 'Confortável',
  confiante: 'Confiante',
};

// Usado para ordenar/compor snapshots e definir a intensidade visual (1 a 4).
export const NIVEL_ORDER: Record<NivelPercebido, number> = {
  comecando: 1,
  em_construcao: 2,
  confortavel: 3,
  confiante: 4,
};

// As 6 áreas avaliadas no feedback (chave = coluna no banco).
export const FEEDBACK_AREAS = [
  { key: 'nivel_speaking', label: 'Speaking' },
  { key: 'nivel_listening', label: 'Listening' },
  { key: 'nivel_vocabulary', label: 'Vocabulário' },
  { key: 'nivel_grammar', label: 'Grammar' },
  { key: 'nivel_pronunciation', label: 'Pronunciation' },
  { key: 'nivel_confianca', label: 'Confiança' },
] as const;

export type FeedbackAreaKey = (typeof FEEDBACK_AREAS)[number]['key'];

export interface Feedback {
  id: number;
  student_id: number;
  ciclo_id: number | null;
  user_id?: string;
  observacao: string | null;
  data: string; // date (YYYY-MM-DD)
  nivel_speaking: NivelPercebido | null;
  nivel_listening: NivelPercebido | null;
  nivel_vocabulary: NivelPercebido | null;
  nivel_grammar: NivelPercebido | null;
  nivel_pronunciation: NivelPercebido | null;
  nivel_confianca: NivelPercebido | null;
  is_conquista: boolean;
  created_at: string;
  updated_at?: string;
}

// Snapshot composto: nível atual por área (o mais recente disponível).
export type FeedbackSnapshot = Record<FeedbackAreaKey, NivelPercebido | null>;

export interface FeedbackInput {
  data: string;
  observacao?: string;
  is_conquista?: boolean;
  ciclo_id?: number | null;
  nivel_speaking?: NivelPercebido | null;
  nivel_listening?: NivelPercebido | null;
  nivel_vocabulary?: NivelPercebido | null;
  nivel_grammar?: NivelPercebido | null;
  nivel_pronunciation?: NivelPercebido | null;
  nivel_confianca?: NivelPercebido | null;
}
