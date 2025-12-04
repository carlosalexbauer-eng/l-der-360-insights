import { useMemo } from 'react';
import { KPICard } from '../KPICard';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Award,
  Target,
  UserCheck,
  BookOpen,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Leader, getStats, getENPSEvolution, getLeadershipReviewDistribution, getDataByDiretoria } from '@/data/mockData';

interface OverviewViewProps {
  data: Leader[];
}

const COLORS = ['hsl(187, 85%, 53%)', 'hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 72%, 51%)'];

export function OverviewView({ data }: OverviewViewProps) {
  const stats = useMemo(() => getStats(data), [data]);
  const enpsEvolution = useMemo(() => getENPSEvolution(), []);
  const leadershipReview = useMemo(() => getLeadershipReviewDistribution(data), [data]);
  const dataByDiretoria = useMemo(() => getDataByDiretoria(data), [data]);

  const prontidaoData = [
    { name: 'Ready Now', value: stats.prontidao['Ready Now'] || 0 },
    { name: 'Ready Soon', value: stats.prontidao['Ready Soon'] || 0 },
    { name: 'Ready Later', value: stats.prontidao['Ready Later'] || 0 },
    { name: 'Não Mapeado', value: stats.prontidao['Não Mapeado'] || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Visão Geral da Liderança</h1>
        <p className="text-muted-foreground mt-1">Saúde da Liderança da Empresa</p>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Líderes"
          value={stats.total}
          subtitle="ativos"
          icon={Users}
          trend={5}
          trendLabel="2024"
        />
        <KPICard
          title="Prontidão Ready Now"
          value={`${Math.round((stats.prontidao['Ready Now'] || 0) / stats.total * 100)}%`}
          subtitle={`${stats.prontidao['Ready Now'] || 0} líderes`}
          icon={Award}
          variant="success"
        />
        <KPICard
          title="Potenciais Sucessores"
          value={`${stats.percSucessores2025}%`}
          subtitle="mapeados"
          icon={UserCheck}
          trend={stats.percSucessores2025 - stats.percSucessores2024}
          trendLabel="2024"
        />
        <KPICard
          title="Líderes em Risco"
          value={`${stats.percLideresRisco}%`}
          subtitle={`${stats.lideresRisco} líderes`}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="ENPS Líderes"
          value={stats.mediaENPSLideres}
          icon={TrendingUp}
          trend={8}
          trendLabel="2024"
        />
        <KPICard
          title="ENPS Times"
          value={stats.mediaENPSTimes}
          icon={Target}
          trend={5}
          trendLabel="2024"
        />
        <KPICard
          title="Participação Programas"
          value={`${stats.percParticipacaoPrograma}%`}
          subtitle="Líder em Ação + Pool"
          icon={BookOpen}
        />
        <KPICard
          title="Leadership Journey"
          value="67%"
          subtitle="média conclusão"
          icon={BarChart3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ENPS Evolution Chart */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Evolução ENPS: Líderes vs Times</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enpsEvolution}>
              <defs>
                <linearGradient id="colorLideres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTimes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Area type="monotone" dataKey="lideres" stroke="hsl(187, 85%, 53%)" fillOpacity={1} fill="url(#colorLideres)" name="Líderes" />
              <Area type="monotone" dataKey="times" stroke="hsl(160, 84%, 39%)" fillOpacity={1} fill="url(#colorTimes)" name="Times" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Prontidão Pie Chart */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Prontidão para Sucessão</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prontidaoData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {prontidaoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical"
                wrapperStyle={{ color: 'hsl(210, 40%, 98%)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leadership Review & By Diretoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leadership Review Distribution */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Distribuição Leadership Review 2025</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadershipReview}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis dataKey="quadrant" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Bar dataKey="count" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} name="Líderes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Diretoria */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Líderes por Diretoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataByDiretoria} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 40%, 18%)" />
              <XAxis type="number" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis dataKey="diretoria" type="category" stroke="hsl(215, 20%, 65%)" fontSize={11} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 9%)', 
                  border: '1px solid hsl(222, 40%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }} 
              />
              <Bar dataKey="totalLideres" fill="hsl(187, 85%, 53%)" radius={[0, 4, 4, 0]} name="Líderes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Card */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Insights Automáticos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success font-medium">Melhoria Ano a Ano</p>
            <p className="text-xs text-muted-foreground mt-1">ENPS dos líderes subiu 8% em relação a 2024</p>
          </div>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning font-medium">Atenção Necessária</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.lideresRisco} líderes com indicadores abaixo da meta</p>
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-medium">Oportunidade</p>
            <p className="text-xs text-muted-foreground mt-1">23% dos líderes prontos para novas posições estratégicas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
