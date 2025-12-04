import { useMemo, useState } from 'react';
import { KPICard } from '../KPICard';
import { GitBranch, Users, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Leader, diretorias } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface PipelineViewProps {
  data: Leader[];
}

// 9-Box Grid Component
function NineBox({ data }: { data: Leader[] }) {
  const getQuadrantLabel = (perf: string, pot: boolean): string => {
    const perfNum = perf.startsWith('A') ? 3 : perf.startsWith('B') ? 2 : 1;
    const potNum = pot ? 3 : 2; // If mapped as successor = high potential
    return `${perfNum}-${potNum}`;
  };

  const quadrants = useMemo(() => {
    const grid: Record<string, Leader[]> = {
      '3-3': [], '3-2': [], '3-1': [],
      '2-3': [], '2-2': [], '2-1': [],
      '1-3': [], '1-2': [], '1-1': [],
    };

    data.forEach(l => {
      const perfNum = l.leadershipReview2025.startsWith('A') ? 3 : l.leadershipReview2025.startsWith('B') ? 2 : 1;
      const potNum = l.mapeadoSucessor2025 ? 3 : l.prontidaoSucessao === 'Ready Soon' ? 2 : 1;
      const key = `${perfNum}-${potNum}`;
      if (grid[key]) grid[key].push(l);
    });

    return grid;
  }, [data]);

  const getBoxColor = (perf: number, pot: number) => {
    if (perf === 3 && pot === 3) return 'bg-success/20 border-success/40';
    if (perf >= 2 && pot >= 2) return 'bg-primary/20 border-primary/40';
    if (perf === 1 && pot === 1) return 'bg-destructive/20 border-destructive/40';
    return 'bg-warning/20 border-warning/40';
  };

  const getBoxLabel = (perf: number, pot: number) => {
    if (perf === 3 && pot === 3) return 'Estrela';
    if (perf === 3 && pot === 2) return 'Alto Desempenho';
    if (perf === 3 && pot === 1) return 'Especialista';
    if (perf === 2 && pot === 3) return 'Alto Potencial';
    if (perf === 2 && pot === 2) return 'Core Performer';
    if (perf === 2 && pot === 1) return 'Desenvolvimento';
    if (perf === 1 && pot === 3) return 'Diamante Bruto';
    if (perf === 1 && pot === 2) return 'Inconsistente';
    return 'Atenção';
  };

  return (
    <div className="chart-container">
      <h3 className="font-display font-semibold mb-4">Matriz 9-Box: Performance × Potencial</h3>
      <div className="grid grid-cols-3 gap-2">
        {/* Row labels */}
        <div className="col-span-3 flex justify-between text-xs text-muted-foreground mb-2 px-2">
          <span>Baixo Potencial</span>
          <span>Médio Potencial</span>
          <span>Alto Potencial</span>
        </div>
        
        {/* Top row (High Performance) */}
        {[1, 2, 3].map(pot => (
          <div key={`3-${pot}`} className={cn('p-3 rounded-lg border min-h-24', getBoxColor(3, pot))}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium">{getBoxLabel(3, pot)}</span>
              <span className="text-lg font-display font-bold">{quadrants[`3-${pot}`].length}</span>
            </div>
            {pot === 3 && <span className="text-[10px] text-muted-foreground">Perf: Alta</span>}
          </div>
        ))}
        
        {/* Middle row */}
        {[1, 2, 3].map(pot => (
          <div key={`2-${pot}`} className={cn('p-3 rounded-lg border min-h-24', getBoxColor(2, pot))}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium">{getBoxLabel(2, pot)}</span>
              <span className="text-lg font-display font-bold">{quadrants[`2-${pot}`].length}</span>
            </div>
            {pot === 3 && <span className="text-[10px] text-muted-foreground">Perf: Média</span>}
          </div>
        ))}
        
        {/* Bottom row (Low Performance) */}
        {[1, 2, 3].map(pot => (
          <div key={`1-${pot}`} className={cn('p-3 rounded-lg border min-h-24', getBoxColor(1, pot))}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium">{getBoxLabel(1, pot)}</span>
              <span className="text-lg font-display font-bold">{quadrants[`1-${pot}`].length}</span>
            </div>
            {pot === 3 && <span className="text-[10px] text-muted-foreground">Perf: Baixa</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PipelineView({ data }: PipelineViewProps) {
  const [selectedDiretoria, setSelectedDiretoria] = useState<string | null>(null);

  const stats = useMemo(() => {
    const filtered = selectedDiretoria ? data.filter(l => l.diretoria === selectedDiretoria) : data;
    return {
      total: filtered.length,
      readyNow: filtered.filter(l => l.prontidaoSucessao === 'Ready Now').length,
      readySoon: filtered.filter(l => l.prontidaoSucessao === 'Ready Soon').length,
      readyLater: filtered.filter(l => l.prontidaoSucessao === 'Ready Later').length,
      naoMapeado: filtered.filter(l => l.prontidaoSucessao === 'Não Mapeado').length,
      sucessores2025: filtered.filter(l => l.mapeadoSucessor2025).length,
    };
  }, [data, selectedDiretoria]);

  // Gaps by diretoria
  const gapsByDiretoria = useMemo(() => {
    return diretorias.map(d => {
      const lideres = data.filter(l => l.diretoria === d);
      const comSucessor = lideres.filter(l => l.indicados.length > 0).length;
      const semSucessor = lideres.length - comSucessor;
      return {
        diretoria: d,
        total: lideres.length,
        comSucessor,
        semSucessor,
        gap: Math.round((semSucessor / (lideres.length || 1)) * 100),
      };
    }).sort((a, b) => b.gap - a.gap);
  }, [data]);

  // Pipeline by cargo
  const pipelineByCargo = useMemo(() => {
    const cargos: Record<string, { total: number; readyNow: number; readySoon: number }> = {};
    data.forEach(l => {
      if (!cargos[l.cargo]) cargos[l.cargo] = { total: 0, readyNow: 0, readySoon: 0 };
      cargos[l.cargo].total++;
      if (l.prontidaoSucessao === 'Ready Now') cargos[l.cargo].readyNow++;
      if (l.prontidaoSucessao === 'Ready Soon') cargos[l.cargo].readySoon++;
    });
    return Object.entries(cargos)
      .map(([cargo, stats]) => ({ cargo, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Mapa de Sucessão</h1>
        <p className="text-muted-foreground mt-1">Pipeline e prontidão de sucessores</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Ready Now"
          value={stats.readyNow}
          subtitle="prontos hoje"
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Ready Soon"
          value={stats.readySoon}
          subtitle="1-2 anos"
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Ready Later"
          value={stats.readyLater}
          subtitle="3+ anos"
          icon={GitBranch}
        />
        <KPICard
          title="Não Mapeados"
          value={stats.naoMapeado}
          icon={XCircle}
          variant="danger"
        />
        <KPICard
          title="Total Sucessores"
          value={stats.sucessores2025}
          subtitle="mapeados 2025"
          icon={Users}
        />
      </div>

      {/* Diretoria Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDiretoria(null)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
            !selectedDiretoria ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          Todas
        </button>
        {diretorias.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDiretoria(d)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              selectedDiretoria === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {/* 9-Box & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NineBox data={selectedDiretoria ? data.filter(l => l.diretoria === selectedDiretoria) : data} />

        {/* Gaps by Diretoria */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Lacunas de Sucessão por Diretoria
          </h3>
          <div className="space-y-3">
            {gapsByDiretoria.map(d => (
              <div key={d.diretoria} className="flex items-center gap-3">
                <span className="text-sm w-24 truncate">{d.diretoria}</span>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-success/60 absolute left-0"
                    style={{ width: `${100 - d.gap}%` }}
                  />
                  <div 
                    className="h-full bg-destructive/60 absolute right-0"
                    style={{ width: `${d.gap}%` }}
                  />
                </div>
                <span className={cn(
                  'text-sm font-medium w-12 text-right',
                  d.gap > 50 ? 'text-destructive' : d.gap > 30 ? 'text-warning' : 'text-success'
                )}>
                  {d.gap}%
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-success/60 rounded" /> Com sucessor
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-destructive/60 rounded" /> Sem sucessor
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline by Cargo */}
      <div className="chart-container">
        <h3 className="font-display font-semibold mb-4">Pipeline por Cargo Crítico</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cargo</th>
                <th className="text-center">Total</th>
                <th className="text-center">Ready Now</th>
                <th className="text-center">Ready Soon</th>
                <th>Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {pipelineByCargo.map(p => {
                const cobertura = Math.round(((p.readyNow + p.readySoon) / p.total) * 100);
                return (
                  <tr key={p.cargo}>
                    <td className="font-medium">{p.cargo}</td>
                    <td className="text-center">{p.total}</td>
                    <td className="text-center">
                      <span className="status-badge status-success">{p.readyNow}</span>
                    </td>
                    <td className="text-center">
                      <span className="status-badge status-warning">{p.readySoon}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full',
                              cobertura >= 70 ? 'bg-success' : cobertura >= 40 ? 'bg-warning' : 'bg-destructive'
                            )}
                            style={{ width: `${cobertura}%` }}
                          />
                        </div>
                        <span className="text-sm w-10">{cobertura}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
