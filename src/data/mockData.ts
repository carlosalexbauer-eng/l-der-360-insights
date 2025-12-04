// Mock data for the Leadership Dashboard

export interface Leader {
  id: string;
  nome: string;
  cadastro: string;
  liderDeSiMesmo: boolean;
  liderDosOutros: boolean;
  liderCorporativo: boolean;
  impacto: 'Alto' | 'Médio' | 'Baixo';
  sexo: 'M' | 'F';
  situacao: 'Ativo' | 'Inativo' | 'Afastado';
  liderDoLider: string;
  dataAdmissao: string;
  cargo: string;
  filial: string;
  diretoria: string;
  diretoOuIndireto: 'Direto' | 'Indireto';
  ce: string;
  nivelCarreira: 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista' | 'Coordenador' | 'Gerente' | 'Diretor';
  dataVirouLider: string;
  tempoComoLider: number;
  primeiraLideranca: boolean;
  comoSetornouLider: string;
  origemLider: string;
  tempoNoCargoAtual: number;
  qtdeColabsDiretos2025: number;
  qtdeColabsIndiretos2025: number;
  admissoes2024: number;
  admissoes2025: number;
  enpsOnboarding2024: number;
  enpsOnboarding2025: number;
  leadershipReview2023: string;
  leadershipReview2025: string;
  avalCompetencias2024: 'A' | 'B' | 'C' | 'D' | 'E';
  avalCompetenciasFoco2024: 'A' | 'B' | 'C' | 'D' | 'E';
  percAvalConcluidas2024: number;
  qtdeAvaliacoes2025: number;
  avalEmAndamento2025: number;
  avalConcluida2025: number;
  percAvalAndamento2025: number;
  percAvalConcluidas2025: number;
  atingimentoCR2024: number;
  atingimentoCR2025: number;
  desejoCarreira: string;
  mapeadoSucessor2024: boolean;
  mapeadoSucessor2025: boolean;
  participanteLiderAcao: boolean;
  participantePool: boolean;
  statusLeaderStart: 'Concluído' | 'Em andamento' | 'Não iniciado';
  modulosLeadershipJourney: number;
  percLeadershipJourney: number;
  gptwENPS2024: number;
  gptwENPS2025: number;
  gptwLNPS2025: number;
  estagioLideranca2024: 'Inicial' | 'Em Desenvolvimento' | 'Consolidado' | 'Referência';
  estagioLideranca2025: 'Inicial' | 'Em Desenvolvimento' | 'Consolidado' | 'Referência';
  gptwIVR2024: number;
  gptwIVR2025: number;
  moodsENPS2025: number[];
  mediaENPS: number;
  percFeedbacks2024: number;
  percFeedbacks2025: number;
  qtdeFeedbacksHCM: number;
  percAtingimentoFeedbacks: number;
  percDesligamentosPorLider: number;
  pesquisaDesligamentoENPS: number;
  indicados: Indicado[];
  jobRotation?: JobRotation;
  prontidaoSucessao: 'Ready Now' | 'Ready Soon' | 'Ready Later' | 'Não Mapeado';
}

export interface Indicado {
  nome: string;
  cargo: string;
  status: 'Ativo' | 'Inativo';
  prontidao: 'Ready Now' | 'Ready Soon' | 'Ready Later';
  enps: number;
  atingimentoCR: number;
  nivelCarreira: string;
}

export interface JobRotation {
  indicado: boolean;
  status: 'Aprovado' | 'Em análise' | 'Recusado' | 'Concluído';
  tempoNoCargo: number;
}

