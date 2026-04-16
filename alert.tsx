import * as XLSX from 'xlsx';
import { Leader } from '@/data/leaders';
import { EditableSuccessor } from './types';
import { normalizeProntidao } from '@/lib/scoring';

const NON_LEADER_LEVELS = ['P1','P2','P3','P4','S1','S2','S3','S4','T2','T3','U1','U2'];

function isNonLeaderLevel(nivel: string | null | undefined): boolean {
  if (!nivel) return false;
  return NON_LEADER_LEVELS.includes(nivel.toUpperCase());
}

function getQuadranteShort(q: string | null): string {
  if (!q) return '';
  const lower = q.toLowerCase();
  if (lower.includes('diferenciado')) return 'Q6';
  if (lower.includes('acima do esperado') && lower.includes('alto potencial')) return 'Q9';
  if (lower.includes('acima do esperado')) return 'Q3';
  if (lower.includes('alto potencial') && lower.includes('esperado') && !lower.includes('abaixo')) return 'Q8';
  if (lower.includes('alto potencial') && lower.includes('abaixo')) return 'Q7';
  if (lower.includes('adequado')) return 'Q5';
  if (lower.includes('esperado') && !lower.includes('abaixo') && !lower.includes('acima') && !lower.includes('alto')) return 'Q2';
  if (lower.includes('insuficiente')) return 'Q1';
  if (lower.includes('abaixo do esperado') && !lower.includes('alto')) return 'Q4';
  return '';
}

function findSuccessorIndicators(s: EditableSuccessor, allLeaders: Leader[]): {
  cr2026: number | null; cr2025: number | null;
  enps2026: number | null; enps2025: number | null;
  ultimoQuadrante: string | null; penultimoQuadrante: string | null;
} {
  if (!isNonLeaderLevel(s.nivelCarreira)) {
    const leaderRecord = allLeaders.find(l => l.nome.toLowerCase() === (s.nome || '').toLowerCase());
    if (leaderRecord) {
      return {
        cr2026: leaderRecord.cr2026 ?? null, cr2025: leaderRecord.cr2025,
        enps2026: leaderRecord.moods2026 ?? null, enps2025: leaderRecord.moods2025 ?? null,
        ultimoQuadrante: leaderRecord.ultimoQuadrante,
        penultimoQuadrante: leaderRecord.penultimoQuadrante ?? null,
      };
    }
    return {
      cr2026: (s as any).cr2026 ?? null, cr2025: (s as any).cr2025 ?? null,
      enps2026: (s as any).enps2026 ?? null, enps2025: s.enps2025 ?? null,
      ultimoQuadrante: s.ultimoQuadrante ?? null, penultimoQuadrante: (s as any).penultimoQuadrante ?? null,
    };
  }
  const liName = (s as any).liderImediato;
  if (!liName) return { cr2026: null, cr2025: null, enps2026: (s as any).enps2026 ?? null, enps2025: s.enps2025, ultimoQuadrante: s.ultimoQuadrante, penultimoQuadrante: (s as any).penultimoQuadrante ?? null };
  const immLeader = allLeaders.find(l => l.nome.toLowerCase() === liName.toLowerCase());
  return {
    cr2026: immLeader?.cr2026 ?? null, cr2025: immLeader?.cr2025 ?? null,
    enps2026: (s as any).enps2026 ?? null, enps2025: s.enps2025,
    ultimoQuadrante: s.ultimoQuadrante, penultimoQuadrante: (s as any).penultimoQuadrante ?? null,
  };
}

function formatCr(cr: number | null): string | number {
  if (cr === null) return '';
  return `${Math.round(cr * 100)}%`;
}

function formatEnps(enps: number | null): string | number {
  if (enps === null) return '';
  return Math.round(enps);
}

export function exportSuccessionReport(
  leaders: Leader[],
  getSuccessors: (l: Leader) => EditableSuccessor[],
  allLeaders?: Leader[]
) {
  const lookupLeaders = allLeaders ?? leaders;
  const rows: Record<string, unknown>[] = [];

  for (const leader of leaders) {
    const successors = getSuccessors(leader);
    const base = {
      'Nome do Líder': leader.nome,
      'Cadastro': leader.cadastro ?? '',
      'Cargo': leader.cargo ?? '',
      'Nível de Carreira': leader.nivelCarreira ?? '',
      'Diretoria': leader.diretoria ?? '',
    };

    const row: Record<string, unknown> = { ...base };
    for (let i = 0; i < 4; i++) {
      const s = successors[i];
      const n = i + 1;
      row[`Sucessor ${n}`] = s?.nome ?? '';
      row[`Prontidão ${n}`] = s ? normalizeProntidao(s.prontidao) : '';

      if (s) {
        const ind = findSuccessorIndicators(s, lookupLeaders);
        row[`9Box 2026 Suc. ${n}`] = getQuadranteShort(ind.ultimoQuadrante);
        row[`9Box 2025 Suc. ${n}`] = getQuadranteShort(ind.penultimoQuadrante);
        row[`CR 2026 Suc. ${n}`] = formatCr(ind.cr2026);
        row[`CR 2025 Suc. ${n}`] = formatCr(ind.cr2025);
        row[`eNPS 2026 Suc. ${n}`] = formatEnps(ind.enps2026);
        row[`eNPS 2025 Suc. ${n}`] = formatEnps(ind.enps2025);
      } else {
        row[`9Box 2026 Suc. ${n}`] = '';
        row[`9Box 2025 Suc. ${n}`] = '';
        row[`CR 2026 Suc. ${n}`] = '';
        row[`CR 2025 Suc. ${n}`] = '';
        row[`eNPS 2026 Suc. ${n}`] = '';
        row[`eNPS 2025 Suc. ${n}`] = '';
      }
      row[`Comentário ${n}`] = s?.comentario ?? '';
    }
    rows.push(row);
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mapa de Sucessão');
  XLSX.writeFile(wb, 'mapa_sucessao.xlsx');
}
