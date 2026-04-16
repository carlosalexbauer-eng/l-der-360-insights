import { Successor } from '@/data/leaders';

export interface EditableSuccessor {
  nome: string;
  cargo: string | null;
  nivelCarreira: string | null;
  prontidao: string | null;
  status: string | null;
  diretoria: string | null;
  ultimoQuadrante: string | null;
  penultimoQuadrante?: string | null;
  enps2025: number | null;
  cr2025?: number | null;
  cr2026?: number | null;
  cr2024?: number | null;
  enps2024?: number | null;
  enps2026?: number | null;
  liderImediato?: string | null;
  tempoNoCargo?: string | null;
  cadastro?: number | null;
  anoIndicacao?: string | null;
  comentario?: string | null;
}

export interface SuccessorEdits {
  [leaderKey: string]: EditableSuccessor[];
}
