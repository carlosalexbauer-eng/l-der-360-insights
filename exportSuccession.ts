import { useMemo } from 'react';
import { Leader } from '@/data/leaders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calcLeadershipScore, getHealthClass, getLeadershipGaps } from '@/lib/scoring';
import { AlertTriangle, Activity, TrendingDown, Heart, BarChart2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export function LeadershipTab({ leaders }: { leaders: Leader[] }) {
  const stats = useMemo(() => {
    const total = leaders.length;
    const scores = leaders.map(l => ({ ...l, score: calcLeadershipScore(l), gaps: getLeadershipGaps(l) }));
    const withGaps = scores.filter(s => s.gaps.length > 0).length;
    const critical = scores.filter(s => getHealthClass(s.score) === 'critico').length;
    const attention = scores.filter(s => getHealthClass(s.score) === 'atencao').length;
    const healthy = scores.filter(s => getHealthClass(s.score) === 'saudavel').length;
    
    const enpsValues = leaders.map(l => l.enps2025).filter((v): v is number => v !== null);
    const lnpsValues = leaders.map(l => l.lnps2025).filter((v): v is number => v !== null);
    const avgEnps = enpsValues.length > 0 ? Math.round(enpsValues.reduce((a, b) => a + b, 0) / enpsValues.length) : 0;
    const avgLnps = lnpsValues.length > 0 ? Math.round(lnpsValues.reduce((a, b) => a + b, 0) / lnpsValues.length) : 0;
    
    const lowCR = leaders.filter(l => {
      const cr = l.cr2024 ?? l.cr2025;
      return cr !== null && cr < 90;
    }).length;
    
    return { total, withGaps, critical, attention, healthy, avgEnps, avgLnps, lowCR, scores };
  }, [leaders]);

  // Leadership stage distribution
  const stageData = useMemo(() => {
    const stages: Record<string, number> = {};
    leaders.forEach(l => {
      const stage = l.estagioLideranca2025 || 'Sem dado';
      stages[stage] = (stages[stage] || 0) + 1;
    });
    const order = ['O Líder Inconsciente', 'O Líder Aleatório', 'O Líder Transacional', 'O Bom Líder', 'O Líder For All'];
    const colors = ['#FF0058', '#FF8200', '#FFC20E', '#39B6A3', '#0F9688'];
    return order.filter(s => stages[s]).map((name, i) => ({
      name: name.replace('O Líder ', '').replace('O ', ''),
      value: stages[name] || 0,
      fill: colors[i],
    }));
  }, [leaders]);

  // Risk by diretoria
  const dirRiskData = useMemo(() => {
    const byDir: Record<string, { total: number; critical: number }> = {};
    leaders.forEach(l => {
      const dir = (l.diretoria || 'Sem diretoria').replace('Diretoria de ', '').replace('Diretoria ', '');
      if (!byDir[dir]) byDir[dir] = { total: 0, critical: 0 };
      byDir[dir].total++;
      const score = calcLeadershipScore(l);
      if (getHealthClass(score) === 'critico') byDir[dir].critical++;
    });
    return Object.entries(byDir)
      .map(([name, d]) => ({ name, pct: Math.round((d.critical / d.total) * 100), critical: d.critical }))
      .sort((a, b) => b.pct - a.pct);
  }, [leaders]);

  // Top leaders with most gaps
  const gapRanking = useMemo(() => {
    return stats.scores
      .filter(s => s.gaps.length > 0)
      .sort((a, b) => b.gaps.length - a.gaps.length || a.score - b.score)
      .slice(0, 15);
  }, [stats.scores]);

  // Health distribution pie
  const healthPie = [
    { name: 'Saudável', value: stats.healthy, fill: '#0F9688' },
    { name: 'Atenção', value: stats.attention, fill: '#FFC20E' },
    { name: 'Crítico', value: stats.critical, fill: '#FF0058' },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard title="Com Gaps" value={`${stats.total > 0 ? Math.round((stats.withGaps / stats.total) * 100) : 0}%`} subtitle={`${stats.withGaps} líderes`} icon={<AlertTriangle className="w-4 h-4" />} color="text-senior-orange" />
        <KPICard title="Críticos" value={stats.critical} icon={<TrendingDown className="w-4 h-4" />} color="text-senior-pink" />
        <KPICard title="Méd. eNPS" value={stats.avgEnps} icon={<Heart className="w-4 h-4" />} color={stats.avgEnps < 70 ? 'text-senior-pink' : 'text-senior-green'} />
        <KPICard title="Méd. LNPS" value={stats.avgLnps} icon={<Activity className="w-4 h-4" />} color={stats.avgLnps < 70 ? 'text-senior-pink' : 'text-senior-green'} />
        <KPICard title="CR < 90" value={`${stats.lowCR}`} subtitle="líderes" icon={<BarChart2 className="w-4 h-4" />} color="text-senior-orange" />
      </div>

      {/* Alerts */}
      {stats.critical > 0 && (
        <div className="bg-senior-pink/10 border border-senior-pink/20 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-senior-pink shrink-0" />
          <span className="text-sm"><strong>{stats.critical} líderes</strong> estão em situação crítica de saúde de liderança</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leadership Stage Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Estágio de Liderança</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stageData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Distribution Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Distribuição de Saúde</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthPie} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
                  {healthPie.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk by Diretoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Risco por Diretoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dirRiskData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {dirRiskData.map((d, i) => (
                    <Cell key={i} fill={d.pct > 30 ? '#FF0058' : d.pct > 15 ? '#FF8200' : '#0F9688'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gap Ranking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Líderes com Mais Gaps</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[260px] overflow-y-auto">
            <div className="space-y-2">
              {gapRanking.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Badge variant="outline" className="w-6 h-5 flex items-center justify-center text-[10px] p-0 border-senior-pink text-senior-pink shrink-0">
                    {l.gaps.length}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{l.nome}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {l.gaps.map((g, gi) => (
                        <Badge key={gi} className="text-[9px] h-4 bg-senior-orange/15 text-senior-orange border-0">{g}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, icon, color }: {
  title: string; value: string | number; subtitle?: string; icon: React.ReactNode; color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{title}</span>
          <span className={color || 'text-muted-foreground'}>{icon}</span>
        </div>
        <div className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</div>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </CardContent>
    </Card>
  );
}