const diretorias = ['Tecnologia', 'Comercial', 'Operações', 'RH', 'Financeiro', 'Marketing', 'Jurídico'];
const cargos = ['Coordenador de TI', 'Gerente Comercial', 'Diretor de Operações', 'Gerente de RH', 'Coordenador Financeiro', 'Gerente de Marketing', 'Gerente de Projetos', 'Diretor Comercial', 'Coordenador de Vendas', 'Gerente de Produto'];
const nomes = ['Ana Silva', 'Bruno Costa', 'Carlos Mendes', 'Diana Oliveira', 'Eduardo Santos', 'Fernanda Lima', 'Gabriel Rocha', 'Helena Souza', 'Igor Ferreira', 'Julia Martins', 'Lucas Almeida', 'Marina Ribeiro', 'Nelson Dias', 'Olivia Nascimento', 'Pedro Araújo', 'Quintino Barros', 'Renata Campos', 'Sergio Vieira', 'Tatiana Moreira', 'Ulisses Gomes', 'Vanessa Pinto', 'Wagner Cruz', 'Ximena Torres', 'Yago Neves', 'Zelia Cardoso'];

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateMoodsData(): number[] {
  return Array.from({ length: 12 }, () => randomNumber(40, 95));
}

function generateIndicados(): Indicado[] {
  const count = randomNumber(0, 3);
  return Array.from({ length: count }, () => ({
    nome: randomFromArray(nomes),
    cargo: randomFromArray(cargos),
    status: randomFromArray(['Ativo', 'Inativo']) as 'Ativo' | 'Inativo',
    prontidao: randomFromArray(['Ready Now', 'Ready Soon', 'Ready Later']) as 'Ready Now' | 'Ready Soon' | 'Ready Later',
    enps: randomNumber(30, 95),
    atingimentoCR: randomNumber(60, 120),
    nivelCarreira: randomFromArray(['Pleno', 'Sênior', 'Especialista', 'Coordenador']),
  }));
}

