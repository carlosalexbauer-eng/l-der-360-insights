import { Leader } from '@/data/leaders';

// Editable parameters with defaults
export interface LeadershipParams {
  crQ1: number;
  crQ3: number;
  moodsQ1: number;
  moodsQ3: number;
  feedbackQ3: number;
  competenciasQ1: number;
  quedaCR: number;
  quedaMOODS: number;
}

export const DEFAULT_PARAMS: LeadershipParams = {
  crQ1: 100.6,
  crQ3: 135.8,
  moodsQ1: 60.1,
  moodsQ3: 87.5,
  feedbackQ3: 0.333,
  competenciasQ1: 0.40,
  quedaCR: -10,
  quedaMOODS: -8,
};

// Pillar scores
export interface PillarScores {
  performance: 'alto' | 'medio' | 'baixo' | 'nd';
  pessoas: 'alto' | 'medio' | 'baixo' | 'nd';
  gestao: 'alto' | 'medio' | 'baixo' | 'nd';
  tendencia: 'melhora' | 'estavel' | 'piora' | 'nd';
}

export type LeaderStatus = 'sustentavel' | 'atencao' | 'critico';

export interface LeaderAnalysis {
  leader: Leader;
  pillars: PillarScores;
  status: LeaderStatus;
  deltaCR: number | null;
  deltaMOODS: number | null;
  riskTypes: string[];
  hasEmergentRisk: boolean;
}

// Classify CR performance
function classifyCR(cr: number | null, params: LeadershipParams): 'alto' | 'medio' | 'baixo' | 'nd' {
  if (cr === null) return 'nd';
  if (cr >= params.crQ3) return 'alto';
  if (cr >= params.crQ1) return 'medio';
  return 'baixo';
}

// Classify MOODS/eNPS
function classifyMOODS(moods: number | null, params: LeadershipParams): 'alto' | 'medio' | 'baixo' | 'nd' {
  if (moods === null) return 'nd';
  if (moods >= params.moodsQ3) return 'alto';
  if (moods >= params.moodsQ1) return 'medio';
  return 'baixo';
}

// Performance pillar: best of CR 2025 or CR 2024, plus quadrante
function calcPerformance(leader: Leader, params: LeadershipParams): 'alto' | 'medio' | 'baixo' | 'nd' {
  const cr2025 = classifyCR(leader.cr2025, params);
  const cr2024 = classifyCR(leader.cr2024, params);
  
  // Use 2025 if available, else 2024
  const crClass = cr2025 !== 'nd' ? cr2025 : cr2024;
  
  // Quadrante as modifier
  const q = leader.ultimoQuadrante?.toLowerCase() || '';
  const hasLowQuadrante = q.includes('insuficiente') || q.includes('abaixo do esperado');
  const hasHighQuadrante = q.includes('diferenciado') || q.includes('alto potencial');
  
  if (crClass === 'nd') {
    if (hasLowQuadrante) return 'baixo';
    if (hasHighQuadrante) return 'alto';
    return 'nd';
  }
  
  if (crClass === 'baixo' || hasLowQuadrante) return 'baixo';
  if (crClass === 'alto' && hasHighQuadrante) return 'alto';
  return crClass;
}

// Pessoas pillar: eNPS 2025 or 2024
function calcPessoas(leader: Leader, params: LeadershipParams): 'alto' | 'medio' | 'baixo' | 'nd' {
  const moods2025 = classifyMOODS(leader.enps2025, params);
  const moods2024 = classifyMOODS(leader.enps2024, params);
  return moods2025 !== 'nd' ? moods2025 : moods2024;
}

// Gestão pillar: conceitoFinal + succession pipeline
function calcGestao(leader: Leader, params: LeadershipParams): 'alto' | 'medio' | 'baixo' | 'nd' {
  const conceito = leader.conceitoFinal2024;
  const hasSuccessors = leader.sucessores && leader.sucessores.length > 0;
  const activeSuccessors = leader.sucessores?.filter(s => s.status === 'Ativo') || [];
  
  let conceitoScore: 'alto' | 'medio' | 'baixo' | 'nd' = 'nd';
  if (conceito === 'Atende Plenamente' || conceito === 'Supera') conceitoScore = 'alto';
  else if (conceito === 'Atende Parcialmente') conceitoScore = 'medio';
  else if (conceito === 'Não Atende') conceitoScore = 'baixo';
  
  let pipelineScore: 'alto' | 'medio' | 'baixo' = 'baixo';
  if (activeSuccessors.length >= 2) pipelineScore = 'alto';
  else if (hasSuccessors) pipelineScore = 'medio';
  
  if (conceitoScore === 'nd') return pipelineScore;
  
  const scores = { alto: 3, medio: 2, baixo: 1, nd: 0 };
  const avg = (scores[conceitoScore] + scores[pipelineScore]) / 2;
  if (avg >= 2.5) return 'alto';
  if (avg >= 1.5) return 'medio';
  return 'baixo';
}

