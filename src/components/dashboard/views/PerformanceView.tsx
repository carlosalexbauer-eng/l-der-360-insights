import { useMemo } from 'react';
import { KPICard } from '../KPICard';
import { Trophy, TrendingUp, Target, Medal, AlertCircle } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Leader, getTopPerformers, getHighRiskLeaders } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface PerformanceViewProps {
  data: Leader[];
}

export function PerformanceView({ data }: PerformanceViewProps) {
  const topPerformers = useMemo(() => getTopPerformers(), []);
  const riskLeaders = useMemo(() => getHighRiskLeaders(), []);

  // Correlation data: Leadership Review × CR Achievement
  const correlationData = useMemo(() => {
    return data
      .filter(l => l.atingimentoCR2025 !== null && l.gptwENPS2025 !== null)
      .map(l => ({
        x: l.atingimentoCR2025,
        y: l.gptwENPS2025,
        name: l.nome,
        review: l.ultimoQuadranteReview || 'N/A',
        z: 100,
      }));
  }, [data]);

  // Calculate averages safely
  const validCR = data.filter(l => l.atingimentoCR2025 !== null);
  const avgCR = validCR.length > 0 ? Math.round(validCR.reduce((acc, l) => acc + (l.atingimentoCR2025 || 0), 0) / validCR.length) : 0;

  // Count leaders with review containing performance keywords
  const highPerformers = data.filter(l => 
    l.ultimoQuadranteReview && 
    (l.ultimoQuadranteReview.toLowerCase().includes('alto') || 
     l.ultimoQuadranteReview.toLowerCase().includes('diferenciado') ||
     l.ultimoQuadranteReview.toLowerCase().includes('acima'))
  ).length;
  const percHighPerformers = data.length > 0 ? Math.round((highPerformers / data.length) * 100) : 0;

  const getReviewColor = (review: string) => {
    if (review.toLowerCase().includes('alto') || review.toLowerCase().includes('acima')) return 'text-success';
    if (review.toLowerCase().includes('adequado') || review.toLowerCase().includes('esperado')) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Performance e Entrega</h1>
        <p className="text-muted-foreground mt-1">Análise de desempenho e correlações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Atingimento CR Médio"
          value={`${avgCR}%`}
          icon={Target}
          trend={3}
          trendLabel="2024"
        />
        <KPICard
          title="Leadership Journey"
          value="67%"
          subtitle="conclusão média"
          icon={TrendingUp}
        />
        <KPICard
          title="Alto Desempenho"
          value={`${percHighPerformers}%`}
          subtitle="dos líderes"
          icon={Medal}
          variant="success"
        />
        <KPICard
          title="Em Risco"
          value={riskLeaders.length}
          subtitle="líderes"
          icon={AlertCircle}
          variant="danger"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter: CR × ENPS */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Correlação: Atingimento CR × ENPS do Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="CR" 
                unit="%" 
                stroke="hsl(215, 20%, 65%)" 
                fontSize={12}
                label={{ value: 'Atingimento CR (%)', position: 'bottom', fill: 'hsl(215, 20%, 65%)' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="ENPS" 
                stroke="hsl(215, 20%, 65%)" 
                fontSize={12}
                label={{ value: 'ENPS Time', angle: -90, position: 'insideLeft', fill: 'hsl(215, 20%, 65%)' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }}
                formatter={(value, name) => [value, name === 'x' ? 'CR' : 'ENPS']}
              />
              <Scatter name="Líderes" data={correlationData} fill="hsl(187, 85%, 53%)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* CR Distribution */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Distribuição CR 2025</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={[
              { range: '< 80%', count: data.filter(l => l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80).length },
              { range: '80-100%', count: data.filter(l => l.atingimentoCR2025 !== null && l.atingimentoCR2025 >= 80 && l.atingimentoCR2025 < 100).length },
              { range: '100-120%', count: data.filter(l => l.atingimentoCR2025 !== null && l.atingimentoCR2025 >= 100 && l.atingimentoCR2025 < 120).length },
              { range: '> 120%', count: data.filter(l => l.atingimentoCR2025 !== null && l.atingimentoCR2025 >= 120).length },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis dataKey="range" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Legend />
              <Bar dataKey="count" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} name="Qtde Líderes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers & Risk Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Performers */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            TOP 10 Líderes de Maior Impacto
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Líder</th>
                  <th>Diretoria</th>
                  <th>CR</th>
                  <th>ENPS</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((leader, i) => (
                  <tr key={leader.id}>
                    <td className="text-muted-foreground">{i + 1}</td>
                    <td className="font-medium">{leader.nome}</td>
                    <td className="text-muted-foreground text-xs">{leader.diretoria.replace('Diretoria de ', '')}</td>
                    <td>
                      <span className={cn(
                        'status-badge',
                        leader.cr2025 >= 100 ? 'status-success' : 
                        leader.cr2025 >= 80 ? 'status-warning' : 'status-danger'
                      )}>
                        {leader.cr2025?.toFixed(0)}%
                      </span>
                    </td>
                    <td>{leader.enps2025}</td>
                    <td className={cn('text-xs', getReviewColor(leader.ultimoQuadranteReview || ''))}>
                      {leader.ultimoQuadranteReview ? leader.ultimoQuadranteReview.substring(0, 20) + '...' : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Risk */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Líderes com Maior Risco
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Líder</th>
                  <th>Diretoria</th>
                  <th>CR</th>
                  <th>ENPS</th>
                  <th>Turnover</th>
                </tr>
              </thead>
              <tbody>
                {riskLeaders.map((leader, i) => (
                  <tr key={leader.id}>
                    <td className="text-muted-foreground">{i + 1}</td>
                    <td className="font-medium">{leader.nome}</td>
                    <td className="text-muted-foreground text-xs">{leader.diretoria.replace('Diretoria de ', '')}</td>
                    <td>
                      <span className={cn(
                        'status-badge',
                        leader.atingimentoCR2025 >= 100 ? 'status-success' : 
                        leader.atingimentoCR2025 >= 80 ? 'status-warning' : 'status-danger'
                      )}>
                        {leader.atingimentoCR2025?.toFixed(0)}%
                      </span>
                    </td>
                    <td className={leader.gptwENPS2025 < 50 ? 'text-destructive' : ''}>
                      {leader.gptwENPS2025}
                    </td>
                    <td className={leader.percentDesligamentos2025 > 15 ? 'text-destructive' : ''}>
                      {leader.percentDesligamentos2025?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
