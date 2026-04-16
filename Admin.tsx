import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Leader, Successor } from '@/data/leaders';

export interface HistoricalLeader {
  nome: string | null;
  cadastro: number | null;
  diretoria: string | null;
  nivelCarreira: string | null;
  ligacaoCE: string | null;
  cargo: string | null;
  liderDoLider: string | null;
  sucessores: HistoricalSuccessor[];
  jobRotations: { nome: string; nivelCarreira: string | null }[];
}

export interface HistoricalSuccessor {
  nome: string | null;
  cargo: string | null;
  nivelCarreira: string | null;
  nivelCarreiraPool: string | null;
  prontidao: string | null;
  diretoria: string | null;
  liderImediato: string | null;
}

function toStr(v: unknown): string | null {
  if (v === null || v === undefined || v === '**') return null;
  const s = String(v).trim();
  return s || null;
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '' || v === '**') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

function isInvalidName(name: string | null): boolean {
  if (!name) return true;
  const t = name.trim();
  if (!t || t === '**' || t.toUpperCase() === 'SEM INDICAÇÃO') return true;
  return false;
}

function normalizeCol(name: string): string {
  return name.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function findVal(row: Record<string, unknown>, ...candidates: string[]): unknown {
  const keys = Object.keys(row);
  const normMap = new Map<string, string>();
  for (const k of keys) normMap.set(normalizeCol(k), k);

  for (const c of candidates) {
    const norm = normalizeCol(c);
    const key = normMap.get(norm);
    if (key !== undefined && row[key] !== undefined) return row[key];
  }
  // partial match
  for (const c of candidates) {
    const parts = normalizeCol(c).split(' ').filter(p => p.length > 3);
    for (const [normKey, origKey] of normMap) {
      if (parts.length > 0 && parts.every(p => normKey.includes(p))) {
        if (row[origKey] !== undefined) return row[origKey];
      }
    }
  }
  return null;
}

function parseHistoricalRows(rows: Record<string, unknown>[]): HistoricalLeader[] {
  return rows.map(row => {
    const sucessores: HistoricalSuccessor[] = [];
    // Support up to 6 indicados
    for (let i = 1; i <= 6; i++) {
      const nome = toStr(findVal(row, `Nome do indicado ${i}`));
      if (isInvalidName(nome)) continue;
      sucessores.push({
        nome,
        cargo: toStr(findVal(row, `Cargo atual do indicado ${i}`)),
        nivelCarreira: toStr(findVal(row, `Nível de Carreira do indicado ${i}`)),
        nivelCarreiraPool: toStr(findVal(row, `Indicado ${i} para o Pool`)),
        prontidao: toStr(findVal(row, `Prontidão do indicado ${i}`)),
        diretoria: toStr(findVal(row, `Diretoria do indicado ${i}`)),
        liderImediato: toStr(findVal(row, `Líder Imediato do indicado ${i}`)),
      });
    }

    const jobRotations: { nome: string; nivelCarreira: string | null }[] = [];
    const leaderNivel = toStr(findVal(row, 'Nível de carreira', 'Nível de Carreira'));
    for (const field of ['JOB1', 'JOB2', 'JOB3']) {
      const name = toStr(row[field] ?? null);
      if (!isInvalidName(name)) jobRotations.push({ nome: name!, nivelCarreira: leaderNivel });
    }

    return {
      nome: toStr(findVal(row, 'Líder', 'Nome')),
      cadastro: toNum(findVal(row, 'Cadastro')),
      diretoria: toStr(findVal(row, 'Diretoria')),
      nivelCarreira: toStr(findVal(row, 'Nível de carreira', 'Nível de Carreira')),
      ligacaoCE: toStr(findVal(row, 'Direto ou indireto do CE', 'Direto ou indireto do CE, CE', 'Ligação CE')),
      cargo: toStr(findVal(row, 'Cargo')),
      liderDoLider: toStr(findVal(row, 'Líder do Líder')),
      sucessores,
      jobRotations,
    };
  });
}

/**
 * Convert historical leaders into Leader-compatible objects so the same
 * 2026 calculation logic can be reused for 2025.
 */
export function historicalToLeaders(historical: HistoricalLeader[]): Leader[] {
  return historical.map(h => {
    const sucessores: Successor[] = [];

    // Regular successors
    h.sucessores.forEach(s => {
      sucessores.push({
        nome: s.nome || '',
        cargo: s.cargo,
        nivelCarreira: s.nivelCarreira,
        nivelCarreiraPool: s.nivelCarreiraPool,
        prontidao: s.prontidao,
        status: null, // historical data doesn't have status — treat as active
        diretoria: s.diretoria,
        ultimoQuadrante: null,
        enps2025: null,
        enps2024: null,
        cr2024: null,
        cr2025: null,
        liderImediato: s.liderImediato,
        tempoNoCargo: null,
        cadastro: null,
      });
    });

    // Job Rotations — add as successors with same level as leader so isJobRotation returns true
    h.jobRotations.forEach(jr => {
      sucessores.push({
        nome: jr.nome,
        cargo: null,
        nivelCarreira: jr.nivelCarreira, // same as leader level
        nivelCarreiraPool: jr.nivelCarreira,
        prontidao: 'Job Rotation',
        status: null,
        diretoria: null,
        ultimoQuadrante: null,
        enps2025: null,
        enps2024: null,
        cr2024: null,
        cr2025: null,
        liderImediato: null,
        tempoNoCargo: null,
        cadastro: null,
      });
    });

    return {
      nome: h.nome || '',
      cadastro: h.cadastro,
      sexo: null,
      situacao: 'Ativo', // historical positions treated as active
      cargo: h.cargo,
      filial: null,
      diretoria: h.diretoria,
      ligacaoCE: h.ligacaoCE,
      nivelCarreira: h.nivelCarreira,
      dataAdmissao: null,
      dataLider: null,
      primeiraLideranca: null,
      qtdDiretos: null,
      qtdIndiretos: null,
      penultimoQuadrante: null,
      ultimoQuadrante: null,
      conceitoFinal2024: null,
      cr2024: null,
      cr2025: null,
      enps2024: null,
      enps2025: null,
      lnps2025: null,
      estagioLideranca2025: null,
      liderDoLider: h.liderDoLider,
      sucessores,
    } as Leader;
  });
}

async function fetchHistoricalLeaders(): Promise<HistoricalLeader[]> {
  const { data, error } = await supabase
    .from('leaders_data_historical')
    .select('data')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data?.data && Array.isArray(data.data)) {
    return parseHistoricalRows(data.data as Record<string, unknown>[]);
  }
  return [];
}

export function useHistoricalData() {
  const query = useQuery<HistoricalLeader[]>({
    queryKey: ['historical-leaders-data'],
    queryFn: fetchHistoricalLeaders,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  return {
    historicalLeaders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
