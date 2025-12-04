// Real data extracted from Painel_de_lideranças_VF_04-12-2025.xlsx

export interface Leader {
  id: string;
  nome: string;
  cadastro: string;
  sexo: string;
  situacao: string;
  liderDoLider: string;
  cargo: string;
  filial: string;
  diretoria: string;
  diretoOuIndireto: string;
  nivelCarreira: string;
  tempoComoLider: string;
  tempoCargoAtual: string;
  qtdeColabsDiretos2025: number;
  qtdeColabsIndiretos2025: number;
  admissoes2024: number;
  admissoes2025: number;
  ultimoQuadranteReview: string;
  atingimentoCR2024: number | null;
  atingimentoCR2025: number | null;
  mapeadoSucessor2024: string;
  mapeadoSucessor2025: string;
  participantePoolMentoria: string;
  gptwENPS2024: number | null;
  gptwENPS2025: number | null;
  gptwLNPS2025: number | null;
  gptwEstagioLideranca2025: string;
  moodsENPS: (number | null)[];
  mediaENPSGestor2025: number | null;
  percentDesligamentos2024: number | null;
  percentDesligamentos2025: number | null;
  indicados: Indicado[];
  jobRotation: { nomeLider: string; nivelCarreira: string; status: string } | null;
}

export interface Indicado {
  nome: string;
  cargoAtual: string;
  nivelCarreira: string;
  prontidao: string;
  diretoria: string;
  status: string;
}

