import { useMemo } from 'react';
import { KPICard } from '../KPICard';
import { Smile, TrendingUp, TrendingDown, ThermometerSun, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Leader, getDataByDiretoria } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ClimaViewProps {
  data: Leader[];
}

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function ClimaView({ data }: ClimaViewProps) {
  const avgENPS2024 = Math.round(data.reduce((acc, l) => acc + l.gptwENPS2024, 0) / data.length);
  const avgENPS2025 = Math.round(data.reduce((acc, l) => acc + l.gptwENPS2025, 0) / data.length);
  const avgLNPS = Math.round(data.reduce((acc, l) => acc + l.gptwLNPS2025, 0) / data.length);
  const avgIVR = Math.round(data.reduce((acc, l) => acc + l.gptwIVR2025, 0) / data.length);

  const dataByDiretoria = useMemo(() => getDataByDiretoria(data), [data]);

  // MOODS monthly data
  const moodsData = useMemo(() => {
    return months.map((month, i) => {
      const avg = Math.round(data.reduce((acc, l) => acc + (l.moodsENPS2025[i] || 0), 0) / data.length);
      return { month, enps: avg };
    });
  }, [data]);

  // Comparison 2024 vs 2025
  const comparisonData = useMemo(() => {
    return dataByDiretoria.map(d => ({
      diretoria: d.diretoria,
      enps2024: Math.round(data.filter(l => l.diretoria === d.diretoria).reduce((acc, l) => acc + l.gptwENPS2024, 0) / (data.filter(l => l.diretoria === d.diretoria).length || 1)),
      enps2025: d.mediaENPS,
    }));
  }, [data, dataByDiretoria]);

  // Leaders with biggest improvement/decline
  const leadersEvolution = useMemo(() => {
    return data
      .map(l => ({
        ...l,
        evolution: l.gptwENPS2025 - l.gptwENPS2024,
      }))
      .sort((a, b) => b.evolution - a.evolution);
  }, [data]);

  const topImprovement = leadersEvolution.slice(0, 5);
  const topDecline = leadersEvolution.slice(-5).reverse();

  // Radar data for estágio de liderança
  const estagioData = useMemo(() => {
    const stages = ['Inicial', 'Em Desenvolvimento', 'Consolidado', 'Referência'];
    return stages.map(s => ({
      stage: s,
      '2024': data.filter(l => l.estagioLideranca2024 === s).length,
      '2025': data.filter(l => l.estagioLideranca2025 === s).length,
    }));
  }, [data]);

  // Heatmap data by diretoria
  const heatmapData = useMemo(() => {
    return dataByDiretoria.map(d => ({
      ...d,
      color: d.mediaENPS >= 70 ? 'success' : d.mediaENPS >= 50 ? 'warning' : 'danger',
    }));
  }, [dataByDiretoria]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Clima das Equipes Lideradas</h1>
        <p className="text-muted-foreground mt-1">Análise de engajamento e satisfação</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="ENPS Times 2025"
          value={avgENPS2025}
          icon={Smile}
          trend={avgENPS2025 - avgENPS2024}
          trendLabel="2024"
          variant={avgENPS2025 >= 70 ? 'success' : avgENPS2025 >= 50 ? 'warning' : 'danger'}
        />
        <KPICard
          title="LNPS 2025"
          value={avgLNPS}
          subtitle="Leadership NPS"
          icon={ThermometerSun}
        />
        <KPICard
          title="IVR Médio"
          value={`${avgIVR}%`}
          subtitle="Índice Valor Realizado"
          icon={Activity}
        />
        <KPICard
          title="Variação ENPS"
          value={`${avgENPS2025 - avgENPS2024 > 0 ? '+' : ''}${avgENPS2025 - avgENPS2024}`}
          subtitle="vs 2024"
          icon={avgENPS2025 - avgENPS2024 >= 0 ? TrendingUp : TrendingDown}
          variant={avgENPS2025 - avgENPS2024 >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MOODS Monthly */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">MOODS: ENPS Mensal 2025</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="enps" 
                stroke="hsl(187, 85%, 53%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(187, 85%, 53%)', strokeWidth: 2 }}
                name="ENPS"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ENPS 2024 vs 2025 */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">ENPS por Diretoria: 2024 vs 2025</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis dataKey="diretoria" stroke="hsl(215, 20%, 65%)" fontSize={10} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Legend />
              <Bar dataKey="enps2024" fill="hsl(215, 20%, 45%)" radius={[4, 4, 0, 0]} name="2024" />
              <Bar dataKey="enps2025" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} name="2025" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap & Stage Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap by Diretoria */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Heatmap de Clima por Diretoria</h3>
          <div className="grid grid-cols-2 gap-3">
            {heatmapData.map((d) => (
              <div 
                key={d.diretoria}
                className={cn(
                  'p-4 rounded-lg border',
                  d.color === 'success' && 'bg-success/10 border-success/30',
                  d.color === 'warning' && 'bg-warning/10 border-warning/30',
                  d.color === 'danger' && 'bg-destructive/10 border-destructive/30',
                )}
              >
                <p className="font-medium text-sm">{d.diretoria}</p>
                <p className={cn(
                  'text-2xl font-display font-bold mt-1',
                  d.color === 'success' && 'text-success',
                  d.color === 'warning' && 'text-warning',
                  d.color === 'danger' && 'text-destructive',
                )}>
                  {d.mediaENPS}
                </p>
                <p className="text-xs text-muted-foreground">{d.totalLideres} líderes</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Radar */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Estágio de Liderança: 2024 vs 2025</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={estagioData}>
              <PolarGrid stroke="hsl(222, 40%, 18%)" />
              <PolarAngleAxis dataKey="stage" stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(215, 20%, 65%)" fontSize={10} />
              <Radar name="2024" dataKey="2024" stroke="hsl(215, 20%, 45%)" fill="hsl(215, 20%, 45%)" fillOpacity={0.3} />
              <Radar name="2025" dataKey="2025" stroke="hsl(187, 85%, 53%)" fill="hsl(187, 85%, 53%)" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Improvement & Decline Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Improvement */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Maior Melhoria no ENPS
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Líder</th>
                  <th>Diretoria</th>
                  <th>2024</th>
                  <th>2025</th>
                  <th>Δ</th>
                </tr>
              </thead>
              <tbody>
                {topImprovement.map((leader) => (
                  <tr key={leader.id}>
                    <td className="font-medium">{leader.nome}</td>
                    <td className="text-muted-foreground">{leader.diretoria}</td>
                    <td>{leader.gptwENPS2024}</td>
                    <td>{leader.gptwENPS2025}</td>
                    <td className="text-success font-semibold">+{leader.evolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Decline */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            Maior Queda no ENPS
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Líder</th>
                  <th>Diretoria</th>
                  <th>2024</th>
                  <th>2025</th>
                  <th>Δ</th>
                </tr>
              </thead>
              <tbody>
                {topDecline.map((leader) => (
                  <tr key={leader.id}>
                    <td className="font-medium">{leader.nome}</td>
                    <td className="text-muted-foreground">{leader.diretoria}</td>
                    <td>{leader.gptwENPS2024}</td>
                    <td>{leader.gptwENPS2025}</td>
                    <td className="text-destructive font-semibold">{leader.evolution}</td>
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
