import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Leader } from '@/data/leaders';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout, GlobalFilterControls } from '@/components/DashboardLayout';
import { Users, TrendingUp, TrendingDown, Minus, UserPlus, ArrowUpDown, ArrowUp, ArrowDown, Search, Star, ShieldCheck, AlertTriangle, AlertCircle, XCircle, UserX, ToggleLeft, ToggleRight, FilterX } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectNative } from '@/components/ui/select-native';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const ALL = '__all__';

// 9-box mapping (internal codes to Q number)
const NINE_BOX_MAP: Record<string, number> = {
  'C1': 1, 'C2': 2, 'C3': 3,
  'B1': 4, 'B2': 5, 'B3': 6,
  'A1': 7, 'A2': 8, 'A3': 9,
};

// Direct Q1-Q9 to internal code mapping
const Q_TO_CODE: Record<string, string> = {
  'Q1': 'C1', 'Q2': 'C2', 'Q3': 'C3',
  'Q4': 'B1', 'Q5': 'B2', 'Q6': 'B3',
  'Q7': 'A1', 'Q8': 'A2', 'Q9': 'A3',
  '1': 'C1', '2': 'C2', '3': 'C3',
  '4': 'B1', '5': 'B2', '6': 'B3',
  '7': 'A1', '8': 'A2', '9': 'A3',
};

// Map descriptive text from the spreadsheet to quadrant codes
const TEXT_TO_CODE: Record<string, string> = {
  'desempenho insuficiente': 'C1',
  'desempenho esperado': 'C2',
  'desempenho esperado (baixo potencial)': 'C2',
  'desempenho acima do esperado': 'C3',
  'desempenho acima do esperado (baixo potencial)': 'C3',
  'desempenho abaixo do esperado': 'B1',
  'desempenho adequado': 'B2',
  'desempenho diferenciado': 'B3',
  'alto potencial e desempenho abaixo do esperado': 'A1',
  'alto potencial / baixo desempenho': 'A1',
  'alto potencial e desempenho esperado': 'A2',
  'alto potencial / desempenho esperado': 'A2',
  'alto potencial e desempenho acima do esperado': 'A3',
  'alto potencial / alto desempenho': 'A3',
};

function normalizeQuadrantText(q: string | null): string {
  if (!q) return '';
  const stripped = q.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').trim();
  const clean = stripped.toUpperCase();
  if (NINE_BOX_MAP[clean]) return clean;
  const qCode = Q_TO_CODE[clean];
  if (qCode) return qCode;
  const lower = stripped.toLowerCase().replace(/\s+/g, ' ');
  const code = TEXT_TO_CODE[lower];
  if (code) return code;
  for (const [text, c] of Object.entries(TEXT_TO_CODE)) {
    if (lower.includes(text) || text.includes(lower)) return c;
  }
  return '';
}

function parseQuadrantNumber(q: string | null): number | null {
  if (!q) return null;
  const code = normalizeQuadrantText(q);
  return NINE_BOX_MAP[code] ?? null;
}

function getQuadrantCode(q: string | null): string {
  return normalizeQuadrantText(q);
}

function codeToQLabel(code: string): string {
  const qNum = NINE_BOX_MAP[code];
  return qNum ? `Q${qNum}` : '';
}

const CODE_TO_NAME: Record<string, string> = {
  'C1': 'Desempenho insuficiente',
  'C2': 'Desempenho esperado',
  'C3': 'Desempenho acima do esperado',
  'B1': 'Desempenho abaixo do esperado',
  'B2': 'Desempenho adequado',
  'B3': 'Desempenho diferenciado',
  'A1': 'Alto potencial e desempenho abaixo do esperado',
  'A2': 'Alto potencial e desempenho esperado',
  'A3': 'Alto potencial e desempenho acima do esperado',
};

const GRID_MAP: Record<string, { row: number; col: number }> = {
  'A1': { row: 0, col: 0 }, 'A2': { row: 0, col: 1 }, 'A3': { row: 0, col: 2 },
  'B1': { row: 1, col: 0 }, 'B2': { row: 1, col: 1 }, 'B3': { row: 1, col: 2 },
  'C1': { row: 2, col: 0 }, 'C2': { row: 2, col: 1 }, 'C3': { row: 2, col: 2 },
};

const QUADRANT_NAMES: string[][] = [
  ['Alto potencial e desempenho abaixo do esperado', 'Alto potencial e desempenho esperado', 'Alto potencial e desempenho acima do esperado'],
  ['Desempenho Abaixo do Esperado', 'Desempenho Adequado', 'Desempenho Diferenciado'],
  ['Desempenho Insuficiente', 'Desempenho Esperado', 'Desempenho Acima do Esperado'],
];

const QUADRANT_NUMBERS: number[][] = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
];

const QUADRANT_COLORS: string[][] = [
  ['hsl(45, 100%, 53%)', 'hsl(210, 70%, 50%)', 'hsl(210, 70%, 50%)'],
  ['hsl(45, 100%, 53%)', 'hsl(142, 60%, 45%)', 'hsl(210, 70%, 50%)'],
  ['hsl(342, 100%, 50%)', 'hsl(142, 60%, 45%)', 'hsl(142, 60%, 45%)'],
];