export const allLeaders: Leader[] = [
  {
    id: "1", nome: "Alexia da Rosa", cadastro: "9138", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Brenda Rezende", cargo: "Head of Product", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "4 meses", tempoCargoAtual: "4 meses", qtdeColabsDiretos2025: 1, qtdeColabsIndiretos2025: 17,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "", atingimentoCR2024: null, atingimentoCR2025: null,
    mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não", participantePoolMentoria: "",
    gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null, gptwEstagioLideranca2025: "",
    moodsENPS: [], mediaENPSGestor2025: null, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "2", nome: "Elisa Freitas", cadastro: "2255", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Levi Viana", cargo: "Coordenador de Projetos", filial: "Senior Filial SPI",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "2 anos, 3 meses", tempoCargoAtual: "2 anos, 3 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 0,
    admissoes2024: 1, admissoes2025: 1, ultimoQuadranteReview: "Desempenho abaixo do esperado",
    atingimentoCR2024: 80.06, atingimentoCR2025: 130.10, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 100, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", moodsENPS: [null, null, 67, 33, 33, 0, 50, 50, 60],
    mediaENPSGestor2025: 42, percentDesligamentos2024: 20, percentDesligamentos2025: 17,
    indicados: [{ nome: "Samuel Mendes", cargoAtual: "Gerente de Projetos II", nivelCarreira: "P2", prontidao: "De 2 a 3 anos", diretoria: "Diretoria de Serviços", status: "Ativo" }],
    jobRotation: null
  },
  {
    id: "3", nome: "Pedro da Luz", cadastro: "4885", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Isabela Garcia", cargo: "Coordenador de Projetos", filial: "Senior Filial SPI",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "2 anos, 3 meses", tempoCargoAtual: "2 anos, 3 meses", qtdeColabsDiretos2025: 12, qtdeColabsIndiretos2025: 0,
    admissoes2024: 3, admissoes2025: 2, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 114.22, atingimentoCR2025: 131.21, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "", gptwENPS2024: 93, gptwENPS2025: 100, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", moodsENPS: [100, 93, 85, 100, 100, 100, 100, 100, 100],
    mediaENPSGestor2025: 97, percentDesligamentos2024: 0, percentDesligamentos2025: 8,
    indicados: [
      { nome: "Leandro da Luz", cargoAtual: "Executivo Técnico de Negócios III", nivelCarreira: "S3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Serviços", status: "Ativo" },
      { nome: "Davi Peixoto", cargoAtual: "Gerente de Projetos III", nivelCarreira: "P3", prontidao: "Imediato", diretoria: "Diretoria de Serviços", status: "Ativo" }
    ],
    jobRotation: null
  },
  {
    id: "4", nome: "Emanuella Pimenta", cadastro: "5041", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Valentim Alves", cargo: "IT Corporate Executive Manager", filial: "Senior Matriz",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Direto", nivelCarreira: "M3",
    tempoComoLider: "5 anos, 5 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 5, qtdeColabsIndiretos2025: 53,
    admissoes2024: 3, admissoes2025: 1, ultimoQuadranteReview: "Alto potencial e desempenho acima do esperado",
    atingimentoCR2024: 100.31, atingimentoCR2025: 136.75, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Mentoria", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", moodsENPS: [100, 75, 75, 75, 75, 100, 67, 100],
    mediaENPSGestor2025: 83, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [{ nome: "Dr. Carlos Eduardo das Neves", cargoAtual: "Cloud & Infrastructure Manager", nivelCarreira: "M2", prontidao: "De 2 a 3 anos", diretoria: "Diretoria de Desenvolvimento", status: "Ativo" }],
    jobRotation: null
  },
  {
    id: "5", nome: "Sra. Sofia Cavalcante", cadastro: "19051", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Ágatha Rodrigues", cargo: "Diretor Executivo de Novos Negocios", filial: "Senior Matriz",
    diretoria: "Diretoria de Novos Negócios", diretoOuIndireto: "CE", nivelCarreira: "E2",
    tempoComoLider: "14 anos, 1 meses", tempoCargoAtual: "7 anos, 5 meses", qtdeColabsDiretos2025: 11, qtdeColabsIndiretos2025: 395,
    admissoes2024: 4, admissoes2025: 0, ultimoQuadranteReview: "",
    atingimentoCR2024: 117.53, atingimentoCR2025: null, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Mentoria", gptwENPS2024: 100, gptwENPS2025: 100, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", moodsENPS: [83, 75, 100, 100, 100, 100, 80, 100, 100],
    mediaENPSGestor2025: 93, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [
      { nome: "Ana Laura Pastor", cargoAtual: "Diretor de Negócios", nivelCarreira: "E1", prontidao: "Imediato", diretoria: "Diretoria de Mercado", status: "Ativo" },
      { nome: "Sra. Hadassa da Cunha", cargoAtual: "Diretor Comercial", nivelCarreira: "E1", prontidao: "De 3 a 4 anos", diretoria: "Diretoria de Novos Negócios", status: "Ativo" }
    ],
    jobRotation: null
  },
  {
    id: "6", nome: "Gabriel Fernandes", cadastro: "5862", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Maria Alice Santos", cargo: "Gerente de Vendas", filial: "Senior Filial SP",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "4 anos, 7 meses", tempoCargoAtual: "11 meses", qtdeColabsDiretos2025: 9, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 3, ultimoQuadranteReview: "Alto potencial e desempenho esperado",
    atingimentoCR2024: 73.33, atingimentoCR2025: 119.47, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Mentoria", gptwENPS2024: null, gptwENPS2025: 100, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", moodsENPS: [null, 100, 100, 83, 86, 88, 78, 100, 100],
    mediaENPSGestor2025: 92, percentDesligamentos2024: 33, percentDesligamentos2025: 22,
    indicados: [{ nome: "Júlia Barbosa", cargoAtual: "Executivo de Novos Negócios III", nivelCarreira: "S3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Mercado", status: "Ativo" }],
    jobRotation: { nomeLider: "Valentina Nunes", nivelCarreira: "M2", status: "" }
  },
  {
    id: "7", nome: "Sr. Raul Fernandes", cadastro: "5748", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Hadassa Castro", cargo: "Software Development Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "2 anos, 1 meses", tempoCargoAtual: "2 anos, 1 meses", qtdeColabsDiretos2025: 16, qtdeColabsIndiretos2025: 0,
    admissoes2024: 4, admissoes2025: 3, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: 94.67, atingimentoCR2025: 111.37, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 77, gptwENPS2025: 100, gptwLNPS2025: 95,
    gptwEstagioLideranca2025: "O Líder For All", moodsENPS: [89, 88, 100, 75, 100, 70, 88, 88, 100],
    mediaENPSGestor2025: 89, percentDesligamentos2024: 30, percentDesligamentos2025: 19,
    indicados: [{ nome: "Nina Pires", cargoAtual: "Business Analyst III", nivelCarreira: "P3", prontidao: "Imediato", diretoria: "Diretoria de Serviços", status: "Ativo" }],
    jobRotation: null
  },
  {
    id: "8", nome: "Thomas Sales", cadastro: "4972", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Dante Farias", cargo: "Diretor de Negócios", filial: "Sythex Filial SP",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Direto", nivelCarreira: "E1",
    tempoComoLider: "5 anos, 9 meses", tempoCargoAtual: "3 meses", qtdeColabsDiretos2025: 2, qtdeColabsIndiretos2025: 47,
    admissoes2024: 2, admissoes2025: 0, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: 86.81, atingimentoCR2025: 138.99, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Mentoria", gptwENPS2024: 100, gptwENPS2025: 50, gptwLNPS2025: 50,
    gptwEstagioLideranca2025: "O Bom Líder", moodsENPS: [null, 100, 75, 88, 86, 100, 56],
    mediaENPSGestor2025: 84, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [
      { nome: "João Gabriel Casa Grande", cargoAtual: "Coordenador de Vendas", nivelCarreira: "M1", prontidao: "imediato", diretoria: "Diretoria de Mercado", status: "Ativo" },
      { nome: "Agatha Pimenta", cargoAtual: "Coordenador de Vendas", nivelCarreira: "M1", prontidao: "De 3 a 4 anos", diretoria: "Diretoria de Mercado", status: "Ativo" }
    ],
    jobRotation: { nomeLider: "Clara Fonseca", nivelCarreira: "M2", status: "" }
  },
  {
    id: "9", nome: "Oliver Caldeira", cadastro: "667", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Dra. Aurora Borges", cargo: "Gte Universidade Corporativa", filial: "Senior Matriz",
    diretoria: "Diretoria de Pessoas e Organização", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "14 anos, 3 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 26, qtdeColabsIndiretos2025: 0,
    admissoes2024: 8, admissoes2025: 1, ultimoQuadranteReview: "",
    atingimentoCR2024: 131.27, atingimentoCR2025: 146.74, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 72, gptwENPS2025: 82, gptwLNPS2025: 36,
    gptwEstagioLideranca2025: "O Líder Inconsciente", moodsENPS: [89, 76, 71, 73, 88, 68, 88, 57, 94],
    mediaENPSGestor2025: 78, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [{ nome: "Sr. João Guilherme Souza", cargoAtual: "Coordenador de Processos", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria Pessoas e Organização", status: "Ativo" }],
    jobRotation: null
  },
  {
    id: "10", nome: "Camila Mendes", cadastro: "7699", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Joaquim Fogaça", cargo: "Gerente Financeiro", filial: "Senior Matriz",
    diretoria: "Diretoria Administativo e Financeiro", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "2 anos", tempoCargoAtual: "2 anos", qtdeColabsDiretos2025: 20, qtdeColabsIndiretos2025: 52,
    admissoes2024: 13, admissoes2025: 8, ultimoQuadranteReview: "Desempenho abaixo do esperado",
    atingimentoCR2024: 99.50, atingimentoCR2025: 45.20, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 25, gptwENPS2025: 33, gptwLNPS2025: -25,
    gptwEstagioLideranca2025: "O Líder Inconsciente", moodsENPS: [53, 38, 47, 47, 54, 54, 46, 29, 75],
    mediaENPSGestor2025: 49, percentDesligamentos2024: 22, percentDesligamentos2025: 10,
    indicados: [{ nome: "João Lucas Ferreira", cargoAtual: "Coordenador de Faturamento", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria Adm e Financeiro", status: "Ativo" }],
    jobRotation: null
  },
  {
    id: "11", nome: "Ester Fogaça", cadastro: "5110", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Valentina Nunes", cargo: "Coordenador de Vendas", filial: "Senior Filial MT",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "10 meses", tempoCargoAtual: "10 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 0,
    admissoes2024: 1, admissoes2025: 3, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 94.80, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Capacitação para o pool", gptwENPS2024: null, gptwENPS2025: 40, gptwLNPS2025: 60,
    gptwEstagioLideranca2025: "O Bom Líder", moodsENPS: [null, -40, 17, 67, 50, 83, 75, 75, 83],
    mediaENPSGestor2025: 51, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [{ nome: "Bruno Oliveira", cargoAtual: "Executivo Contas - Novos Negócios III", nivelCarreira: "S3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Novos Negócios", status: "Ativo" }],
    jobRotation: null
  },
  {
    id: "12", nome: "Anthony Cassiano", cadastro: "1877", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Mariah Barbosa", cargo: "Head of Product", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "9 anos, 10 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 7, qtdeColabsIndiretos2025: 11,
    admissoes2024: 1, admissoes2025: 0, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: 121.49, atingimentoCR2025: 127.42, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 71, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", moodsENPS: [null, null, null, null, null, null, null, 100, 100],
    mediaENPSGestor2025: 100, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: { nomeLider: "Dom Cirino", nivelCarreira: "M2", status: "" }
  }
];

// Statistics functions
export const getStatistics = () => {
  const total = allLeaders.length;
  const byLevel = allLeaders.reduce((acc, l) => { acc[l.nivelCarreira] = (acc[l.nivelCarreira] || 0) + 1; return acc; }, {} as Record<string, number>);
  const byDir = allLeaders.reduce((acc, l) => { acc[l.diretoria] = (acc[l.diretoria] || 0) + 1; return acc; }, {} as Record<string, number>);
  const succ2024 = allLeaders.filter(l => l.mapeadoSucessor2024 === "Sim").length;
  const succ2025 = allLeaders.filter(l => l.mapeadoSucessor2025 === "Sim").length;
  const enps24 = allLeaders.map(l => l.gptwENPS2024).filter((v): v is number => v !== null);
  const enps25 = allLeaders.map(l => l.gptwENPS2025).filter((v): v is number => v !== null);
  const cr24 = allLeaders.map(l => l.atingimentoCR2024).filter((v): v is number => v !== null);
  const cr25 = allLeaders.map(l => l.atingimentoCR2025).filter((v): v is number => v !== null);
  const indicados = allLeaders.reduce((acc, l) => acc + l.indicados.length, 0);
  const risco = allLeaders.filter(l => (l.gptwENPS2025 !== null && l.gptwENPS2025 < 50) || (l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80)).length;
  
  return {
    totalLeaders: total, byCareerLevel: byLevel, byDirectorate: byDir,
    mappedAsSuccessor2024: succ2024, mappedAsSuccessor2025: succ2025,
    avgENPS2024: enps24.length ? Math.round(enps24.reduce((a,b) => a+b, 0) / enps24.length) : 0,
    avgENPS2025: enps25.length ? Math.round(enps25.reduce((a,b) => a+b, 0) / enps25.length) : 0,
    avgCR2024: cr24.length ? Math.round(cr24.reduce((a,b) => a+b, 0) / cr24.length * 100) / 100 : 0,
    avgCR2025: cr25.length ? Math.round(cr25.reduce((a,b) => a+b, 0) / cr25.length * 100) / 100 : 0,
    totalIndicados: indicados, highRiskLeaders: risco,
    inMentoring: allLeaders.filter(l => l.participantePoolMentoria?.includes("Mentoria")).length
  };
};

export const getENPSByMonth = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
  return months.map((m, i) => {
    const vals = allLeaders.map(l => l.moodsENPS[i]).filter((v): v is number => v !== null);
    return { month: m, enps: vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : null };
  }).filter(m => m.enps !== null);
};

export const getLeadershipReviewDistribution = () => {
  const dist = allLeaders.filter(l => l.ultimoQuadranteReview).reduce((acc, l) => {
    acc[l.ultimoQuadranteReview] = (acc[l.ultimoQuadranteReview] || 0) + 1; return acc;
  }, {} as Record<string, number>);
  return Object.entries(dist).map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, fullName: name, value }));
};