// Tendência
function calcTendencia(leader: Leader, params: LeadershipParams): { trend: 'melhora' | 'estavel' | 'piora' | 'nd'; deltaCR: number | null; deltaMOODS: number | null } {
  const deltaCR = (leader.cr2025 !== null && leader.cr2024 !== null) ? leader.cr2025 - leader.cr2024 : null;
  const deltaMOODS = (leader.enps2025 !== null && leader.enps2024 !== null) ? leader.enps2025 - leader.enps2024 : null;
  
  if (deltaCR === null && deltaMOODS === null) return { trend: 'nd', deltaCR, deltaMOODS };
  
  const crDrop = deltaCR !== null && deltaCR <= params.quedaCR;
  const moodsDrop = deltaMOODS !== null && deltaMOODS <= params.quedaMOODS;
  const crRise = deltaCR !== null && deltaCR > 10;
  const moodsRise = deltaMOODS !== null && deltaMOODS > 8;
  
  if (crDrop || moodsDrop) return { trend: 'piora', deltaCR, deltaMOODS };
  if (crRise || moodsRise) return { trend: 'melhora', deltaCR, deltaMOODS };
  return { trend: 'estavel', deltaCR, deltaMOODS };
}

// Overall classification
function classifyLeader(pillars: PillarScores, tendencia: 'melhora' | 'estavel' | 'piora' | 'nd'): LeaderStatus {
  const hasBaixo = (p: string) => p === 'baixo';
  
  // Crítico: low performance OR significant people issue OR weak management + deterioration
  if (hasBaixo(pillars.performance)) return 'critico';
  if (hasBaixo(pillars.pessoas) && tendencia === 'piora') return 'critico';
  if (hasBaixo(pillars.gestao) && tendencia === 'piora') return 'critico';
  if (hasBaixo(pillars.pessoas) && hasBaixo(pillars.gestao)) return 'critico';
  
  // Atenção: inconsistency in any pillar or moderate negative trend
  if (hasBaixo(pillars.pessoas) || hasBaixo(pillars.gestao)) return 'atencao';
  if (tendencia === 'piora') return 'atencao';
  if (pillars.performance === 'medio' && pillars.pessoas === 'medio') return 'atencao';
  
  return 'sustentavel';
}

// Get risk types for a leader
function getRiskTypes(pillars: PillarScores, tendencia: 'melhora' | 'estavel' | 'piora' | 'nd'): string[] {
  const risks: string[] = [];
  if (pillars.performance === 'baixo') risks.push('Performance');
  if (pillars.pessoas === 'baixo') risks.push('Pessoas');
  if (pillars.gestao === 'baixo') risks.push('Gestão');
  if (tendencia === 'piora') risks.push('Tendência');
  return risks;
}

// Analyze a single leader
export function analyzeLeader(leader: Leader, params: LeadershipParams = DEFAULT_PARAMS): LeaderAnalysis {
  const performance = calcPerformance(leader, params);
  const pessoas = calcPessoas(leader, params);
  const gestao = calcGestao(leader, params);
  const { trend, deltaCR, deltaMOODS } = calcTendencia(leader, params);
  
  const pillars: PillarScores = { performance, pessoas, gestao, tendencia: trend };
  const status = classifyLeader(pillars, trend);
  const riskTypes = getRiskTypes(pillars, trend);
  
  // Emergent risk: currently looks OK but trend is worsening
  const hasEmergentRisk = status === 'sustentavel' && trend === 'piora';
  
  return { leader, pillars, status, deltaCR, deltaMOODS, riskTypes, hasEmergentRisk };
}

// Analyze all leaders
export function analyzeLeaders(leaders: Leader[], params: LeadershipParams = DEFAULT_PARAMS): LeaderAnalysis[] {
  return leaders.map(l => analyzeLeader(l, params));
}

// Status label helper
export function getStatusLabel(status: LeaderStatus): string {
  switch (status) {
    case 'sustentavel': return 'Sustentável';
    case 'atencao': return 'Atenção';
    case 'critico': return 'Crítico';
  }
}

// Pillar level label
export function getPillarLabel(level: string): string {
  switch (level) {
    case 'alto': return 'Alto';
    case 'medio': return 'Médio';
    case 'baixo': return 'Baixo';
    case 'melhora': return 'Melhora';
    case 'estavel': return 'Estável';
    case 'piora': return 'Piora';
    case 'nd': return 'N/D';
    default: return level;
  }
}
