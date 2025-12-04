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
  Cell,
  Legend,
} from 'recharts';
import { Leader, getTopPerformers, getRiskLeaders } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface PerformanceViewProps {
  data: Leader[];
}

export function PerformanceView({ data }: PerformanceViewProps) {
  const topPerformers = useMemo(() => getTopPerformers(data, 10), [data]);
  const riskLeaders = useMemo(() => getRiskLeaders(data, 10), [data]);

  // Correlation data: Leadership Review × CR Achievement
  const correlationData = useMemo(() => {
    return data.map(l => ({
      x: l.atingimentoCR2025,
      y: l.gptwENPS2025,
      name: l.nome,
      review: l.leadershipReview2025,
      z: 100,
    }));
  }, [data]);

  // Feedbacks vs Performance
  const feedbacksData = useMemo(() => {
    return [
      { range: '0-50%', count: data.filter(l => l.percAtingimentoFeedbacks < 50).length, avg: 72 },
      { range: '50-75%', count: data.filter(l => l.percAtingimentoFeedbacks >= 50 && l.percAtingimentoFeedbacks < 75).length, avg: 78 },
      { range: '75-90%', count: data.filter(l => l.percAtingimentoFeedbacks >= 75 && l.percAtingimentoFeedbacks < 90).length, avg: 84 },
      { range: '90-100%', count: data.filter(l => l.percAtingimentoFeedbacks >= 90).length, avg: 91 },
    ];
  }, [data]);

  const avgCR = Math.round(data.reduce((acc, l) => acc + l.atingimentoCR2025, 0) / data.length);
  const avgLeadershipJourney = Math.round(data.reduce((acc, l) => acc + l.percLeadershipJourney, 0) / data.length);

  const getReviewColor = (review: string) => {
    if (review.startsWith('A')) return 'text-success';
    if (review.startsWith('B')) return 'text-warning';
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
          value={`${avgLeadershipJourney}%`}
          subtitle="conclusão média"
          icon={TrendingUp}
        />
        <KPICard
          title="Avaliação A ou B"
          value={`${Math.round(data.filter(l => l.leadershipReview2025.startsWith('A') || l.leadershipReview2025.startsWith('B')).length / data.length * 100)}%`}
          subtitle="dos líderes"
          icon={Medal}
          variant="success"
        />
        <KPICard
          title="Feedbacks Meta"
          value={`${Math.round(data.filter(l => l.percAtingimentoFeedbacks >= 80).length / data.length * 100)}%`}
          subtitle="atingiram"
          icon={Trophy}
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

        {/* Feedbacks × Performance */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Feedbacks Entregues × Performance Média</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={feedbacksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis dataKey="range" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(160, 84%, 39%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} name="Qtde Líderes" />
              <Bar yAxisId="right" dataKey="avg" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="ENPS Médio" />
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
                    <td className="text-muted-foreground">{leader.diretoria}</td>
                    <td>
                      <span className={cn(
                        'status-badge',
                        leader.atingimentoCR2025 >= 100 ? 'status-success' : 
                        leader.atingimentoCR2025 >= 80 ? 'status-warning' : 'status-danger'
                      )}>
                        {leader.atingimentoCR2025}%
                      </span>
                    </td>
                    <td>{leader.gptwENPS2025}</td>
                    <td className={getReviewColor(leader.leadershipReview2025)}>
                      {leader.leadershipReview2025}
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
            TOP 10 Líderes com Maior Risco
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
                    <td className="text-muted-foreground">{leader.diretoria}</td>
                    <td>
                      <span className={cn(
                        'status-badge',
                        leader.atingimentoCR2025 >= 100 ? 'status-success' : 
                        leader.atingimentoCR2025 >= 80 ? 'status-warning' : 'status-danger'
                      )}>
                        {leader.atingimentoCR2025}%
                      </span>
                    </td>
                    <td className={leader.gptwENPS2025 < 50 ? 'text-destructive' : ''}>
                      {leader.gptwENPS2025}
                    </td>
                    <td className={leader.percDesligamentosPorLider > 15 ? 'text-destructive' : ''}>
                      {leader.percDesligamentosPorLider.toFixed(1)}%
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