export const getSuccessionPipeline = () => {
  const pipe = allLeaders.reduce((acc, l) => {
    if (!acc[l.diretoria]) acc[l.diretoria] = { lideres: 0, indicados: 0, prontoImediato: 0 };
    acc[l.diretoria].lideres++; acc[l.diretoria].indicados += l.indicados.length;
    l.indicados.forEach(ind => { if (ind.prontidao.toLowerCase().includes('imediato')) acc[l.diretoria].prontoImediato++; });
    return acc;
  }, {} as Record<string, { lideres: number; indicados: number; prontoImediato: number }>);
  return Object.entries(pipe).map(([d, data]) => ({ diretoria: d.replace('Diretoria de ', '').replace('Diretoria ', ''), ...data }));
};

export const getTopPerformers = () => allLeaders.filter(l => l.atingimentoCR2025 !== null && l.gptwENPS2025 !== null)
  .map(l => ({ nome: l.nome, cargo: l.cargo, diretoria: l.diretoria, cr2025: l.atingimentoCR2025, enps2025: l.gptwENPS2025, score: ((l.atingimentoCR2025||0) + (l.gptwENPS2025||0)) / 2 }))
  .sort((a, b) => (b.score||0) - (a.score||0)).slice(0, 10);

export const getHighRiskLeaders = () => allLeaders
  .filter(l => (l.gptwENPS2025 !== null && l.gptwENPS2025 < 50) || (l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80) || (l.percentDesligamentos2025 || 0) > 15)
  .map(l => ({ nome: l.nome, cargo: l.cargo, diretoria: l.diretoria, enps2025: l.gptwENPS2025, cr2025: l.atingimentoCR2025, turnover: l.percentDesligamentos2025,
    riskFactors: [l.gptwENPS2025 !== null && l.gptwENPS2025 < 50 ? 'ENPS Baixo' : null, l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80 ? 'CR Baixo' : null, (l.percentDesligamentos2025 || 0) > 15 ? 'Alta Rotatividade' : null].filter(Boolean) }))
  .slice(0, 10);

export const getJobRotationData = () => allLeaders.filter(l => l.jobRotation !== null).map(l => ({ lider: l.nome, cargo: l.cargo, diretoria: l.diretoria, nivelCarreira: l.nivelCarreira, tempoCargoAtual: l.tempoCargoAtual, jobRotation: l.jobRotation }));

export const getDiretorias = () => [...new Set(allLeaders.map(l => l.diretoria))].sort();
export const getNiveisCarreira = () => [...new Set(allLeaders.map(l => l.nivelCarreira))].sort();