export function generateLeaders(count: number = 150): Leader[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `L${String(i + 1).padStart(4, '0')}`,
    nome: nomes[i % nomes.length] + (i >= nomes.length ? ` ${Math.floor(i / nomes.length) + 1}` : ''),
    cadastro: `C${String(randomNumber(10000, 99999))}`,
    liderDeSiMesmo: Math.random() > 0.7,
    liderDosOutros: Math.random() > 0.3,
    liderCorporativo: Math.random() > 0.8,
    impacto: randomFromArray(['Alto', 'Médio', 'Baixo']) as 'Alto' | 'Médio' | 'Baixo',
    sexo: randomFromArray(['M', 'F']) as 'M' | 'F',
    situacao: randomFromArray(['Ativo', 'Ativo', 'Ativo', 'Inativo', 'Afastado']) as 'Ativo' | 'Inativo' | 'Afastado',
    liderDoLider: nomes[randomNumber(0, nomes.length - 1)],
    dataAdmissao: `${randomNumber(2015, 2023)}-${String(randomNumber(1, 12)).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`,
    cargo: randomFromArray(cargos),
    filial: randomFromArray(['São Paulo', 'Rio de Janeiro', 'Blumenau', 'Curitiba', 'Porto Alegre', 'Belo Horizonte']),
    diretoria: randomFromArray(diretorias),
    diretoOuIndireto: randomFromArray(['Direto', 'Indireto']) as 'Direto' | 'Indireto',
    ce: randomFromArray(['CE1', 'CE2', 'CE3']),
    nivelCarreira: randomFromArray(['Coordenador', 'Gerente', 'Diretor', 'Especialista']) as Leader['nivelCarreira'],
    dataVirouLider: `${randomNumber(2018, 2024)}-${String(randomNumber(1, 12)).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`,
    tempoComoLider: randomFloat(0.5, 8),
    primeiraLideranca: Math.random() > 0.5,
    comoSetornouLider: randomFromArray(['Promoção Interna', 'Contratação Externa', 'Sucessão', 'Reestruturação']),
    origemLider: randomFromArray(['Interno', 'Externo']),
    tempoNoCargoAtual: randomFloat(0.5, 5),
    qtdeColabsDiretos2025: randomNumber(3, 25),
    qtdeColabsIndiretos2025: randomNumber(0, 50),
    admissoes2024: randomNumber(0, 10),
    admissoes2025: randomNumber(0, 8),
    enpsOnboarding2024: randomNumber(40, 95),
    enpsOnboarding2025: randomNumber(45, 98),
    leadershipReview2023: randomFromArray(['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']),
    leadershipReview2025: randomFromArray(['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']),
    avalCompetencias2024: randomFromArray(['A', 'B', 'C', 'D', 'E']) as Leader['avalCompetencias2024'],
    avalCompetenciasFoco2024: randomFromArray(['A', 'B', 'C', 'D', 'E']) as Leader['avalCompetenciasFoco2024'],
    percAvalConcluidas2024: randomNumber(60, 100),
    qtdeAvaliacoes2025: randomNumber(5, 30),
    avalEmAndamento2025: randomNumber(0, 10),
    avalConcluida2025: randomNumber(5, 25),
    percAvalAndamento2025: randomNumber(50, 100),
    percAvalConcluidas2025: randomNumber(60, 100),
    atingimentoCR2024: randomNumber(70, 130),
    atingimentoCR2025: randomNumber(75, 125),
    desejoCarreira: randomFromArray(['Crescimento vertical', 'Crescimento lateral', 'Estabilidade', 'Empreendedorismo']),
    mapeadoSucessor2024: Math.random() > 0.6,
    mapeadoSucessor2025: Math.random() > 0.5,
    participanteLiderAcao: Math.random() > 0.4,
    participantePool: Math.random() > 0.6,
    statusLeaderStart: randomFromArray(['Concluído', 'Em andamento', 'Não iniciado']) as Leader['statusLeaderStart'],
    modulosLeadershipJourney: randomNumber(0, 12),
    percLeadershipJourney: randomNumber(0, 100),
    gptwENPS2024: randomNumber(35, 90),
    gptwENPS2025: randomNumber(40, 95),
    gptwLNPS2025: randomNumber(30, 85),
    estagioLideranca2024: randomFromArray(['Inicial', 'Em Desenvolvimento', 'Consolidado', 'Referência']) as Leader['estagioLideranca2024'],
    estagioLideranca2025: randomFromArray(['Inicial', 'Em Desenvolvimento', 'Consolidado', 'Referência']) as Leader['estagioLideranca2025'],
    gptwIVR2024: randomNumber(60, 95),
    gptwIVR2025: randomNumber(65, 98),
    moodsENPS2025: generateMoodsData(),
    mediaENPS: randomNumber(45, 90),
    percFeedbacks2024: randomNumber(50, 100),
    percFeedbacks2025: randomNumber(55, 100),
    qtdeFeedbacksHCM: randomNumber(10, 100),
    percAtingimentoFeedbacks: randomNumber(60, 100),
    percDesligamentosPorLider: randomFloat(0, 25),
    pesquisaDesligamentoENPS: randomNumber(20, 80),
    indicados: generateIndicados(),
    jobRotation: Math.random() > 0.7 ? {
      indicado: true,
      status: randomFromArray(['Aprovado', 'Em análise', 'Recusado', 'Concluído']) as JobRotation['status'],
      tempoNoCargo: randomFloat(0.5, 4),
    } : undefined,
    prontidaoSucessao: randomFromArray(['Ready Now', 'Ready Soon', 'Ready Later', 'Não Mapeado']) as Leader['prontidaoSucessao'],
  }));
}

export const leaders = generateLeaders(150);