const QUADRANT_BG: string[][] = [
  ['hsl(45 100% 53% / 0.12)', 'hsl(210 70% 50% / 0.15)', 'hsl(210 70% 50% / 0.15)'],
  ['hsl(45 100% 53% / 0.12)', '#e6f6ec', 'hsl(210 70% 50% / 0.15)'],
  ['hsl(342 100% 50% / 0.12)', '#e6f6ec', '#e6f6ec'],
];

type ColorCategory = 'risco' | 'atencao' | 'manutencao' | 'destaque';

const COLOR_HIERARCHY: Record<ColorCategory, number> = {
  'risco': 0,
  'atencao': 1,
  'manutencao': 2,
  'destaque': 3,
};

function getColorCategory(code: string): ColorCategory | null {
  switch (code) {
    case 'C1': return 'risco';
    case 'B1': case 'A1': return 'atencao';
    case 'C2': case 'C3': case 'B2': return 'manutencao';
    case 'B3': case 'A2': case 'A3': return 'destaque';
    default: return null;
  }
}

type Evolution = 'evoluiu' | 'regrediu' | 'estavel' | 'novo';

function getEvolution(q2025: string | null, q2026: string | null): Evolution {
  const code2025 = normalizeQuadrantText(q2025);
  const code2026 = normalizeQuadrantText(q2026);
  if (!code2025) return 'novo';
  if (!code2026) return 'estavel';
  const cat2025 = getColorCategory(code2025);
  const cat2026 = getColorCategory(code2026);
  if (!cat2025 || !cat2026) return 'estavel';
  const h2025 = COLOR_HIERARCHY[cat2025];
  const h2026 = COLOR_HIERARCHY[cat2026];
  if (h2026 > h2025) return 'evoluiu';
  if (h2026 < h2025) return 'regrediu';
  return 'estavel';
}

function getEvolutionLabel(e: Evolution): string {
  switch (e) {
    case 'evoluiu': return 'Evoluiu';
    case 'regrediu': return 'Regrediu';
    case 'estavel': return 'Estável';
    case 'novo': return 'Novo';
  }
}

function getEvolutionColor(e: Evolution): string {
  switch (e) {
    case 'evoluiu': return 'text-[hsl(142,60%,45%)]';
    case 'regrediu': return 'text-[hsl(342,100%,50%)]';
    case 'estavel': return 'text-[hsl(45,100%,53%)]';
    case 'novo': return 'text-[hsl(210,70%,50%)]';
  }
}

// Quadrant descriptions
const QUADRANT_DESCRIPTIONS: Record<string, string> = {
  'C1': 'Necessita urgentemente de ações para o desenvolvimento de competências e melhoria do desempenho para atender a função atual. Caso não apresente evolução após ação, o desligamento deve ser considerado.',
  'C2': 'Atende as expectativas de desempenho do cargo atual. Possui competências para cargos com o mesmo nível de responsabilidade atual.',
  'C3': 'Supera as expectativas de desempenho e apresenta potencial esperado para o cargo atual, mas não apresenta, no momento, potencial para assumir posições acima do seu cargo atual. É visto como modelo em suas entregas.',
  'B1': 'Performance inconsistente em relação ao potencial demonstrado. Pode se manter na função atual ou ter crescimento precisa desenvolver suas competências e melhorar seu desempenho. Pode ser alguém que assumiu a posição recentemente e que não está se adaptando.',
  'B2': 'Atende as expectativas de desempenho exigidas para o cargo e é competente na função atual. Para evoluir em funções mais complexas dentro do seu nível atual, deve receber novos desafios.',
  'B3': 'Altamente competente e com desempenho acima do esperado para o cargo atual. Pode evoluir para funções mais complexas, dentro do nível do seu cargo. É modelo na função atual.',
  'A1': 'Pode assumir funções de maior responsabilidade quando apresentar entregas esperadas para o cargo atual. Terá sucesso nos resultados, quando estiver maduro na função.',
  'A2': 'Atende as expectativas de desempenho e apresenta potencial para assumir posições com escopo mais amplo em comparação com a posição atual. Identificado como profissional que contribui significativamente.',
  'A3': 'Supera sempre as expectativas de desempenho e apresenta potencial para assumir posições com escopo mais amplo em responsabilidades e complexidade. É modelo na função atual.',
};

