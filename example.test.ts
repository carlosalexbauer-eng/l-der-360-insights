import { Leader, Successor } from '@/data/leaders';

// Normalize prontidao values
function normalizeProntidao(p: string | null): string {
  if (!p) return 'unknown';
  const lower = p.toLowerCase().trim();
  if (lower === 'imediato') return 'Imediato';
  if (lower.includes('1 a 2') || lower.includes('1 e 2')) return '1-2 anos';
  if (lower.includes('2 a 3') || lower.includes('2 e 3')) return '2-3 anos';
  if (lower.includes('3 a 4') || lower.includes('3 e 4')) return '3-4 anos';
  if (lower.includes('job rotation') || lower === 'job rotation') return 'Job Rotation';
  if (lower === 'acompanhamento') return 'Acompanhamento';
  return p;
}

// Prontidão sort order
export function getProntidaoOrder(p: string | null): number {
  const norm = normalizeProntidao(p);
  switch (norm) {
    case 'Imediato': return 0;
    case '1-2 anos': return 1;
    case '2-3 anos': return 2;
    case '3-4 anos': return 3;
    case 'Job Rotation': return 4;
    case 'Acompanhamento': return 5;
    default: return 6;
  }
}

function isProntidaoUnder2Years(p: string | null): boolean {
  const norm = normalizeProntidao(p);
  return norm === 'Imediato' || norm === '1-2 anos';
}

// SUCCESSION MATURITY SCORE (0-100)
export function calcSuccessionScore(leader: Leader): number {
  const successors = leader.sucessores || [];
  const activeSuccessors = successors.filter(s => s.status === 'Ativo');
  const readySuccessors = activeSuccessors.filter(s => isProntidaoUnder2Years(s.prontidao));
  
  let score = 0;
  
  if (successors.length > 0) {
    score += 40; // has successor(s)
    if (activeSuccessors.length > 0) score += 20; // active successor
    if (readySuccessors.length > 0) score += 20; // ready < 2 years
    if (successors.length > 1) score += 20; // more than 1 successor
  } else {
    score -= 40; // no successor penalty
  }
  
  // Additional penalties
  if (successors.length > 0 && activeSuccessors.length === 0) score -= 20; // all inactive
  if (activeSuccessors.length > 0 && readySuccessors.length === 0) score -= 20; // all > 2 years
  
  return Math.max(0, Math.min(100, score));
}

// SUCCESSION STATUS
export type SuccessionStatus = 'saudavel' | 'risco' | 'gap';

export function getSuccessionStatus(leader: Leader): SuccessionStatus {
  const successors = leader.sucessores || [];
  if (successors.length === 0) return 'gap';
  
  const activeSuccessors = successors.filter(s => s.status === 'Ativo');
  if (activeSuccessors.length === 0) return 'risco';
  
  const readySuccessors = activeSuccessors.filter(s => isProntidaoUnder2Years(s.prontidao));
  if (readySuccessors.length === 0) return 'risco';
  
  return 'saudavel';
}

// LEADERSHIP HEALTH SCORE (0-100)
export function calcLeadershipScore(leader: Leader): number {
  let score = 100;
  
  // CR < 90
  const cr = leader.cr2024 ?? leader.cr2025;
  if (cr !== null && cr < 90) score -= 20;
  
  // eNPS < 70
  const enps = leader.enps2025 ?? leader.enps2024;
  if (enps !== null && enps < 70) score -= 15;
  
  // LNPS < 70
  if (leader.lnps2025 !== null && leader.lnps2025 < 70) score -= 15;
  
  // Low competency assessment
  const conceito = leader.conceitoFinal2024;
  if (conceito === 'Não Atende' || conceito === 'Atende Parcialmente') score -= 20;
  
  // Team low performance quadrants
  const quadrante = leader.ultimoQuadrante;
  if (quadrante && (
    quadrante.toLowerCase().includes('insuficiente') ||
    quadrante.toLowerCase().includes('abaixo do esperado')
  )) score -= 15;
  
  // Critical leadership stage
  const estagio = leader.estagioLideranca2025;
  if (estagio && (
    estagio.toLowerCase().includes('inconsciente') ||
    estagio.toLowerCase().includes('aleatório')
  )) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

// LEADERSHIP HEALTH CLASS
export type HealthClass = 'saudavel' | 'atencao' | 'critico';

export function getHealthClass(score: number): HealthClass {
  if (score >= 80) return 'saudavel';
  if (score >= 60) return 'atencao';
  return 'critico';
}

// LEADERSHIP GAPS
export function getLeadershipGaps(leader: Leader): string[] {
  const gaps: string[] = [];
  
  const cr = leader.cr2024 ?? leader.cr2025;
  if (cr !== null && cr < 90) gaps.push('CR < 90');
  
  const enps = leader.enps2025 ?? leader.enps2024;
  if (enps !== null && enps < 70) gaps.push('eNPS < 70');
  
  if (leader.lnps2025 !== null && leader.lnps2025 < 70) gaps.push('LNPS < 70');
  
  const conceito = leader.conceitoFinal2024;
  if (conceito === 'Não Atende' || conceito === 'Atende Parcialmente') gaps.push('Avaliação baixa');
  
  const quadrante = leader.ultimoQuadrante;
  if (quadrante && (
    quadrante.toLowerCase().includes('insuficiente') ||
    quadrante.toLowerCase().includes('abaixo do esperado')
  )) gaps.push('Equipe baixo desempenho');
  
  const estagio = leader.estagioLideranca2025;
  if (estagio && (
    estagio.toLowerCase().includes('inconsciente') ||
    estagio.toLowerCase().includes('aleatório')
  )) gaps.push('Estágio crítico');
  
  return gaps;
}

// MATRIX QUADRANT
export type MatrixQuadrant = 'referencia' | 'risco_futuro' | 'oportunidade' | 'risco_critico';

export function getMatrixQuadrant(healthScore: number, successionScore: number): MatrixQuadrant {
  const goodHealth = healthScore >= 60;
  const goodSuccession = successionScore >= 60;
  
  if (goodHealth && goodSuccession) return 'referencia';
  if (goodHealth && !goodSuccession) return 'risco_futuro';
  if (!goodHealth && goodSuccession) return 'oportunidade';
  return 'risco_critico';
}

// Helper to get span of control
export function getSpanOfControl(leader: Leader): number {
  return (leader.qtdDiretos ?? 0) + (leader.qtdIndiretos ?? 0);
}

// Normalize prontidao for display
export { normalizeProntidao, isProntidaoUnder2Years };
