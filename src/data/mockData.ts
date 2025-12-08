// Real data extracted from Dados_sucessão.xlsx

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
  gptwIVR2024: number | null;
  gptwIVR2025: number | null;
  moodsENPS: (number | null)[];
  mediaENPSGestor2025: number | null;
  percentDesligamentos2024: number | null;
  percentDesligamentos2025: number | null;
  indicados: Indicado[];
  jobRotation: { nomeLider: string; nivelCarreira: string; status: string; tempoNoCargo: number } | null;
}

export interface Indicado {
  nome: string;
  cargoAtual: string;
  nivelCarreira: string;
  prontidao: string;
  diretoria: string;
  status: string;
  enps2024?: number | null;
  enps2025?: number | null;
  atingimentoCR2024?: number | null;
}

// Real data from Dados_sucessão.xlsx
export const allLeaders: Leader[] = [
  {
    id: "1", nome: "Alexia da Rosa", cadastro: "9138", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Brenda Rezende", cargo: "Head of Product", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "4 meses", tempoCargoAtual: "4 meses", qtdeColabsDiretos2025: 1, qtdeColabsIndiretos2025: 17,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "", atingimentoCR2024: null, atingimentoCR2025: null,
    mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não", participantePoolMentoria: "Em andamento",
    gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null, gptwEstagioLideranca2025: "",
    gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [], mediaENPSGestor2025: null, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "2", nome: "Gustavo Silveira", cadastro: "7291", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Sara Novaes", cargo: "Coordenador de Vendas", filial: "Senior Flow",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "8 meses", tempoCargoAtual: "8 meses", qtdeColabsDiretos2025: 7, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 1, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 148.00, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, 100, 80, 40, 63, 100, 80],
    mediaENPSGestor2025: 77, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "3", nome: "Emilly Sousa", cadastro: "9176", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Léo Viana", cargo: "Coordenador de Faturamento", filial: "Senior Matriz",
    diretoria: "Diretoria Administrativo e Financeiro", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "3 meses", tempoCargoAtual: "3 meses", qtdeColabsDiretos2025: 33, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 7, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: null, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [], mediaENPSGestor2025: null, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "4", nome: "Maya Moreira", cadastro: "2836", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Hadassa Castro", cargo: "Coordenador de Projetos", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "1 ano, 9 meses", tempoCargoAtual: "1 ano, 2 meses", qtdeColabsDiretos2025: 5, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 0, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: null, atingimentoCR2025: 111.37, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: 100, gptwLNPS2025: 71.43,
    gptwEstagioLideranca2025: "O Bom Líder", gptwIVR2024: null, gptwIVR2025: 75,
    moodsENPS: [null, 100, 100, 60, 100, 75, null, null, 100, 100],
    mediaENPSGestor2025: 91, percentDesligamentos2024: 0, percentDesligamentos2025: 17,
    indicados: [], jobRotation: null
  },
  {
    id: "5", nome: "Asafe Cavalcante", cadastro: "8120", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Dra. Aurora Borges", cargo: "Coordenador de Processos", filial: "Senior Matriz",
    diretoria: "Diretoria de Pessoas e Organização", diretoOuIndireto: "Direto", nivelCarreira: "M1",
    tempoComoLider: "1 ano, 5 meses", tempoCargoAtual: "1 ano, 5 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 0,
    admissoes2024: 3, admissoes2025: 3, ultimoQuadranteReview: "",
    atingimentoCR2024: 95.31, atingimentoCR2025: 59.81, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Grupo de clima 2025", gptwENPS2024: null, gptwENPS2025: 50, gptwLNPS2025: 16.67,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: null, gptwIVR2025: 57.14,
    moodsENPS: [83.33, 83.33, 83.33, 80, 100, 40, 60, 83],
    mediaENPSGestor2025: 60, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: { nomeLider: "João Lucas Ferreira", nivelCarreira: "M1", status: "Em análise", tempoNoCargo: 1.4 }
  },
  {
    id: "6", nome: "Anthony Cassiano", cadastro: "1877", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Mariah Barbosa", cargo: "Head of Product", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "9 anos, 10 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 7, qtdeColabsIndiretos2025: 11,
    admissoes2024: 1, admissoes2025: 0, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: 121.49, atingimentoCR2025: 127.42, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 71.43, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "O bom Líder", gptwIVR2024: 82, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, null, 100, 100],
    mediaENPSGestor2025: 85, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: { nomeLider: "Dom Cirino", nivelCarreira: "M2", status: "Concluído", tempoNoCargo: 3.4 }
  },
  {
    id: "7", nome: "Luiz Fernando Nogueira", cadastro: "1100", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Luiz Gustavo Viana", cargo: "Coordenador de Inovação", filial: "Senior Matriz",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "13 anos, 6 meses", tempoCargoAtual: "6 anos, 9 meses", qtdeColabsDiretos2025: 3, qtdeColabsIndiretos2025: 0,
    admissoes2024: 1, admissoes2025: 3, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 308.16, atingimentoCR2025: 66.67, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, 67, null, 100, 50, 67, 0],
    mediaENPSGestor2025: 57, percentDesligamentos2024: 50, percentDesligamentos2025: 67,
    indicados: [], jobRotation: null
  },
  {
    id: "8", nome: "Sr. Liam Melo", cadastro: "19048", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Ágatha Rodrigues", cargo: "Diretor Presidente", filial: "Senior Matriz",
    diretoria: "Presidência", diretoOuIndireto: "CE", nivelCarreira: "PRES",
    tempoComoLider: "13 anos, 6 meses", tempoCargoAtual: "13 anos, 6 meses", qtdeColabsDiretos2025: 11, qtdeColabsIndiretos2025: 2685,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "",
    atingimentoCR2024: 104.37, atingimentoCR2025: 84.55, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 100, gptwENPS2025: 100, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: 95, gptwIVR2025: 95,
    moodsENPS: [100, 100, 100, 100, 100, 100, 100, 100, 100],
    mediaENPSGestor2025: 100, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "9", nome: "Amanda Freitas", cadastro: "5156", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Isis da Conceição", cargo: "Coordenador de Projetos", filial: "Alcis Filial SP",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "1 meses", tempoCargoAtual: "2 meses", qtdeColabsDiretos2025: 0, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 2, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: null, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, null, null, 100],
    mediaENPSGestor2025: 100, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "10", nome: "Ryan Campos", cadastro: "7477", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Sara Novaes", cargo: "Coord de MKT e Produto", filial: "Senior Flow",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "8 meses", tempoCargoAtual: "8 meses", qtdeColabsDiretos2025: 9, qtdeColabsIndiretos2025: 0,
    admissoes2024: 4, admissoes2025: 4, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 148.00, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, 50, 78, 63, 67, 80, 67],
    mediaENPSGestor2025: 68, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "11", nome: "Erick Andrade", cadastro: "7110", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Mariah Barbosa", cargo: "Head of Product", filial: "Globaltec",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "2 anos, 11 meses", tempoCargoAtual: "2 anos, 11 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 6,
    admissoes2024: 0, admissoes2025: 1, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 140.83, atingimentoCR2025: 129.08, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: 100, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: null, gptwIVR2025: 95,
    moodsENPS: [100, null, null, null, null, null, 100, 100, 80],
    mediaENPSGestor2025: 78, percentDesligamentos2024: 0, percentDesligamentos2025: 17,
    indicados: [], jobRotation: { nomeLider: "Lucas Gabriel Cavalcante", nivelCarreira: "M2", status: "Em análise", tempoNoCargo: 2.9 }
  },
  {
    id: "12", nome: "Davi Lucas Pimenta", cadastro: "5872", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Dr. Fernando da Costa", cargo: "Software Development Team Lead", filial: "Mega Filial PR",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "4 anos, 7 meses", tempoCargoAtual: "1 ano, 4 meses", qtdeColabsDiretos2025: 24, qtdeColabsIndiretos2025: 0,
    admissoes2024: 3, admissoes2025: 2, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 83.74, atingimentoCR2025: 128.83, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 60, gptwENPS2025: 58.33, gptwLNPS2025: 25,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: 88, gptwIVR2025: 75,
    moodsENPS: [85.71, 68.18, 65, 52.38, 65, 59, 67, 67, 71],
    mediaENPSGestor2025: 88, percentDesligamentos2024: 12, percentDesligamentos2025: 8,
    indicados: [], jobRotation: null
  },
  {
    id: "13", nome: "Lara Montenegro", cadastro: "9002", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Dra. Ana Julia Monteiro", cargo: "Coordenador de Administração de Serviços", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "6 meses", tempoCargoAtual: "6 meses", qtdeColabsDiretos2025: 8, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 3, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 108.99, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, 17, 0, 40, 13, 100],
    mediaENPSGestor2025: 34, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "14", nome: "Pedro Lucas Macedo", cadastro: "2700", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Levi Viana", cargo: "Coordenador de Projetos", filial: "Senior Filial SP",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "3 anos, 1 meses", tempoCargoAtual: "2 anos, 3 meses", qtdeColabsDiretos2025: 3, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 80.06, atingimentoCR2025: 130.10, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: -25, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "Líder Inconsciente", gptwIVR2024: 65, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, null, null, null],
    mediaENPSGestor2025: 8, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "15", nome: "Dr. Matteo Mendes", cadastro: "7679", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Levi Viana", cargo: "Coordenador de Projetos", filial: "Senior Filial SP",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "2 anos", tempoCargoAtual: "2 anos", qtdeColabsDiretos2025: 0, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 4, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 111.82, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, null, 80, 50],
    mediaENPSGestor2025: 65, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "16", nome: "Camila Sousa", cadastro: "6814", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Mariah Barbosa", cargo: "Head of Product", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "3 anos, 3 meses", tempoCargoAtual: "3 anos, 3 meses", qtdeColabsDiretos2025: 4, qtdeColabsIndiretos2025: 75,
    admissoes2024: 1, admissoes2025: 0, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 94.19, atingimentoCR2025: 137.49, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "", gptwENPS2024: 71.43, gptwENPS2025: 100, gptwLNPS2025: 20,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: 88, gptwIVR2025: 95,
    moodsENPS: [100, 75, 80, 75, 100, 75, 75, 25, 100],
    mediaENPSGestor2025: 89, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: { nomeLider: "Juliana Vieira", nivelCarreira: "M2", status: "Concluído", tempoNoCargo: 3.3 }
  },
  {
    id: "17", nome: "Raul Cassiano", cadastro: "5573", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Emanuelly Pires", cargo: "Software Development Team Lead", filial: "Konviva",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "1 ano, 6 meses", tempoCargoAtual: "1 ano, 6 meses", qtdeColabsDiretos2025: 22, qtdeColabsIndiretos2025: 0,
    admissoes2024: 4, admissoes2025: 2, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 127.75, atingimentoCR2025: 39.00, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: 61.11, gptwLNPS2025: 88.89,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: null, gptwIVR2025: 85,
    moodsENPS: [80, 70, 76.47, 78.57, 76, 86, 69, 89, 71],
    mediaENPSGestor2025: 55, percentDesligamentos2024: 19, percentDesligamentos2025: 14,
    indicados: [], jobRotation: null
  },
  {
    id: "18", nome: "Carlos Eduardo Lima", cadastro: "1408", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Sr. Isaque Castro", cargo: "Software Development Team Lead", filial: "Sythex Filial RP",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "3 anos, 9 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 38, qtdeColabsIndiretos2025: 0,
    admissoes2024: 5, admissoes2025: 5, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 103.00, atingimentoCR2025: 140.48, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 70.83, gptwENPS2025: 64.71, gptwLNPS2025: 73.53,
    gptwEstagioLideranca2025: "O Bom Líder", gptwIVR2024: 78, gptwIVR2025: 75,
    moodsENPS: [77.42, 67.74, 71.88, 67.74, 76, 66, 64, 53, 63],
    mediaENPSGestor2025: 68, percentDesligamentos2024: 14, percentDesligamentos2025: 8,
    indicados: [], jobRotation: null
  },
  {
    id: "19", nome: "Julia Cunha", cadastro: "4464", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Dra. Ana Julia Monteiro", cargo: "Gestor de Serviços de Filiais", filial: "Senior Filial MG",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "6 anos, 1 meses", tempoCargoAtual: "2 anos, 4 meses", qtdeColabsDiretos2025: 0, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 128.76, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [],
    mediaENPSGestor2025: null, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "20", nome: "Raquel Caldeira", cadastro: "2853", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Noah Cassiano", cargo: "IT Services & Cloud Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "9 meses", tempoCargoAtual: "9 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 1, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 115.41, atingimentoCR2025: 145.88, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: 83.33,
    moodsENPS: [50, 100, 85.71, 80, 67, 43, 43, 50],
    mediaENPSGestor2025: 97, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "21", nome: "Bella Teixeira", cadastro: "5662", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Dr. Carlos Eduardo das Neves", cargo: "Cyber Security Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "1 ano, 5 meses", tempoCargoAtual: "1 ano, 5 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 2, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: null, atingimentoCR2025: 83.33, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: 25,
    moodsENPS: [75, 83.33, 66.67, 67, 83, 80, 100, 67],
    mediaENPSGestor2025: 58, percentDesligamentos2024: 0, percentDesligamentos2025: 33,
    indicados: [], jobRotation: null
  },
  {
    id: "22", nome: "Melissa Lopes", cadastro: "4404", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Mariah Barbosa", cargo: "Head of Product", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "6 anos, 2 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 4, qtdeColabsIndiretos2025: 1,
    admissoes2024: 0, admissoes2025: 1, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 96.09, atingimentoCR2025: 162.99, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Mentoria", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: 100,
    moodsENPS: [null, 100, 100, 50, 100, 100, 75, 100],
    mediaENPSGestor2025: 81, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: { nomeLider: "Noah Pacheco", nivelCarreira: "M2", status: "Em análise", tempoNoCargo: 3.4 }
  },
  {
    id: "23", nome: "Dr. Luan Fernandes", cadastro: "8750", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Maria Júlia Santos", cargo: "Gerente de Desenvolvimento e Produto", filial: "Hypnobox",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "11 meses", tempoCargoAtual: "11 meses", qtdeColabsDiretos2025: 10, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 8, ultimoQuadranteReview: "Alto potencial e desempenho abaixo do esperado",
    atingimentoCR2024: null, atingimentoCR2025: 0, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [100, 40, 36.36, 50, 20, 13, 22, 22, 38],
    mediaENPSGestor2025: 38, percentDesligamentos2024: 0, percentDesligamentos2025: 10,
    indicados: [], jobRotation: null
  },
  {
    id: "24", nome: "Sr. Davi Ramos", cadastro: "8846", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Bruno Monteiro", cargo: "Cyber Security Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "8 meses", tempoCargoAtual: "8 meses", qtdeColabsDiretos2025: 7, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 1, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 133.96, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, 20, 50, 100, 83, 50, 33, 50],
    mediaENPSGestor2025: 55, percentDesligamentos2024: 30, percentDesligamentos2025: 43,
    indicados: [], jobRotation: null
  },
  {
    id: "25", nome: "Ryan Farias", cadastro: "1810", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Dante Farias", cargo: "Gerente de Soluções & Serviços", filial: "Senior Matriz",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "10 anos, 5 meses", tempoCargoAtual: "1 ano, 8 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 83,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "Alto potencial e desempenho acima do esperado",
    atingimentoCR2024: 92.08, atingimentoCR2025: 52.60, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Mentoria", gptwENPS2024: null, gptwENPS2025: 100, gptwLNPS2025: 66.67,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: null, gptwIVR2025: 95,
    moodsENPS: [100, 100, 100, 100, 100, 100, 100, 100, 83],
    mediaENPSGestor2025: 85, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [{ nome: "Aylla Gonçalves", cargoAtual: "Gerente de Projetos", nivelCarreira: "M2", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Mercado", status: "Ativo", enps2024: 80, enps2025: 85, atingimentoCR2024: 92.08 }],
    jobRotation: null
  },
  {
    id: "26", nome: "Pietro Martins", cadastro: "9151", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Laura Castro", cargo: "Coordenador de Vendas", filial: "GAtec",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "4 meses", tempoCargoAtual: "4 meses", qtdeColabsDiretos2025: 7, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 1, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: null, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, 80, 60, 33],
    mediaENPSGestor2025: 58, percentDesligamentos2024: 0, percentDesligamentos2025: 14,
    indicados: [], jobRotation: null
  },
  {
    id: "27", nome: "Ana Sophia Nunes", cadastro: "8808", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Alice Moraes", cargo: "Marketing Coordinator", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "10 meses", tempoCargoAtual: "10 meses", qtdeColabsDiretos2025: 23, qtdeColabsIndiretos2025: 0,
    admissoes2024: 9, admissoes2025: 9, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: null, atingimentoCR2025: 97.89, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Finalizado", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: 64.29,
    moodsENPS: [50, 52.94, 58.82, 56, 74, 68, 81, 88],
    mediaENPSGestor2025: 66, percentDesligamentos2024: 10, percentDesligamentos2025: 17,
    indicados: [], jobRotation: null
  },
  {
    id: "28", nome: "Sra. Cecilia Carvalho", cadastro: "874", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Joaquim Fogaça", cargo: "Financial Planning and Analysis Coordinator", filial: "Senior Matriz",
    diretoria: "Diretoria Administrativo e Financeiro", diretoOuIndireto: "Direto", nivelCarreira: "M1",
    tempoComoLider: "10 anos", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 16, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 2, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 98.84, atingimentoCR2025: 83.75, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Mentoria", gptwENPS2024: 54.55, gptwENPS2025: 53.85, gptwLNPS2025: 42.86,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: 78, gptwIVR2025: 82,
    moodsENPS: [80, 60, 41.67, 50, 60, 56, 69, 67, 83],
    mediaENPSGestor2025: 52, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: { nomeLider: "Clarice Duarte", nivelCarreira: "M1", status: "Em análise", tempoNoCargo: 3.4 }
  },
  {
    id: "29", nome: "Maria Eduarda Vargas", cadastro: "7707", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Mariah Barbosa", cargo: "Marketing Manager", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "1 ano, 10 meses", tempoCargoAtual: "1 ano, 10 meses", qtdeColabsDiretos2025: 5, qtdeColabsIndiretos2025: 34,
    admissoes2024: 2, admissoes2025: 1, ultimoQuadranteReview: "Alto potencial e desempenho esperado",
    atingimentoCR2024: 97.21, atingimentoCR2025: 97.89, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 60, gptwENPS2025: 100, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: 78, gptwIVR2025: 95,
    moodsENPS: [100, 100, 100, 100, 100, 75, 100, 100, 100],
    mediaENPSGestor2025: 93, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "30", nome: "Srta. Stephany da Mata", cadastro: "6558", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Noah Aparecida", cargo: "Coordenador de Vendas", filial: "Senior Filial SPI",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "4 meses", tempoCargoAtual: "4 meses", qtdeColabsDiretos2025: 5, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: null, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Capacitação para o pool", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, 80, 80, 100],
    mediaENPSGestor2025: 87, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "31", nome: "Benjamim Brito", cadastro: "6079", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Noah Cassiano", cargo: "IT Services & Cloud Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "4 anos, 2 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 22, qtdeColabsIndiretos2025: 0,
    admissoes2024: 7, admissoes2025: 9, ultimoQuadranteReview: "Desempenho abaixo do esperado",
    atingimentoCR2024: 100.55, atingimentoCR2025: 125.07, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 86.67, gptwENPS2025: 61.54, gptwLNPS2025: 46.15,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: 78, gptwIVR2025: 75,
    moodsENPS: [40, 37.5, 57.14, 66.67, 11, 10, 42, 11, 30],
    mediaENPSGestor2025: 59, percentDesligamentos2024: 0, percentDesligamentos2025: 5,
    indicados: [], jobRotation: null
  },
  {
    id: "32", nome: "Nathan Fonseca", cadastro: "4078", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Dra. Ana Julia Monteiro", cargo: "Gestor de Serviços de Filiais", filial: "Senior Filial PE",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "6 anos, 1 meses", tempoCargoAtual: "2 anos, 4 meses", qtdeColabsDiretos2025: 0, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 123.63, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [],
    mediaENPSGestor2025: null, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "33", nome: "Maria Vitória Castro", cadastro: "8815", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Danilo Santos", cargo: "Sales Development Representative Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "10 meses", tempoCargoAtual: "10 meses", qtdeColabsDiretos2025: 18, qtdeColabsIndiretos2025: 0,
    admissoes2024: 6, admissoes2025: 14, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: null, atingimentoCR2025: 158.26, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Finalizado", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, 69.23, 76.92, 58.33, 77, 80, 91, 79, 73],
    mediaENPSGestor2025: 76, percentDesligamentos2024: 0, percentDesligamentos2025: 11,
    indicados: [], jobRotation: null
  },
  {
    id: "34", nome: "Matteo Silva", cadastro: "624", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Diogo Abreu", cargo: "Corporate Venture Manager", filial: "Senior Matriz",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "8 anos, 11 meses", tempoCargoAtual: "1 ano, 10 meses", qtdeColabsDiretos2025: 1, qtdeColabsIndiretos2025: 6,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "Desempenho abaixo do esperado",
    atingimentoCR2024: 53.00, atingimentoCR2025: 89.45, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Mentoria", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, null, null, 100],
    mediaENPSGestor2025: 100, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: { nomeLider: "Gael Henrique da Cruz", nivelCarreira: "M2", status: "Em análise", tempoNoCargo: 1.8 }
  },
  {
    id: "35", nome: "Luiz Felipe Casa Grande", cadastro: "7725", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Hadassa Castro", cargo: "Coordenador de Projetos", filial: "Senior Filial RS",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "1 ano, 10 meses", tempoCargoAtual: "6 meses", qtdeColabsDiretos2025: 5, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 3, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 131.50, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, null, null, null, null, 0, 75, -20],
    mediaENPSGestor2025: 18, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "36", nome: "Gustavo Henrique Lima", cadastro: "8759", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Maria Júlia Santos", cargo: "Gerente de Vendas", filial: "Hypnobox",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "11 meses", tempoCargoAtual: "11 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 0,
    admissoes2024: 1, admissoes2025: 4, ultimoQuadranteReview: "Desempenho abaixo do esperado",
    atingimentoCR2024: null, atingimentoCR2025: 69.68, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, 100, 80, 80, 83, 83, 80, 100],
    mediaENPSGestor2025: 87, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "37", nome: "Dr. Gabriel Sousa", cadastro: "5138", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Heitor Vieira", cargo: "Coordenador Intelig. de Vendas", filial: "Senior Matriz",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "7 meses", tempoCargoAtual: "7 meses", qtdeColabsDiretos2025: 0, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: null, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [],
    mediaENPSGestor2025: null, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "38", nome: "Giovanna da Conceição", cadastro: "8765", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Maria Júlia Santos", cargo: "Gerente de Uselink", filial: "Hypnobox",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "11 meses", tempoCargoAtual: "11 meses", qtdeColabsDiretos2025: 10, qtdeColabsIndiretos2025: 0,
    admissoes2024: 3, admissoes2025: 2, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: null, atingimentoCR2025: 48.59, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, 11.11, 33.33, 40, 50, 70, 50, 70, 70],
    mediaENPSGestor2025: 49, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [], jobRotation: null
  },
  {
    id: "39", nome: "Eduarda Freitas", cadastro: "8653", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Luiz Gustavo Viana", cargo: "Software Development Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "1 ano", tempoCargoAtual: "1 ano", qtdeColabsDiretos2025: 18, qtdeColabsIndiretos2025: 0,
    admissoes2024: 8, admissoes2025: 6, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: null, atingimentoCR2025: 121.11, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Grupo de clima 2025", gptwENPS2024: null, gptwENPS2025: 42.86, gptwLNPS2025: 14.29,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: null, gptwIVR2025: 75,
    moodsENPS: [33.33, 46.67, 46.15, 56.25, 47, 39, 47, 74, 78],
    mediaENPSGestor2025: 66, percentDesligamentos2024: 22, percentDesligamentos2025: 22,
    indicados: [], jobRotation: null
  },
  {
    id: "40", nome: "Rafael Moreira", cadastro: "7829", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Danilo Santos", cargo: "Sales Development Representative Team Lead", filial: "Senior Matriz",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "1 ano, 8 meses", tempoCargoAtual: "1 ano, 8 meses", qtdeColabsDiretos2025: 10, qtdeColabsIndiretos2025: 0,
    admissoes2024: 3, admissoes2025: 5, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: 103.30, atingimentoCR2025: 158.26, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Finalizado", gptwENPS2024: null, gptwENPS2025: 83.33, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: null, gptwIVR2025: 95,
    moodsENPS: [100, 100, 100, 100, 100, 88, 100, 86, 100],
    mediaENPSGestor2025: 83, percentDesligamentos2024: 50, percentDesligamentos2025: 30,
    indicados: [], jobRotation: null
  },
  {
    id: "41", nome: "Gael Martins", cadastro: "3312", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Diogo Abreu", cargo: "Coordenador de Negócios", filial: "Ecossistema",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Direto", nivelCarreira: "M1",
    tempoComoLider: "8 anos, 10 meses", tempoCargoAtual: "8 meses", qtdeColabsDiretos2025: 5, qtdeColabsIndiretos2025: 0,
    admissoes2024: 1, admissoes2025: 6, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 92.19, atingimentoCR2025: 96.97, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Capacitação para o pool", gptwENPS2024: 42.86, gptwENPS2025: 88.89, gptwLNPS2025: 88.89,
    gptwEstagioLideranca2025: "O Bom Líder", gptwIVR2024: 75, gptwIVR2025: 85,
    moodsENPS: [100, 100, 90.91, 100, 100, 100, 100, 63, 63],
    mediaENPSGestor2025: 63, percentDesligamentos2024: 0, percentDesligamentos2025: 20,
    indicados: [
      { nome: "Vicente Pastor", cargoAtual: "Executivo de Parcerias III", nivelCarreira: "S3", prontidao: "De 2 a 3 anos", diretoria: "Diretoria de Novos Negócios", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: null },
      { nome: "Isabella Pacheco", cargoAtual: "Product Analyst II", nivelCarreira: "P2", prontidao: "De 2 a 3 anos", diretoria: "Diretoria de Novos Negócios", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: null }
    ],
    jobRotation: null
  },
  {
    id: "42", nome: "Asafe Barros", cadastro: "633", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Beatriz Caldeira", cargo: "Coordenador de Suporte", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "4 anos, 6 meses", tempoCargoAtual: "4 anos, 6 meses", qtdeColabsDiretos2025: 26, qtdeColabsIndiretos2025: 0,
    admissoes2024: 8, admissoes2025: 4, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 102.82, atingimentoCR2025: 134.80, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Finalizado", gptwENPS2024: 76.19, gptwENPS2025: 84.21, gptwLNPS2025: 89.47,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: 78, gptwIVR2025: 85,
    moodsENPS: [100, 93.33, 84.62, 85.71, 27, -23, 20, 35, 60],
    mediaENPSGestor2025: 71, percentDesligamentos2024: 12, percentDesligamentos2025: 12,
    indicados: [{ nome: "Maysa Teixeira", cargoAtual: "Analista Técnico de Suporte", nivelCarreira: "P3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 102.82 }],
    jobRotation: { nomeLider: "Alexandre Rodrigues", nivelCarreira: "M1", status: "Em análise", tempoNoCargo: 4.5 }
  },
  {
    id: "43", nome: "Thiago Nunes", cadastro: "3394", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Hadassa Castro", cargo: "Coordenador de Projetos", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "9 meses", tempoCargoAtual: "9 meses", qtdeColabsDiretos2025: 11, qtdeColabsIndiretos2025: 0,
    admissoes2024: 3, admissoes2025: 1, ultimoQuadranteReview: "",
    atingimentoCR2024: null, atingimentoCR2025: 111.37, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, 80, 100, 89, 100, 78, 64, 80],
    mediaENPSGestor2025: 84, percentDesligamentos2024: 0, percentDesligamentos2025: 9,
    indicados: [
      { nome: "Alana Almeida", cargoAtual: "Executivo Técnico de Negócios III", nivelCarreira: "P3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 120.46 },
      { nome: "Carlos Eduardo Cavalcante", cargoAtual: "Business Analyst II", nivelCarreira: "P2", prontidao: "De 2 a 3 anos", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: null }
    ],
    jobRotation: null
  },
  {
    id: "44", nome: "Ana Laura Nunes", cadastro: "4489", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Milena Barbosa", cargo: "Gerente de Suporte", filial: "Mega Filial SPI",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "6 anos, 8 meses", tempoCargoAtual: "4 anos, 6 meses", qtdeColabsDiretos2025: 7, qtdeColabsIndiretos2025: 81,
    admissoes2024: 1, admissoes2025: 0, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 100.03, atingimentoCR2025: 139.40, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: null,
    moodsENPS: [null, null, 100, 100, 100, 100, 75, 75, 67],
    mediaENPSGestor2025: 93, percentDesligamentos2024: 14, percentDesligamentos2025: 14,
    indicados: [{ nome: "Sr. Isaac Almeida", cargoAtual: "Coordenador de Suporte", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: 90.31, enps2025: 98, atingimentoCR2024: 101.06 }],
    jobRotation: null
  },
  {
    id: "45", nome: "Pedro da Luz", cadastro: "4885", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Isabela Garcia", cargo: "Coordenador de Projetos", filial: "Senior Filial SPI",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M1",
    tempoComoLider: "2 anos, 3 meses", tempoCargoAtual: "2 anos, 3 meses", qtdeColabsDiretos2025: 12, qtdeColabsIndiretos2025: 0,
    admissoes2024: 3, admissoes2025: 2, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 114.22, atingimentoCR2025: 131.21, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Stand-by", gptwENPS2024: 92.86, gptwENPS2025: 100, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: 85, gptwIVR2025: 85,
    moodsENPS: [100, 92.86, 84.62, 100, 100, 100, 100, 100, 100],
    mediaENPSGestor2025: 96, percentDesligamentos2024: 0, percentDesligamentos2025: 8,
    indicados: [
      { nome: "Leandro da Luz", cargoAtual: "Executivo Técnico de Negócios III", nivelCarreira: "S3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 114.22 },
      { nome: "Davi Peixoto", cargoAtual: "Gerente de Projetos III", nivelCarreira: "P3", prontidao: "Imediato", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 114.22 }
    ],
    jobRotation: null
  },
  {
    id: "46", nome: "Larissa Monteiro", cadastro: "6319", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Bianca Santos", cargo: "Gerente de Filial", filial: "Senior Filial PR",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "4 anos", tempoCargoAtual: "1 ano, 11 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 6,
    admissoes2024: 1, admissoes2025: 2, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 70.68, atingimentoCR2025: 101.95, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Finalizado", gptwENPS2024: 100, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: 92, gptwIVR2025: null,
    moodsENPS: [66.67, 75, 66.67, 100, 83, 100, 100, 100, 100],
    mediaENPSGestor2025: 82, percentDesligamentos2024: 33, percentDesligamentos2025: 17,
    indicados: [
      { nome: "Luiz Gustavo Lima", cargoAtual: "Coordenador de Vendas", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Mercado", status: "Ativo", enps2024: null, enps2025: 75, atingimentoCR2024: 70.68 },
      { nome: "Srta. Melissa Porto", cargoAtual: "Executivo de Novos Negócios III", nivelCarreira: "S3", prontidao: "De 3 a 4 anos", diretoria: "Diretoria de Mercado", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 78.83 }
    ],
    jobRotation: null
  },
  {
    id: "47", nome: "Eduardo Rocha", cadastro: "6118", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Milena Barbosa", cargo: "Gerente de Suporte", filial: "Senior Matriz",
    diretoria: "Diretoria de Serviços", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "4 anos, 2 meses", tempoCargoAtual: "2 meses", qtdeColabsDiretos2025: 20, qtdeColabsIndiretos2025: 0,
    admissoes2024: 2, admissoes2025: 2, ultimoQuadranteReview: "Alto potencial e desempenho acima do esperado",
    atingimentoCR2024: 104.39, atingimentoCR2025: 135.84, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Ambos", gptwENPS2024: 78.95, gptwENPS2025: 77.78, gptwLNPS2025: 72.22,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: 78, gptwIVR2025: 75,
    moodsENPS: [50, 73.33, 76.92, 35.29, 44, -24, 14, 33, null],
    mediaENPSGestor2025: 69, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [
      { nome: "Henry Gabriel Monteiro", cargoAtual: "Analista Técnico de Suporte", nivelCarreira: "P3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 104.39 },
      { nome: "Sra. Catarina Castro", cargoAtual: "Analista de Suporte II", nivelCarreira: "P2", prontidao: "De 3 a 4 anos", diretoria: "Diretoria de Serviços", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 104.39 }
    ],
    jobRotation: null
  },
  {
    id: "48", nome: "Nicole Mendes", cadastro: "2412", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Bianca Santos", cargo: "Gerente de Filial", filial: "Senior Filial RJ",
    diretoria: "Diretoria de Mercado", diretoOuIndireto: "Indireto", nivelCarreira: "M2",
    tempoComoLider: "5 anos, 9 meses", tempoCargoAtual: "11 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 4,
    admissoes2024: 0, admissoes2025: 3, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: 79.99, atingimentoCR2025: 93.37, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "Grupo de clima 2025", gptwENPS2024: 100, gptwENPS2025: 60, gptwLNPS2025: 60,
    gptwEstagioLideranca2025: "O Bom Líder", gptwIVR2024: 95, gptwIVR2025: 85,
    moodsENPS: [100, 100, 83.33, 100, 100, 83, 67, 80, 75],
    mediaENPSGestor2025: 97, percentDesligamentos2024: 0, percentDesligamentos2025: 33,
    indicados: [
      { nome: "Sr. Murilo Monteiro", cargoAtual: "Coordenador de Vendas", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Mercado", status: "Ativo", enps2024: null, enps2025: 100, atingimentoCR2024: 79.99 },
      { nome: "Maria Sophia Sales", cargoAtual: "Coordenador de Vendas", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Mercado", status: "Ativo", enps2024: 68.84, enps2025: 72.62, atingimentoCR2024: 111.55 }
    ],
    jobRotation: null
  },
  {
    id: "49", nome: "Giovanna Camargo", cadastro: "445", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Joaquim Fogaça", cargo: "Gerente Jurídico", filial: "Senior Matriz",
    diretoria: "Diretoria Administrativo e Financeiro", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "12 anos, 11 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 13, qtdeColabsIndiretos2025: 0,
    admissoes2024: 5, admissoes2025: 2, ultimoQuadranteReview: "Desempenho diferenciado",
    atingimentoCR2024: 103.89, atingimentoCR2025: 107.92, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 16.67, gptwENPS2025: 62.5, gptwLNPS2025: 50,
    gptwEstagioLideranca2025: "O Líder Transacional", gptwIVR2024: 68, gptwIVR2025: 78,
    moodsENPS: [33.33, 85.71, 70, 76.92, 82, 100, 75, 60, 90],
    mediaENPSGestor2025: 53, percentDesligamentos2024: 8, percentDesligamentos2025: 15,
    indicados: [
      { nome: "Gabriela Albuquerque", cargoAtual: "Advogado Corporativo III", nivelCarreira: "P3", prontidao: "De 1 a 2 anos", diretoria: "Diretoria Adm e Financeiro", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 103.89 },
      { nome: "Ayla Machado", cargoAtual: "Advogado Corporativo II", nivelCarreira: "P2", prontidao: "De 2 a 3 anos", diretoria: "Diretoria Adm e Financeiro", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 103.89 }
    ],
    jobRotation: null
  },
  {
    id: "50", nome: "Cauã Cardoso", cadastro: "7134", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Valentim Alves", cargo: "Software Development Manager", filial: "Globaltec",
    diretoria: "Diretoria de Desenvolvimento", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "2 anos, 11 meses", tempoCargoAtual: "2 anos, 11 meses", qtdeColabsDiretos2025: 3, qtdeColabsIndiretos2025: 79,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "Desempenho esperado",
    atingimentoCR2024: 97.60, atingimentoCR2025: 128.83, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: 100,
    moodsENPS: [100, 100, 100, 100, 100, 100, 100, 100, 100],
    mediaENPSGestor2025: 89, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [{ nome: "Mateus Sales", cargoAtual: "Software Development Team Lead", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Desenvolvimento", status: "Ativo", enps2024: 80, enps2025: 71, atingimentoCR2024: 106.46 }],
    jobRotation: null
  },
  {
    id: "51", nome: "Pedro Henrique Campos", cadastro: "7310", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Mariah Barbosa", cargo: "Head of Product", filial: "Senior Filial SP",
    diretoria: "Diretoria de Marketing e Produto", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "2 anos, 9 meses", tempoCargoAtual: "2 anos, 9 meses", qtdeColabsDiretos2025: 6, qtdeColabsIndiretos2025: 0,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "Alto potencial e desempenho esperado",
    atingimentoCR2024: 100, atingimentoCR2025: 139.93, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "Mentoria", gptwENPS2024: null, gptwENPS2025: null, gptwLNPS2025: null,
    gptwEstagioLideranca2025: "", gptwIVR2024: null, gptwIVR2025: 75,
    moodsENPS: [75, 75, 75, 75, 60, 83, 80, 83, 83],
    mediaENPSGestor2025: 81, percentDesligamentos2024: 0, percentDesligamentos2025: 0,
    indicados: [
      { nome: "Luiz Gustavo Siqueira", cargoAtual: "Product - Specialist I", nivelCarreira: "P4", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Marketing e Produto", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 100 },
      { nome: "Cauê Correia", cargoAtual: "Product Analyst III", nivelCarreira: "P3", prontidao: "De 3 a 4 anos", diretoria: "Diretoria de Marketing e Produto", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 100 },
      { nome: "Davi Moraes", cargoAtual: "Executivo de Novos Negócios III", nivelCarreira: "S3", prontidao: "De 2 a 3 anos", diretoria: "Diretoria de Mercado", status: "Ativo", enps2024: null, enps2025: null, atingimentoCR2024: 100 }
    ],
    jobRotation: null
  },
  {
    id: "52", nome: "Bruno Casa Grande", cadastro: "3401", sexo: "Feminino", situacao: "Ativo",
    liderDoLider: "Dra. Aurora Borges", cargo: "Gte Relações Trabalhistas e Remuneração", filial: "Senior Matriz",
    diretoria: "Diretoria de Pessoas e Organização", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "14 anos, 5 meses", tempoCargoAtual: "3 anos, 5 meses", qtdeColabsDiretos2025: 7, qtdeColabsIndiretos2025: 16,
    admissoes2024: 6, admissoes2025: 2, ultimoQuadranteReview: "",
    atingimentoCR2024: 126.37, atingimentoCR2025: 141.75, mapeadoSucessor2024: "Não", mapeadoSucessor2025: "Não",
    participantePoolMentoria: "", gptwENPS2024: 85.71, gptwENPS2025: 100, gptwLNPS2025: 16.67,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: 82, gptwIVR2025: 95,
    moodsENPS: [100, 100, 100, 75, 60, 100, 100, 100, 100],
    mediaENPSGestor2025: 73, percentDesligamentos2024: 17, percentDesligamentos2025: 14,
    indicados: [{ nome: "Dr. João Miguel Rocha", cargoAtual: "Coordenador de Administração de Pessoal", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria Pessoas e Organização", status: "Ativo", enps2024: 96.91, enps2025: 100, atingimentoCR2024: 126.37 }],
    jobRotation: null
  },
  {
    id: "53", nome: "Gael Henrique Leão", cadastro: "3287", sexo: "Masculino", situacao: "Ativo",
    liderDoLider: "Diogo Abreu", cargo: "Gerente de Negócios", filial: "Senior Flow",
    diretoria: "Diretoria de Novos Negócios e Relações com Investidores", diretoOuIndireto: "Direto", nivelCarreira: "M2",
    tempoComoLider: "8 anos, 4 meses", tempoCargoAtual: "8 meses", qtdeColabsDiretos2025: 3, qtdeColabsIndiretos2025: 37,
    admissoes2024: 0, admissoes2025: 0, ultimoQuadranteReview: "Desempenho adequado",
    atingimentoCR2024: 92.19, atingimentoCR2025: 148.00, mapeadoSucessor2024: "Sim", mapeadoSucessor2025: "Sim",
    participantePoolMentoria: "", gptwENPS2024: null, gptwENPS2025: 90, gptwLNPS2025: 100,
    gptwEstagioLideranca2025: "O Líder For All", gptwIVR2024: null, gptwIVR2025: 95,
    moodsENPS: [100, 100, 77.78, 100, 100, 100, 100, 67, 100],
    mediaENPSGestor2025: 65, percentDesligamentos2024: 25, percentDesligamentos2025: 33,
    indicados: [{ nome: "Ravi Lucca Carvalho", cargoAtual: "Coordenador de Negócios", nivelCarreira: "M1", prontidao: "De 1 a 2 anos", diretoria: "Diretoria de Novos Negócios", status: "Ativo", enps2024: 63, enps2025: 98, atingimentoCR2024: 92.19 }],
    jobRotation: null
  }
];

// Exports for backward compatibility
export const leaders = allLeaders;

// Get unique diretorias
export const diretorias = [...new Set(allLeaders.map(l => l.diretoria))].sort();
export const getDiretorias = () => diretorias;
export const getNiveisCarreira = () => [...new Set(allLeaders.map(l => l.nivelCarreira))].sort();

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

// Stats function for OverviewView
export const getStats = (data: Leader[]) => {
  const total = data.length;
  const succ2024 = data.filter(l => l.mapeadoSucessor2024 === "Sim").length;
  const succ2025 = data.filter(l => l.mapeadoSucessor2025 === "Sim").length;
  const risco = data.filter(l => (l.gptwENPS2025 !== null && l.gptwENPS2025 < 50) || (l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80) || (l.percentDesligamentos2025 || 0) > 15).length;
  
  const enps24 = data.map(l => l.gptwENPS2024).filter((v): v is number => v !== null);
  const enps25 = data.map(l => l.gptwENPS2025).filter((v): v is number => v !== null);
  const moods = data.flatMap(l => l.moodsENPS).filter((v): v is number => v !== null);
  
  const participantes = data.filter(l => l.participantePoolMentoria && l.participantePoolMentoria.length > 0).length;
  
  // Prontidão calculation based on indicados
  const allIndicados = data.flatMap(l => l.indicados);
  const readyNow = allIndicados.filter(i => i.prontidao.toLowerCase().includes('imediato')).length;
  const readySoon = allIndicados.filter(i => i.prontidao.toLowerCase().includes('1 a 2')).length;
  const readyLater = allIndicados.filter(i => i.prontidao.toLowerCase().includes('2 a 3') || i.prontidao.toLowerCase().includes('3 a 4')).length;
  const naoMapeado = total - data.filter(l => l.indicados.length > 0).length;
  
  return {
    total,
    percSucessores2024: Math.round((succ2024 / total) * 100),
    percSucessores2025: Math.round((succ2025 / total) * 100),
    lideresRisco: risco,
    percLideresRisco: Math.round((risco / total) * 100),
    mediaENPSLideres: enps25.length ? Math.round(enps25.reduce((a,b) => a+b, 0) / enps25.length) : 0,
    mediaENPSTimes: moods.length ? Math.round(moods.reduce((a,b) => a+b, 0) / moods.length) : 0,
    percParticipacaoPrograma: Math.round((participantes / total) * 100),
    prontidao: {
      'Ready Now': readyNow,
      'Ready Soon': readySoon,
      'Ready Later': readyLater,
      'Não Mapeado': naoMapeado
    }
  };
};

// ENPS Evolution
export const getENPSEvolution = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
  return months.map((month, i) => {
    const moodsValues = allLeaders.map(l => l.moodsENPS[i]).filter((v): v is number => v !== null);
    const enpsLideres = allLeaders.map(l => l.gptwENPS2025).filter((v): v is number => v !== null);
    return { 
      month, 
      lideres: enpsLideres.length ? Math.round(enpsLideres.reduce((a,b) => a+b, 0) / enpsLideres.length) : 75,
      times: moodsValues.length ? Math.round(moodsValues.reduce((a,b) => a+b, 0) / moodsValues.length) : 70
    };
  });
};

// Leadership Review distribution
export const getLeadershipReviewDistribution = (data?: Leader[]) => {
  const source = data || allLeaders;
  const dist = source.filter(l => l.ultimoQuadranteReview).reduce((acc, l) => {
    const key = l.ultimoQuadranteReview.length > 25 ? l.ultimoQuadranteReview.substring(0, 25) + '...' : l.ultimoQuadranteReview;
    acc[key] = (acc[key] || 0) + 1; 
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(dist).map(([quadrant, count]) => ({ quadrant, count }));
};

// Data by diretoria
export const getDataByDiretoria = (data?: Leader[]) => {
  const source = data || allLeaders;
  const byDir = source.reduce((acc, l) => {
    if (!acc[l.diretoria]) acc[l.diretoria] = { totalLideres: 0, enpsSum: 0, enpsCount: 0 };
    acc[l.diretoria].totalLideres++;
    if (l.gptwENPS2025 !== null) {
      acc[l.diretoria].enpsSum += l.gptwENPS2025;
      acc[l.diretoria].enpsCount++;
    }
    return acc;
  }, {} as Record<string, { totalLideres: number; enpsSum: number; enpsCount: number }>);
  
  return Object.entries(byDir).map(([diretoria, data]) => ({
    diretoria: diretoria.replace('Diretoria de ', '').replace('Diretoria ', ''),
    totalLideres: data.totalLideres,
    mediaENPS: data.enpsCount ? Math.round(data.enpsSum / data.enpsCount) : 0
  }));
};

export const getENPSByMonth = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
  return months.map((m, i) => {
    const vals = allLeaders.map(l => l.moodsENPS[i]).filter((v): v is number => v !== null);
    return { month: m, enps: vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : null };
  }).filter(m => m.enps !== null);
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

export const getTopPerformers = () => allLeaders.filter(l => l.atingimentoCR2025 !== null)
  .map(l => ({ 
    id: l.id,
    nome: l.nome, 
    cargo: l.cargo, 
    diretoria: l.diretoria, 
    cr2025: l.atingimentoCR2025 || 0, 
    enps2025: l.gptwENPS2025 || 0, 
    ultimoQuadranteReview: l.ultimoQuadranteReview,
    score: ((l.atingimentoCR2025||0) + (l.gptwENPS2025||0)) / 2 
  }))
  .sort((a, b) => (b.score||0) - (a.score||0)).slice(0, 10);

export const getHighRiskLeaders = () => allLeaders
  .filter(l => (l.gptwENPS2025 !== null && l.gptwENPS2025 < 50) || (l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80) || (l.percentDesligamentos2025 || 0) > 15)
  .map(l => ({ 
    id: l.id,
    nome: l.nome, 
    cargo: l.cargo, 
    diretoria: l.diretoria, 
    gptwENPS2025: l.gptwENPS2025 || 0, 
    atingimentoCR2025: l.atingimentoCR2025 || 0, 
    percentDesligamentos2025: l.percentDesligamentos2025 || 0,
    indicados: l.indicados,
    riskFactors: [
      l.gptwENPS2025 !== null && l.gptwENPS2025 < 50 ? 'ENPS Baixo' : null, 
      l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80 ? 'CR Baixo' : null, 
      (l.percentDesligamentos2025 || 0) > 15 ? 'Alta Rotatividade' : null
    ].filter(Boolean) 
  }))
  .slice(0, 15);

export const getJobRotationData = () => allLeaders.filter(l => l.jobRotation !== null).map(l => ({ 
  lider: l.nome, 
  cargo: l.cargo, 
  diretoria: l.diretoria, 
  nivelCarreira: l.nivelCarreira, 
  tempoCargoAtual: l.tempoCargoAtual, 
  jobRotation: l.jobRotation 
}));