const QUADRANT_PDI: Record<string, string[]> = {
  'C1': ['Determine primeiro qual é o problema de desempenho. Se for o caso, passe o indivíduo para uma atribuição mais apropriada. Se não for possível resolver o problema nem mudar a atribuição, pense leve consideração a possibilidade de realizar o desligamento.'],
  'C2': ['Deve estar focado em encontrar mentores que tenham o potencial desenvolvido para apoiar o crescimento do colaborador. O objetivo é mostrar a importância do desenvolvimento do potencial, visando agregar mais valor na posição atual e também perspectiva de carreira. Ações de aprendizado na função também são bem-vindas.'],
  'C3': ['Deve ser voltado em atividades que desenvolvam as competências comportamentais do colaborador. Ações de trabalhos conjuntos com colaboradores plotados nos boxes 6 e 9 e práticas de aprendizagem formal, que desenvolvam comportamentos, também são indicados para esse quadrante.'],
  'B1': ['Deve ser focado em atividades que permitam um desenvolvimento acelerado, através de experiências práticas (On The Job) e a designação de mentores de alto desempenho, por exemplo. O desenvolvimento também pode ocorrer através da aprendizagem formal e possibilidade de assumir algumas atividades ou posição temporária durante as férias de algum líder, por exemplo.'],
  'B2': ['Deve estar focado em processos de mentoria e acompanhamento periódico do gestor imediato, sempre com o alinhamento junto ao gestor matricial (nos casos em que este papel exista dentro da estrutura). O objetivo é estimular o desenvolvimento de novas competências técnicas e comportamentais, visando expandir o escopo de trabalho atual. Ações de desenvolvimento na função atual também são recomendadas.'],
  'B3': ['Deve ser voltado no desenvolvimento de competências comportamentais, visando preparar o colaborador para assumir uma posição de maior complexidade. Práticas de coaching e/ou ações de mentorias são excelentes maneiras de trabalhar esse desenvolvimento. É importante fazer esse acompanhamento com feedback contínuo e avaliar o progresso. O importante nesse quadrante é desenvolver ainda mais o potencial, visando deixar o colaborador pronto para promoção.'],
  'A1': ['Deve ser focado no aumento do desempenho. Ações de aprendizagem na própria função, programas de mentoria e/ou coaching do líder imediato são ótimas opções para apoiar esse processo. O acompanhamento próximo e feedback\'s frequentes são fundamentais no desenvolvimento do colaborador.'],
  'A2': ['Deve ser voltado para desenvolver o colaborador para ocupar uma posição de maior complexidade. Práticas de mentoria e/ou coaching são excelentes recursos para serem utilizados. Práticas de aprendizado na função almejada também é uma ótima forma de treinar e desenvolver esse colaborador. É importante que as iniciativas do PDI sejam aceleradas, pois estamos falando de um quadrante de alto potencial.'],
  'A3': ['Deve ser voltado em ações de coaching e/ou mentoria e feedback contínuo das atividades realizadas na função de maior complexidade. Construa um processo de desenvolvimento desafiador, voltado para promoção rápida do colaborador. Veja quais são as competências técnicas e comportamentais que possam ser ainda mais maximizadas, visando criar a prontidão ao cargo almejado.'],
};

