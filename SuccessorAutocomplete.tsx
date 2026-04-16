import { useMemo, useState } from 'react';
import { Leader } from '@/data/leaders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, CartesianGrid, ZAxis,
} from 'recharts';
import { Users, TrendingUp, Heart, Award, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 9-box quadrant mapping from the base field "ultimoQuadrante"
const NINE_BOX_MAP: Record<string, { row: number; col: number }> = {
  // Row 0 = Alto potencial (top), Row 1 = Médio, Row 2 = Baixo
  // Col 0 = Abaixo, Col 1 = Esperado, Col 2 = Acima
  'A1': { row: 0, col: 0 }, // Alto potencial / Abaixo
  'A2': { row: 0, col: 1 }, // Alto potencial / Esperado
  'A3': { row: 0, col: 2 }, // Alto potencial / Acima
  'B1': { row: 1, col: 0 }, // Médio / Abaixo
  'B2': { row: 1, col: 1 }, // Médio / Esperado
  'B3': { row: 1, col: 2 }, // Médio / Acima
  'C1': { row: 2, col: 0 }, // Baixo / Abaixo
  'C2': { row: 2, col: 1 }, // Baixo / Esperado
  'C3': { row: 2, col: 2 }, // Baixo / Acima
};

const QUADRANT_NAMES: string[][] = [
  ['Alto Potencial / Baixo Desempenho', 'Alto Potencial / Desempenho Esperado', 'Alto Potencial / Alto Desempenho'],
  ['Desempenho Abaixo do Esperado', 'Desempenho Adequado', 'Desempenho Diferenciado'],
  ['Desempenho Insuficiente', 'Desempenho Esperado', 'Desempenho Acima do Esperado'],
];

// Colors: red (bottom-left), yellow (attention), green (expected), blue (top-right)
const QUADRANT_COLORS: string[][] = [
  ['hsl(45, 100%, 53%)', 'hsl(142, 60%, 45%)', 'hsl(210, 70%, 50%)'],
  ['hsl(45, 100%, 53%)', 'hsl(142, 60%, 45%)', 'hsl(142, 60%, 45%)'],
  ['hsl(342, 100%, 50%)', 'hsl(142, 60%, 45%)', 'hsl(142, 60%, 45%)'],
];

const QUADRANT_BG: string[][] = [
  ['hsl(45 100% 53% / 0.12)', 'hsl(142 60% 45% / 0.12)', 'hsl(210 70% 50% / 0.15)'],
  ['hsl(45 100% 53% / 0.12)', 'hsl(142 60% 45% / 0.12)', 'hsl(142 60% 45% / 0.12)'],
  ['hsl(342 100% 50% / 0.12)', 'hsl(142 60% 45% / 0.12)', 'hsl(142 60% 45% / 0.12)'],
];

function parseQuadrant(q: string | null): { row: number; col: number } | null {
  if (!q) return null;
  const clean = q.trim().toUpperCase();
  return NINE_BOX_MAP[clean] ?? null;
}

type SortField = 'nome' | 'diretoria' | 'nivelCarreira' | 'liderDoLider' | 'cr2025' | 'enps2025' | 'ultimoQuadrante' | 'turnoverColab2025';
type SortDir = 'asc' | 'desc';

export function LeadershipPanel({ leaders }: { leaders: Leader[] }) {
  const [selectedQuadrant, setSelectedQuadrant] = useState<{ row: number; col: number } | null>(null);
  const [tableSortField, setTableSortField] = useState<SortField>('cr2025');
  const [tableSortDir, setTableSortDir] = useState<SortDir>('desc');
  const [tableSearch, setTableSearch] = useState('');
  const [popupSortField, setPopupSortField] = useState<string>('nome');
  const [popupSortDir, setPopupSortDir] = useState<SortDir>('asc');
  const [popupDirFilter, setPopupDirFilter] = useState('__all__');

  const active = useMemo(() => leaders.filter(l => l.situacao === 'Ativo'), [leaders]);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = active.length;
    const crValues = active.map(l => l.cr2025).filter((v): v is number => v != null);
    const enpsValues = active.map(l => l.enps2025).filter((v): v is number => v != null);
    const lnpsValues = active.map(l => l.lnps2025).filter((v): v is number => v != null);
    return {
      total,
      avgCR: crValues.length > 0 ? crValues.reduce((a, b) => a + b, 0) / crValues.length : 0,
      avgENPS: enpsValues.length > 0 ? enpsValues.reduce((a, b) => a + b, 0) / enpsValues.length : 0,
      avgLNPS: lnpsValues.length > 0 ? lnpsValues.reduce((a, b) => a + b, 0) / lnpsValues.length : 0,
    };
  }, [active]);

  // 9-box grid data
  const nineBoxData = useMemo(() => {
    const grid: Leader[][][] = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => []));
    let total = 0;
    active.forEach(l => {
      const pos = parseQuadrant(l.ultimoQuadrante);
      if (pos) {
        grid[pos.row][pos.col].push(l);
        total++;
      }
    });
    return { grid, total };
  }, [active]);

  // Scatter data (ENPS x CR)
  const scatterData = useMemo(() => {
    return active
      .filter(l => l.cr2025 != null && l.enps2025 != null)
      .map(l => ({
        x: l.cr2025!,
        y: l.enps2025!,
        nome: l.nome,
        diretoria: l.diretoria,
        nivelCarreira: l.nivelCarreira,
      }));
  }, [active]);

  // Competency distribution
  const competencyData = useMemo(() => {
    const counts: Record<string, number> = { 'Abaixo': 0, 'Esperado': 0, 'Acima': 0 };
    active.forEach(l => {
      const c = l.conceitoFinal2024;
      if (!c) return;
      const lower = c.toLowerCase();
      if (lower.includes('abaixo')) counts['Abaixo']++;
      else if (lower.includes('acima') || lower.includes('supera')) counts['Acima']++;
      else counts['Esperado']++;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      pct: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  }, [active]);

  // CR distribution
  const crDistData = useMemo(() => {
    const buckets = [
      { name: '< 80%', min: -Infinity, max: 80, value: 0 },
      { name: '80–100%', min: 80, max: 100, value: 0 },
      { name: '≥ 100%', min: 100, max: Infinity, value: 0 },
    ];
    let total = 0;
    active.forEach(l => {
      if (l.cr2025 == null) return;
      total++;
      for (const b of buckets) {
        if (l.cr2025 >= b.min && l.cr2025 < b.max) { b.value++; break; }
      }
    });
    return buckets.map(b => ({ name: b.name, value: b.value, pct: total > 0 ? Math.round((b.value / total) * 100) : 0 }));
  }, [active]);

  // Sorted table data
  const tableData = useMemo(() => {
    let data = [...active];
    if (tableSearch) {
      const s = tableSearch.toLowerCase();
      data = data.filter(l => l.nome?.toLowerCase().includes(s));
    }
    data.sort((a, b) => {
      const getVal = (l: Leader) => {
        switch (tableSortField) {
          case 'nome': return l.nome || '';
          case 'diretoria': return l.diretoria || '';
          case 'nivelCarreira': return l.nivelCarreira || '';
          case 'liderDoLider': return l.liderDoLider || '';
          case 'cr2025': return l.cr2025 ?? -1;
          case 'enps2025': return l.enps2025 ?? -999;
          case 'ultimoQuadrante': return l.ultimoQuadrante || '';
          case 'turnoverColab2025': return l.turnoverColab2025 ?? -1;
          default: return '';
        }
      };
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === 'number' && typeof vb === 'number') {
        return tableSortDir === 'asc' ? va - vb : vb - va;
      }
      return tableSortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return data;
  }, [active, tableSearch, tableSortField, tableSortDir]);

  // Popup data
  const popupLeaders = useMemo(() => {
    if (!selectedQuadrant) return [];
    let data = nineBoxData.grid[selectedQuadrant.row][selectedQuadrant.col];
    if (popupDirFilter !== '__all__') {
      data = data.filter(l => l.diretoria === popupDirFilter);
    }
    data = [...data].sort((a, b) => {
      const getVal = (l: Leader) => {
        switch (popupSortField) {
          case 'nome': return l.nome || '';
          case 'diretoria': return l.diretoria || '';
          case 'nivelCarreira': return l.nivelCarreira || '';
          case 'liderDoLider': return l.liderDoLider || '';
          default: return l.nome || '';
        }
      };
      const va = getVal(a);
      const vb = getVal(b);
      return popupSortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return data;
  }, [selectedQuadrant, nineBoxData.grid, popupDirFilter, popupSortField, popupSortDir]);

  const popupDiretorias = useMemo(() => {
    if (!selectedQuadrant) return [];
    const leaders = nineBoxData.grid[selectedQuadrant.row][selectedQuadrant.col];
    return [...new Set(leaders.map(l => l.diretoria).filter(Boolean))].sort() as string[];
  }, [selectedQuadrant, nineBoxData.grid]);

  const handleTableSort = (field: SortField) => {
    if (tableSortField === field) {
      setTableSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortField(field);
      setTableSortDir('desc');
    }
  };

  const handlePopupSort = (field: string) => {
    if (popupSortField === field) {
      setPopupSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setPopupSortField(field);
      setPopupSortDir('asc');
    }
  };

  const COMP_COLORS = ['hsl(var(--senior-pink))', 'hsl(var(--senior-yellow))', 'hsl(var(--senior-green))'];
  const CR_COLORS = ['hsl(var(--senior-pink))', 'hsl(var(--senior-yellow))', 'hsl(var(--senior-green))'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-foreground">Painel de Liderança</h2>
        <p className="text-xs text-muted-foreground">Visão executiva completa de liderança</p>
      </div>

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total de Líderes Ativos" value={kpis.total} icon={<Users className="w-4 h-4" />} />
        <KPICard label="Média Atingimento CR" value={`${kpis.avgCR.toFixed(1)}%`} icon={<TrendingUp className="w-4 h-4" />} />
        <KPICard label="Média ENPS do Líder" value={kpis.avgENPS.toFixed(1)} icon={<Heart className="w-4 h-4" />} />
        <KPICard label="Média LNPS" value={kpis.avgLNPS.toFixed(1)} icon={<Award className="w-4 h-4" />} />
      </div>

      {/* 2. 9-Box Matrix */}
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Matriz 9-Box</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex">
            {/* Y axis label */}
            <div className="flex flex-col justify-center items-center mr-2">
              <span className="text-[10px] text-muted-foreground font-medium [writing-mode:vertical-lr] rotate-180">Potencial</span>
            </div>
            <div className="flex-1">
              {/* Y axis labels */}
              <div className="grid grid-rows-3 gap-1">
                {[0, 1, 2].map(row => {
                  const yLabels = ['Alto', 'Médio', 'Baixo'];
                  return (
                    <div key={row} className="flex items-stretch gap-1">
                      <div className="w-12 flex items-center justify-end pr-1">
                        <span className="text-[10px] text-muted-foreground font-medium">{yLabels[row]}</span>
                      </div>
                      {[0, 1, 2].map(col => {
                        const count = nineBoxData.grid[row][col].length;
                        const pct = nineBoxData.total > 0 ? Math.round((count / nineBoxData.total) * 100) : 0;
                        return (
                          <button
                            key={col}
                            onClick={() => setSelectedQuadrant({ row, col })}
                            className="flex-1 min-h-[80px] rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer border"
                            style={{
                              backgroundColor: QUADRANT_BG[row][col],
                              borderColor: QUADRANT_COLORS[row][col] + '40',
                            }}
                          >
                            <span className="text-[8px] text-center leading-tight font-medium text-muted-foreground">
                              {QUADRANT_NAMES[row][col]}
                            </span>
                            <span className="text-lg font-bold" style={{ color: QUADRANT_COLORS[row][col] }}>
                              {count}
                            </span>
                            <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {/* X axis labels */}
              <div className="flex mt-1">
                <div className="w-12" />
                {['Abaixo do esperado', 'Esperado', 'Acima do esperado'].map(label => (
                  <div key={label} className="flex-1 text-center">
                    <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-1">
                <span className="text-[10px] text-muted-foreground font-medium">Desempenho</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Scatter Chart - ENPS x CR */}
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Correlação ENPS Líder × Atingimento CR</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="x"
                name="CR"
                tick={{ fontSize: 10 }}
                label={{ value: 'Atingimento CR (%)', position: 'bottom', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="ENPS"
                tick={{ fontSize: 10 }}
                label={{ value: 'ENPS Líder', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <ZAxis range={[40, 40]} />
              <RechartsTooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-2 shadow-md text-xs">
                      <p className="font-semibold">{d.nome}</p>
                      <p>CR: {d.x?.toFixed(1)}%</p>
                      <p>ENPS: {d.y?.toFixed(1)}</p>
                      <p className="text-muted-foreground">{d.diretoria}</p>
                      <p className="text-muted-foreground">{d.nivelCarreira}</p>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData} fill="hsl(var(--primary))" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Competency */}
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Avaliação de Competências</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competencyData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip formatter={(val: number, _n: string, entry: any) => [`${val} (${entry.payload.pct}%)`, 'Líderes']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, formatter: (v: number, entry: any) => `${v}` }}>
                  {competencyData.map((_, i) => (
                    <Cell key={i} fill={COMP_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CR Distribution */}
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Atingimento de CR</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crDistData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip formatter={(val: number, _n: string, entry: any) => [`${val} (${entry.payload.pct}%)`, 'Líderes']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10 }}>
                  {crDistData.map((_, i) => (
                    <Cell key={i} fill={CR_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 5. Leaders Ranking Table */}
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Ranking de Líderes</CardTitle>
          <Input
            placeholder="Buscar líder..."
            value={tableSearch}
            onChange={e => setTableSearch(e.target.value)}
            className="w-48 h-8 text-xs"
          />
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {([
                    ['nome', 'Nome'],
                    ['diretoria', 'Diretoria'],
                    ['nivelCarreira', 'Nível'],
                    ['liderDoLider', 'Líder do Líder'],
                    ['cr2025', 'CR (%)'],
                    ['enps2025', 'ENPS Líder'],
                    ['ultimoQuadrante', '9-Box'],
                    ['turnoverColab2025', 'Turnover'],
                  ] as [SortField, string][]).map(([field, label]) => (
                    <TableHead
                      key={field}
                      className="cursor-pointer hover:bg-muted/50 text-xs select-none"
                      onClick={() => handleTableSort(field)}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {tableSortField === field ? (
                          tableSortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.slice(0, 100).map((l, i) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="font-medium">{l.nome}</TableCell>
                    <TableCell>{(l.diretoria || '').replace('Diretoria de ', '').replace('Diretoria ', '')}</TableCell>
                    <TableCell>{l.nivelCarreira}</TableCell>
                    <TableCell>{l.liderDoLider || '—'}</TableCell>
                    <TableCell>{l.cr2025?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell>{l.enps2025?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell>{l.ultimoQuadrante || '—'}</TableCell>
                    <TableCell>{l.turnoverColab2025 != null ? `${l.turnoverColab2025.toFixed(1)}%` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 9-Box Quadrant Popup */}
      <Dialog open={!!selectedQuadrant} onOpenChange={(o) => !o && setSelectedQuadrant(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selectedQuadrant ? QUADRANT_NAMES[selectedQuadrant.row][selectedQuadrant.col] : ''}
              <span className="ml-2 text-muted-foreground font-normal">
                ({popupLeaders.length} {popupLeaders.length === 1 ? 'líder' : 'líderes'})
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-2">
            <Select value={popupDirFilter} onValueChange={setPopupDirFilter}>
              <SelectTrigger className="h-7 w-auto min-w-[140px] text-xs">
                <SelectValue placeholder="Todas Diretorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas Diretorias</SelectItem>
                {popupDiretorias.map(d => (
                  <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[50vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    ['nome', 'Nome'],
                    ['diretoria', 'Diretoria'],
                    ['nivelCarreira', 'Nível'],
                    ['liderDoLider', 'Líder do Líder'],
                  ].map(([field, label]) => (
                    <TableHead
                      key={field}
                      className="cursor-pointer hover:bg-muted/50 text-xs select-none"
                      onClick={() => handlePopupSort(field)}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {popupSortField === field ? (
                          popupSortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {popupLeaders.map((l, i) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="font-medium">{l.nome}</TableCell>
                    <TableCell>{(l.diretoria || '').replace('Diretoria de ', '').replace('Diretoria ', '')}</TableCell>
                    <TableCell>{l.nivelCarreira}</TableCell>
                    <TableCell>{l.liderDoLider || '—'}</TableCell>
                  </TableRow>
                ))}
                {popupLeaders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-4">
                      Nenhum líder neste quadrante
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

// --- Sub-components ---

function KPICard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="bg-card border border-border shadow-sm rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">{label}</span>
          <span className="text-primary">{icon}</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
