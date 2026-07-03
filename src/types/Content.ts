// Speak&Go Evolution Method — Biblioteca de Conteúdo

export const CONTENT_TIPOS = [
  { key: 'warm-up', label: 'Warm-up' },
  { key: 'prompt', label: 'Prompt' },
  { key: 'listening', label: 'Listening' },
  { key: 'vocabulario', label: 'Vocabulário' },
  { key: 'outro', label: 'Outro' },
] as const;

export type ContentTipo = (typeof CONTENT_TIPOS)[number]['key'];

export const CONTENT_NIVEIS = ['Iniciante', 'Intermediário', 'Avançado', 'Todos'] as const;
export type ContentNivel = (typeof CONTENT_NIVEIS)[number];

// Sugestões de tema (campo livre no banco).
export const CONTENT_TEMAS_SUGERIDOS = [
  'Viagem',
  'Trabalho',
  'Entrevista',
  'Rotina',
  'Apresentações',
  'Reuniões',
];

export const tipoLabel = (key: string) =>
  CONTENT_TIPOS.find((t) => t.key === key)?.label || key;

export interface Conteudo {
  id: number;
  user_id?: string;
  titulo: string;
  tema: string | null;
  tipo: string;
  nivel: string;
  descricao: string | null;
  link: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ConteudoInput {
  titulo: string;
  tema?: string | null;
  tipo: string;
  nivel: string;
  descricao?: string | null;
  link?: string | null;
}