/* Searchable filter (reusable) */
function SearchableFilter({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return options.filter(name => {
      const lower = name.toLowerCase();
      return terms.every(t => lower.includes(t));
    });
  }, [options, query]);

  const displayValue = value === ALL ? '' : value;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={open ? query : displayValue}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(''); }}
          placeholder={placeholder}
          className="h-9 text-xs pl-8 w-[200px] bg-card border-border rounded-lg focus:ring-1 focus:ring-primary hover:border-primary/50 transition-colors"
        />
      </div>
      {open && (
        <div className="absolute z-[100] top-full left-0 mt-1 bg-popover border rounded-md shadow-lg max-h-[70vh] overflow-y-auto min-w-[280px] w-max">
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => { onChange(ALL); setQuery(''); setOpen(false); }}
          >
            {placeholder}
          </button>
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Nenhum resultado</p>
          )}
          {filtered.slice(0, 50).map(name => (
            <button
              key={name}
              type="button"
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors ${name === value ? 'bg-accent/50 font-semibold' : ''}`}
              onClick={() => { onChange(name); setQuery(''); setOpen(false); }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type PopupSortField = 'nome' | 'diretoria' | 'nivelCarreira' | 'liderDoLider' | 'q2025' | 'q2026' | 'evolucao';
type SortDir = 'asc' | 'desc';
type YearView = '2026' | '2025' | 'comparativo';

function computeColorCounts(leaders: Leader[], quadrantField: 'ultimoQuadrante' | 'penultimoQuadrante') {
  let destaque = 0, manutencao = 0, atencao = 0, risco = 0;
  let total = 0;
  leaders.forEach(l => {
    const code = normalizeQuadrantText(l[quadrantField] ?? null);
    if (!code) return;
    total++;
    const cat = getColorCategory(code);
    if (cat === 'destaque') destaque++;
    else if (cat === 'manutencao') manutencao++;
    else if (cat === 'atencao') atencao++;
    else if (cat === 'risco') risco++;
  });
  const pct = (n: number) => total > 0 ? ((n / total) * 100).toFixed(1) : '0';
  return { total, destaque, manutencao, atencao, risco, pctDestaque: pct(destaque), pctManutencao: pct(manutencao), pctAtencao: pct(atencao), pctRisco: pct(risco) };
}

function LeadershipReviewContent({ filtered: leaders, globalFilterControls: gfc }: { filtered: Leader[]; globalFilterControls: GlobalFilterControls }) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<{ row: number; col: number } | null>(null);
  const [popupSort, setPopupSort] = useState<{ field: PopupSortField; dir: SortDir }>({ field: 'nome', dir: 'asc' });
  const [popupDiretoria, setPopupDiretoria] = useState(ALL);
  const [leaderFilter, setLeaderFilter] = useState(ALL);
  const [cargoFilter, setCargoFilter] = useState(ALL);
  const [nomeFilter, setNomeFilter] = useState(ALL);
  const [calibradoFilter, setCalibradoFilter] = useState(ALL);
  const [showNotEvaluated, setShowNotEvaluated] = useState(false);
  const [notEvalSort, setNotEvalSort] = useState<{ field: PopupSortField; dir: SortDir }>({ field: 'nome', dir: 'asc' });
  const [showComparison, setShowComparison] = useState(false);
  const [yearView, setYearView] = useState<YearView>('2026');

  // Apply local filters
  const displayedLeaders = useMemo(() => {
    let result = leaders;

    // Leader filter (show team only — exclude the leader themselves)
    if (leaderFilter !== ALL) {
      result = leaders.filter(l =>
        l.liderDoLider?.toLowerCase() === leaderFilter.toLowerCase() &&
        l.nome !== leaderFilter
      );
    }

    // Cargo filter
    if (cargoFilter !== ALL) {
      result = result.filter(l => l.cargo === cargoFilter);
    }

    // Nome filter
    if (nomeFilter !== ALL) {
      result = result.filter(l => l.nome === nomeFilter);
    }

    // Calibrado CE filter (year-aware)
    if (calibradoFilter !== ALL) {
      result = result.filter(l => {
        // Pick the right column based on yearView
        const calibradoField = yearView === '2025' ? 'calibradoCE2025' : 'calibradoCE';
        const val = (l as any)[calibradoField];
        const isSim = val && val.toString().trim().toLowerCase() === 'sim';
        if (calibradoFilter === 'Sim') return isSim;
        return !isSim; // "Não" includes empty/null/anything not "Sim"
      });
    }

    return result;
  }, [leaders, leaderFilter, cargoFilter, nomeFilter, calibradoFilter, yearView]);

  // Filter options
  const leaderNameOptions = useMemo(() =>
    [...new Set(leaders.map(l => l.nome))].sort((a, b) => a.localeCompare(b)),
    [leaders]
  );

  const cargoOptions = useMemo(() =>
    [...new Set(leaders.map(l => l.cargo).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
    [leaders]
  );

  const nomeOptions = useMemo(() =>
    [...new Set(leaders.map(l => l.nome))].sort((a, b) => a.localeCompare(b)),
    [leaders]
  );

  // Debug
  useEffect(() => {
    const withQ2026 = displayedLeaders.filter(l => normalizeQuadrantText(l.ultimoQuadrante) !== '');
    const withQ2025 = displayedLeaders.filter(l => normalizeQuadrantText(l.penultimoQuadrante) !== '');
    console.log(`[Leadership Review] Total: ${displayedLeaders.length}, Q2026 válido: ${withQ2026.length}, Q2025 válido: ${withQ2025.length}`);
  }, [displayedLeaders]);

  // Evolution data
  const leaderEvolutions = useMemo(() => {
    return displayedLeaders.map(l => ({
      leader: l,
      q2025: getQuadrantCode(l.penultimoQuadrante),
      q2026: getQuadrantCode(l.ultimoQuadrante),
      evolution: getEvolution(l.penultimoQuadrante, l.ultimoQuadrante),
    }));
  }, [displayedLeaders]);

  // 9-box grid data (2026)
  const gridData2026 = useMemo(() => {
    const grid: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    displayedLeaders.forEach(l => {
      const code = getQuadrantCode(l.ultimoQuadrante);
      const pos = GRID_MAP[code];
      if (pos) grid[pos.row][pos.col]++;
    });
    return grid;
  }, [displayedLeaders]);

  // 9-box grid data (2025)
  const gridData2025 = useMemo(() => {
    const grid: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    displayedLeaders.forEach(l => {
      const code = getQuadrantCode(l.penultimoQuadrante);
      const pos = GRID_MAP[code];
      if (pos) grid[pos.row][pos.col]++;
    });
    return grid;
  }, [displayedLeaders]);

  const totalEvaluated2026 = displayedLeaders.filter(l => parseQuadrantNumber(l.ultimoQuadrante) !== null).length;
  const totalEvaluated2025 = displayedLeaders.filter(l => parseQuadrantNumber(l.penultimoQuadrante) !== null).length;

  // Active year helpers
  const activeQuadrantField = yearView === '2025' ? 'penultimoQuadrante' : 'ultimoQuadrante';
  const activeGridData = yearView === '2025' ? gridData2025 : gridData2026;
  const activeTotalEvaluated = yearView === '2025' ? totalEvaluated2025 : totalEvaluated2026;

  const notEvaluatedLeaders = useMemo(() =>
    displayedLeaders.filter(l => parseQuadrantNumber(l[activeQuadrantField] as string | null) === null),
    [displayedLeaders, activeQuadrantField]
  );

  // Color summary for both years
  const colorSummary2026 = useMemo(() => computeColorCounts(displayedLeaders, 'ultimoQuadrante'), [displayedLeaders]);
  const colorSummary2025 = useMemo(() => computeColorCounts(displayedLeaders, 'penultimoQuadrante'), [displayedLeaders]);
  const activeColorSummary = yearView === '2025' ? colorSummary2025 : colorSummary2026;

  // Popup leaders for selected quadrant
  const popupLeaders = useMemo(() => {
    if (!selectedQuadrant) return [];
    const codes = Object.entries(GRID_MAP).filter(([, v]) => v.row === selectedQuadrant.row && v.col === selectedQuadrant.col).map(([k]) => k);
    const activeField = yearView === '2025' ? 'q2025' : 'q2026';
    let result = leaderEvolutions.filter(e => codes.includes(e[activeField]));
    if (popupDiretoria !== ALL) result = result.filter(e => e.leader.diretoria === popupDiretoria);

    result.sort((a, b) => {
      const dir = popupSort.dir === 'asc' ? 1 : -1;
      switch (popupSort.field) {
        case 'nome': return dir * a.leader.nome.localeCompare(b.leader.nome);
        case 'diretoria': return dir * (a.leader.diretoria || '').localeCompare(b.leader.diretoria || '');
        case 'nivelCarreira': return dir * (a.leader.nivelCarreira || '').localeCompare(b.leader.nivelCarreira || '');
        case 'liderDoLider': return dir * (a.leader.liderDoLider || '').localeCompare(b.leader.liderDoLider || '');
        case 'q2025': return dir * (a.q2025 || '').localeCompare(b.q2025 || '');
        case 'q2026': return dir * (a.q2026 || '').localeCompare(b.q2026 || '');
        case 'evolucao': return dir * getEvolutionLabel(a.evolution).localeCompare(getEvolutionLabel(b.evolution));
        default: return 0;
      }
    });
    return result;
  }, [selectedQuadrant, leaderEvolutions, popupDiretoria, popupSort, yearView]);

  const popupDiretorias = useMemo(() => {
    if (!selectedQuadrant) return [];
    const codes = Object.entries(GRID_MAP).filter(([, v]) => v.row === selectedQuadrant.row && v.col === selectedQuadrant.col).map(([k]) => k);
    const activeField = yearView === '2025' ? 'q2025' : 'q2026';
    const dirs = leaderEvolutions.filter(e => codes.includes(e[activeField])).map(e => e.leader.diretoria).filter(Boolean);
    return [...new Set(dirs)].sort() as string[];
  }, [selectedQuadrant, leaderEvolutions]);

  const popupQuadrantCode = useMemo(() => {
    if (!selectedQuadrant) return '';
    const entry = Object.entries(GRID_MAP).find(([, v]) => v.row === selectedQuadrant.row && v.col === selectedQuadrant.col);
    return entry ? entry[0] : '';
  }, [selectedQuadrant]);

  const handlePopupSort = (field: PopupSortField) => {
    setPopupSort(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleNotEvalSort = (field: PopupSortField) => {
    setNotEvalSort(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedNotEvaluated = useMemo(() => {
    const arr = [...notEvaluatedLeaders];
    arr.sort((a, b) => {
      const dir = notEvalSort.dir === 'asc' ? 1 : -1;
      switch (notEvalSort.field) {
        case 'nome': return dir * a.nome.localeCompare(b.nome);
        case 'diretoria': return dir * (a.diretoria || '').localeCompare(b.diretoria || '');
        case 'nivelCarreira': return dir * (a.nivelCarreira || '').localeCompare(b.nivelCarreira || '');
        case 'liderDoLider': return dir * (a.liderDoLider || '').localeCompare(b.liderDoLider || '');
        default: return 0;
      }
    });
    return arr;
  }, [notEvaluatedLeaders, notEvalSort]);

  const SortIcon = ({ field, current }: { field: PopupSortField; current: { field: PopupSortField; dir: SortDir } }) => {
    if (current.field !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-40" />;
    return current.dir === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 inline text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 inline text-primary" />;
  };

  const ROW_LABELS = ['Alto', 'Médio', 'Baixo'];
  const COL_LABELS = ['Abaixo do Esperado', 'Esperado', 'Acima do Esperado'];

  return (
    <div className="space-y-6">
      {/* Unified filters block */}
      <div className="flex items-center gap-3 flex-wrap pb-1">
        {(gfc.hasActiveGlobalFilter || leaderFilter !== ALL || nomeFilter !== ALL || cargoFilter !== ALL || calibradoFilter !== ALL) && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
            onClick={() => {
              gfc.clearGlobalFilters();
              setLeaderFilter(ALL);
              setNomeFilter(ALL);
              setCargoFilter(ALL);
              setCalibradoFilter(ALL);
            }}
          >
            <FilterX className="w-3.5 h-3.5" />
            Limpar filtros
          </Button>
        )}
        <SelectNative
          value={gfc.diretoria}
          onChange={e => gfc.setDiretoria(e.target.value)}
          options={gfc.diretorias.map(d => ({ value: d, label: d }))}
          placeholder="Diretorias"
        />
        <SelectNative
          value={gfc.nivel}
          onChange={e => gfc.setNivel(e.target.value)}
          options={gfc.niveis.map(n => ({ value: n, label: n }))}
          placeholder="Níveis de Carreira"
        />
        <SelectNative
          value={gfc.ligacaoCE}
          onChange={e => gfc.setLigacaoCE(e.target.value)}
          options={['CE', 'Direto', 'Indireto'].map(v => ({ value: v, label: v }))}
          placeholder="Direto ou Indireto do CE"
        />
        <SearchableFilter
          value={leaderFilter}
          onChange={setLeaderFilter}
          options={leaderNameOptions}
          placeholder="Filtrar por líder (time)"
        />
        <SearchableFilter
          value={nomeFilter}
          onChange={setNomeFilter}
          options={nomeOptions}
          placeholder="Nome do avaliado"
        />
        <SearchableFilter
          value={cargoFilter}
          onChange={setCargoFilter}
          options={cargoOptions}
          placeholder="Cargo do avaliado"
        />
        <SelectNative
          value={calibradoFilter}
          onChange={e => setCalibradoFilter(e.target.value)}
          options={[
            { value: 'Sim', label: 'Sim' },
            { value: 'Não', label: 'Não' },
          ]}
          placeholder="Calibrado pelo CE"
        />
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="p-4">
            <div className="text-primary mb-1"><Users className="w-5 h-5" /></div>
            <p className="text-[12px] text-muted-foreground">Líderes Avaliados</p>
            <p className="text-[28px] font-bold text-foreground font-display tabular-nums leading-none mt-1">{activeColorSummary.total}</p>
            {yearView === 'comparativo' && (
              <p className="text-[11px] text-muted-foreground mt-1">2025: {colorSummary2025.total}</p>
            )}
          </CardContent>
        </Card>

        <ComparisonCard
          icon={<Star className="w-5 h-5" />}
          label="Destaque"
          subtitle="Q6, Q8, Q9"
          color="text-[hsl(210,70%,50%)]"
          val2026={activeColorSummary.destaque}
          pct2026={activeColorSummary.pctDestaque}
          val2025={colorSummary2025.destaque}
          pct2025={colorSummary2025.pctDestaque}
          showComparison={yearView === 'comparativo'}
        />
        <ComparisonCard
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Manutenção"
          subtitle="Q2, Q3, Q5"
          color="text-[hsl(142,60%,45%)]"
          val2026={activeColorSummary.manutencao}
          pct2026={activeColorSummary.pctManutencao}
          val2025={colorSummary2025.manutencao}
          pct2025={colorSummary2025.pctManutencao}
          showComparison={yearView === 'comparativo'}
        />
        <ComparisonCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Atenção"
          subtitle="Q4, Q7"
          color="text-[hsl(45,100%,53%)]"
          val2026={activeColorSummary.atencao}
          pct2026={activeColorSummary.pctAtencao}
          val2025={colorSummary2025.atencao}
          pct2025={colorSummary2025.pctAtencao}
          showComparison={yearView === 'comparativo'}
        />
        <ComparisonCard
          icon={<XCircle className="w-5 h-5" />}
          label="Risco"
          subtitle="Q1"
          color="text-[hsl(342,100%,50%)]"
          val2026={activeColorSummary.risco}
          pct2026={activeColorSummary.pctRisco}
          val2025={colorSummary2025.risco}
          pct2025={colorSummary2025.pctRisco}
          showComparison={yearView === 'comparativo'}
        />
        <button onClick={() => setShowNotEvaluated(true)} className="text-left">
          <Card className="border border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
            <CardContent className="p-4">
              <div className="text-muted-foreground mb-1"><UserX className="w-5 h-5" /></div>
              <p className="text-[12px] text-muted-foreground">Não Avaliados</p>
              <p className="text-[28px] font-bold text-foreground font-display tabular-nums leading-none mt-1">
                {notEvaluatedLeaders.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {displayedLeaders.length > 0 ? ((notEvaluatedLeaders.length / displayedLeaders.length) * 100).toFixed(1) : '0'}%
              </p>
              {yearView === 'comparativo' && (() => {
                const notEval2025 = displayedLeaders.filter(l => parseQuadrantNumber(l.penultimoQuadrante) === null).length;
                const pct2025 = displayedLeaders.length > 0 ? ((notEval2025 / displayedLeaders.length) * 100).toFixed(1) : '0';
                return (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    2025: {notEval2025} ({pct2025}%)
                  </p>
                );
              })()}
            </CardContent>
          </Card>
        </button>
      </div>

      {/* 9-Box Matrix */}
      <Card className="border border-border shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-bold text-foreground">Matriz 9-Box — Leadership Review {yearView !== 'comparativo' ? `(${yearView})` : ''}</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Visualização por Ano:</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {([['2026', '2026'], ['2025', '2025'], ['comparativo', 'Comparativo']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setYearView(val as YearView)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${yearView === val ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col items-center pr-2 py-1" style={{ width: 90 }}>
              <span className="text-[10px] font-semibold text-muted-foreground mb-1">Potencial (Y)</span>
              <div className="flex flex-col justify-between flex-1 w-full">
                {ROW_LABELS.map((label, i) => (
                  <div key={i} className="flex-1 flex items-center justify-end">
                    <span className="text-[10px] text-muted-foreground text-right leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 1, 2].map(row =>
                  [0, 1, 2].map(col => {
                    const countActive = activeGridData[row][col];
                    const pctActive = activeTotalEvaluated > 0 ? ((countActive / activeTotalEvaluated) * 100).toFixed(1) : '0';
                    const count2026 = gridData2026[row][col];
                    const count2025 = gridData2025[row][col];
                    const pct2026 = totalEvaluated2026 > 0 ? ((count2026 / totalEvaluated2026) * 100).toFixed(1) : '0';
                    const pct2025 = totalEvaluated2025 > 0 ? ((count2025 / totalEvaluated2025) * 100).toFixed(1) : '0';
                    const qNum = QUADRANT_NUMBERS[row][col];
                    return (
                      <button
                        key={`${row}-${col}`}
                        onClick={() => { setSelectedQuadrant({ row, col }); setPopupDiretoria(ALL); }}
                        className="rounded-lg p-3 text-center transition-all hover:scale-[1.03] hover:shadow-md cursor-pointer border border-border/50 relative"
                        style={{ backgroundColor: QUADRANT_BG[row][col] }}
                      >
                        <p className="text-[9px] font-medium leading-tight mb-1 text-black">
                          {QUADRANT_NAMES[row][col]}
                        </p>
                        {yearView === 'comparativo' ? (
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-medium text-black">
                              2025: <span className="font-bold text-sm">{count2025}</span> ({pct2025}%)
                            </p>
                            <p className="text-[10px] font-bold text-black">
                              2026: <span className="font-bold text-sm">{count2026}</span> ({pct2026}%)
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xl font-bold text-black">{countActive}</p>
                            <p className="text-[10px] font-medium text-black">{pctActive}%</p>
                          </>
                        )}
                        <span
                          className="absolute bottom-1 right-2 text-[9px] font-semibold opacity-50 text-black"
                        >
                          Q{qNum}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
              {/* X-axis labels */}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {COL_LABELS.map((label, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-1">
                <span className="text-[10px] font-semibold text-muted-foreground">Contribuição na Posição Atual (X)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quadrant Popup */}
      <Dialog open={!!selectedQuadrant} onOpenChange={open => { if (!open) setSelectedQuadrant(null); }}>
        <DialogContent className="max-w-[90vw] w-[1100px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              {selectedQuadrant && (
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: QUADRANT_COLORS[selectedQuadrant.row][selectedQuadrant.col], color: QUADRANT_COLORS[selectedQuadrant.row][selectedQuadrant.col] }}>
                  Q{selectedQuadrant ? QUADRANT_NUMBERS[selectedQuadrant.row][selectedQuadrant.col] : ''}
                </Badge>
              )}
              {selectedQuadrant ? QUADRANT_NAMES[selectedQuadrant.row][selectedQuadrant.col] : ''} — {popupLeaders.length} líderes
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              {popupQuadrantCode && QUADRANT_DESCRIPTIONS[popupQuadrantCode] && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="text-xs font-bold text-foreground mb-1">Descrição do Quadrante</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {QUADRANT_DESCRIPTIONS[popupQuadrantCode]}
                  </p>
                </div>
              )}

              {popupQuadrantCode && QUADRANT_PDI[popupQuadrantCode] && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="text-xs font-bold text-foreground mb-2">Recomendações de Desenvolvimento (PDI)</h4>
                  <ul className="space-y-1">
                    {QUADRANT_PDI[popupQuadrantCode].map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-xs font-bold text-foreground">Líderes</h4>
                  <Select value={popupDiretoria} onValueChange={setPopupDiretoria}>
                    <SelectTrigger className="h-7 w-[180px] text-xs">
                      <SelectValue placeholder="Todas Diretorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todas Diretorias</SelectItem>
                      {popupDiretorias.map(d => (
                        <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table className="table-fixed w-full">
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '14%' }} />
                    </colgroup>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        {[
                          { field: 'nome' as PopupSortField, label: 'Nome' },
                          { field: 'diretoria' as PopupSortField, label: 'Diretoria' },
                          { field: 'nivelCarreira' as PopupSortField, label: 'Nível' },
                          { field: 'liderDoLider' as PopupSortField, label: 'Líder do Líder' },
                          { field: 'q2025' as PopupSortField, label: 'Q 2025' },
                          { field: 'q2026' as PopupSortField, label: 'Q 2026' },
                          { field: 'evolucao' as PopupSortField, label: 'Evolução' },
                        ].map(col => (
                          <TableHead
                            key={col.field}
                            className="text-xs text-center cursor-pointer hover:bg-accent/50 select-none whitespace-nowrap"
                            onClick={() => handlePopupSort(col.field)}
                          >
                            {col.label} <SortIcon field={col.field} current={popupSort} />
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                  </Table>
                  <div className="max-h-[320px] overflow-y-auto">
                    <TooltipProvider delayDuration={200}>
                      <Table className="table-fixed w-full">
                        <colgroup>
                          <col style={{ width: '22%' }} />
                          <col style={{ width: '16%' }} />
                          <col style={{ width: '12%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '14%' }} />
                        </colgroup>
                        <TableBody>
                          {popupLeaders.map((entry, idx) => {
                            const q2025Label = codeToQLabel(entry.q2025);
                            const q2026Label = codeToQLabel(entry.q2026);
                            const q2025Name = CODE_TO_NAME[entry.q2025] || '';
                            const q2026Name = CODE_TO_NAME[entry.q2026] || '';
                            const activeCode = yearView === '2025' ? entry.q2025 : entry.q2026;
                            const activeCat = getColorCategory(activeCode);
                            const showAlert = (activeCat === 'risco' || activeCat === 'atencao') && entry.evolution !== 'novo';
                            return (
                              <TableRow key={idx} className="text-xs">
                                <TableCell className="font-medium truncate" title={entry.leader.nome}>
                                  <span className="flex items-center gap-1">
                                    {showAlert && <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[hsl(45,100%,53%)]" />}
                                    {entry.leader.nome}
                                  </span>
                                </TableCell>
                                <TableCell className="truncate" title={entry.leader.diretoria || ''}>{entry.leader.diretoria || '—'}</TableCell>
                                <TableCell className="text-center">{entry.leader.nivelCarreira || '—'}</TableCell>
                                <TableCell className="truncate" title={entry.leader.liderDoLider || ''}>{entry.leader.liderDoLider || '—'}</TableCell>
                                <TableCell className="text-center">
                                  {q2025Label ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-default font-medium">{q2025Label}</span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs max-w-[220px]">
                                        {q2025Name}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : '—'}
                                </TableCell>
                                <TableCell className="text-center">
                                  {q2026Label ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-default font-medium">{q2026Label}</span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs max-w-[220px]">
                                        {q2026Name}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : '—'}
                                </TableCell>
                                <TableCell className={`text-center font-semibold ${getEvolutionColor(entry.evolution)}`}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-default">{getEvolutionLabel(entry.evolution)}</span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs max-w-[280px]">
                                      {entry.evolution === 'evoluiu' && 'Líder apresentou avanço na matriz, movimentando-se entre as classificações (cores)'}
                                      {entry.evolution === 'regrediu' && 'Líder apresentou recuo na matriz, movimentando-se entre as classificações (cores)'}
                                      {entry.evolution === 'estavel' && 'Líder permaneceu no mesmo nível de classificação, sem mudança de cor de quadrante.'}
                                      {entry.evolution === 'novo' && 'Líder não avaliado no ciclo anterior.'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {popupLeaders.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                Nenhum líder neste quadrante
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Not Evaluated Popup */}
      <Dialog open={showNotEvaluated} onOpenChange={setShowNotEvaluated}>
        <DialogContent className="max-w-[90vw] w-[1100px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              Líderes Não Avaliados — {notEvaluatedLeaders.length}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/30 p-4 mb-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Membros do CE, líderes que pediram desligamento, líderes que assumiram cadeira de liderança na Senior após data corte do ciclo.<br />
              <span className="font-medium text-foreground">Data corte do Leadership Review 2025:</span> Jan de 2025<br />
              <span className="font-medium text-foreground">Data corte do Leadership Review 2026:</span> Set de 2025
            </p>
          </div>
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { field: 'nome' as PopupSortField, label: 'Nome' },
                    { field: 'diretoria' as PopupSortField, label: 'Diretoria' },
                    { field: 'nivelCarreira' as PopupSortField, label: 'Nível' },
                    { field: 'liderDoLider' as PopupSortField, label: 'Líder do Líder' },
                  ].map(col => (
                    <TableHead
                      key={col.field}
                      className="text-xs text-center cursor-pointer hover:bg-accent/50 select-none"
                      onClick={() => handleNotEvalSort(col.field)}
                    >
                      {col.label} <SortIcon field={col.field} current={notEvalSort} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNotEvaluated.map((l, idx) => (
                  <TableRow key={idx} className="text-xs">
                    <TableCell className="font-medium">{l.nome}</TableCell>
                    <TableCell>{l.diretoria || '—'}</TableCell>
                    <TableCell>{l.nivelCarreira || '—'}</TableCell>
                    <TableCell>{l.liderDoLider || '—'}</TableCell>
                  </TableRow>
                ))}
                {sortedNotEvaluated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Todos os líderes foram avaliados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComparisonCard({ icon, label, subtitle, color, val2026, pct2026, val2025, pct2025, showComparison = false }: {
  icon: React.ReactNode; label: string; subtitle: string; color: string;
  val2026: number; pct2026: string; val2025: number; pct2025: string;
  showComparison?: boolean;
}) {
  const diff = val2026 - val2025;
  return (
    <Card className="border border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-4">
        <div className={`${color} mb-1`}>{icon}</div>
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <p className="text-[28px] font-bold text-foreground font-display tabular-nums leading-none mt-1">
          {val2026}
          <span className="text-xs font-normal text-muted-foreground ml-1">({pct2026}%)</span>
        </p>
        {showComparison && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[11px] text-muted-foreground">2025: {val2025} ({pct2025}%)</span>
            {diff !== 0 && (
              <span className={`text-[11px] font-semibold ${diff > 0 ? 'text-[hsl(var(--variation-positive))]' : 'text-[hsl(var(--variation-negative))]'}`}>
                {diff > 0 ? '+' : ''}{diff}
              </span>
            )}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function LeadershipReview() {
  return (
    <DashboardLayout hideHeaderFilters>
      {({ filtered, globalFilterControls }) => (
        <LeadershipReviewContent filtered={filtered} globalFilterControls={globalFilterControls} />
      )}
    </DashboardLayout>
  );
}