// Aggregated statistics
export function getStats(data: Leader[]) {
  const total = data.length;
  const ativos = data.filter(l => l.situacao === 'Ativo').length;
  
  const porNivel = data.reduce((acc, l) => {
    acc[l.nivelCarreira] = (acc[l.nivelCarreira] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prontidao = data.reduce((acc, l) => {
    acc[l.prontidaoSucessao] = (acc[l.prontidaoSucessao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sucessores2024 = data.filter(l => l.mapeadoSucessor2024).length;
  const sucessores2025 = data.filter(l => l.mapeadoSucessor2025).length;

  const mediaENPSLideres = Math.round(data.reduce((acc, l) => acc + l.gptwENPS2025, 0) / total);
  const mediaENPSTimes = Math.round(data.reduce((acc, l) => acc + l.mediaENPS, 0) / total);

  const participacaoLiderAcao = data.filter(l => l.participanteLiderAcao).length;
  const participacaoPool = data.filter(l => l.participantePool).length;

  const lideresRisco = data.filter(l => l.gptwENPS2025 < 50 || l.atingimentoCR2025 < 80).length;

  return {
    total,
    ativos,
    porNivel,
    prontidao,
    sucessores2024,
    sucessores2025,
    mediaENPSLideres,
    mediaENPSTimes,
    participacaoLiderAcao,
    participacaoPool,
    lideresRisco,
    percSucessores2024: Math.round((sucessores2024 / total) * 100),
    percSucessores2025: Math.round((sucessores2025 / total) * 100),
    percLideresRisco: Math.round((lideresRisco / total) * 100),
    percParticipacaoPrograma: Math.round(((participacaoLiderAcao + participacaoPool) / (total * 2)) * 100),
  };
}

export const stats = getStats(leaders);

// Top performers and risk leaders
export function getTopPerformers(data: Leader[], count: number = 10): Leader[] {
  return [...data]
    .filter(l => l.situacao === 'Ativo')
    .sort((a, b) => {
      const scoreA = a.atingimentoCR2025 + a.gptwENPS2025 + (a.leadershipReview2025.startsWith('A') ? 30 : a.leadershipReview2025.startsWith('B') ? 20 : 10);
      const scoreB = b.atingimentoCR2025 + b.gptwENPS2025 + (b.leadershipReview2025.startsWith('A') ? 30 : b.leadershipReview2025.startsWith('B') ? 20 : 10);
      return scoreB - scoreA;
    })
    .slice(0, count);
}

export function getRiskLeaders(data: Leader[], count: number = 10): Leader[] {
  return [...data]
    .filter(l => l.situacao === 'Ativo')
    .sort((a, b) => {
      const riskA = (100 - a.gptwENPS2025) + (100 - a.atingimentoCR2025) + a.percDesligamentosPorLider;
      const riskB = (100 - b.gptwENPS2025) + (100 - b.atingimentoCR2025) + b.percDesligamentosPorLider;
      return riskB - riskA;
    })
    .slice(0, count);
}

// Data by diretoria
export function getDataByDiretoria(data: Leader[]) {
  return diretorias.map(d => {
    const lideres = data.filter(l => l.diretoria === d);
    return {
      diretoria: d,
      totalLideres: lideres.length,
      mediaENPS: Math.round(lideres.reduce((acc, l) => acc + l.gptwENPS2025, 0) / (lideres.length || 1)),
      mediaCR: Math.round(lideres.reduce((acc, l) => acc + l.atingimentoCR2025, 0) / (lideres.length || 1)),
      sucessores: lideres.filter(l => l.mapeadoSucessor2025).length,
      risco: lideres.filter(l => l.gptwENPS2025 < 50 || l.atingimentoCR2025 < 80).length,
    };
  });
}

// ENPS evolution data
export function getENPSEvolution() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map((month, i) => ({
    month,
    lideres: randomNumber(60, 85),
    times: randomNumber(55, 80),
  }));
}

// Leadership Review distribution
export function getLeadershipReviewDistribution(data: Leader[]) {
  const quadrants = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
  return quadrants.map(q => ({
    quadrant: q,
    count: data.filter(l => l.leadershipReview2025 === q).length,
  }));
}

export { diretorias, cargos, nomes };
