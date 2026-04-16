import { useMemo } from 'react';
import { Leader } from '@/data/leaders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calcSuccessionScore, calcLeadershipScore, getMatrixQuadrant, getHealthClass, getSuccessionStatus } from '@/lib/scoring';
import { AlertTriangle, Star, ArrowUpRight, RefreshCw, XOctagon, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea } from 'recharts';

export function IntegratedTab({ leaders }: { leaders: Leader[] }) {
  const leaderScores = useMemo(() => {
    return leaders.map(l => ({
      nome: l.nome,
      diretoria: (l.diretoria || '').replace('Diretoria de ', '').replace('Diretoria ', ''),
      healthScore: calcLeadershipScore(l),
      successionScore: calcSuccessionScore(l),
      quadrant: getMatrixQuadrant(calcLeadershipScore(l), calcSuccessionScore(l)),
    }));
  }, [leaders]);

  const quadrantCounts = useMemo(() => {
    const counts = { referencia: 0, risco_futuro: 0, oportunidade: 0, risco_critico: 0 };
    leaderScores.forEach(l => counts[l.quadrant]++);
    return counts;
  }, [leaderScores]);

  // Insights
  const insights = useMemo(() => {
    const total = leaders.length;
    if (total === 0) return [];
    const msgs: { icon: React.ReactNode; text: string; severity: 'critical' | 'warning' | 'info' }[] = [];

    const gapPct = Math.round((leaders.filter(l => getSuccessionStatus(l) === 'gap').length / total) * 100);
    if (gapPct > 0) msgs.push({ icon: <XOctagon className="w-4 h-4" />, text: `${gapPct}% dos líderes não possuem sucessores mapeados`, severity: 'critical' });

    const longReady = leaders.filter(l => {
      const active = l.sucessores.filter(s => s.status === 'Ativo');
      return active.length > 0 && active.every(s => {
        const p = (s.prontidao || '').toLowerCase();
        return p.includes('2 a 3') || p.includes('3 a 4');
      });
    }).length;
    if (longReady > 0) msgs.push({ icon: <AlertTriangle className="w-4 h-4" />, text: `${longReady} líderes possuem sucessores apenas com prontidão acima de 2 anos`, severity: 'warning' });

    const lowEnps = leaders.filter(l => l.enps2025 !== null && l.enps2025 < 70).length;
    const lowEnpsPct = Math.round((lowEnps / total) * 100);
    if (lowEnpsPct > 0) msgs.push({ icon: <AlertTriangle className="w-4 h-4" />, text: `${lowEnpsPct}% dos líderes estão com eNPS abaixo de 70`, severity: 'warning' });

    // Worst diretoria for succession
    const byDir: Record<string, { total: number; risk: number }> = {};
    leaders.forEach(l => {
      const dir = (l.diretoria || 'Sem diretoria').replace('Diretoria de ', '').replace('Diretoria ', '');
      if (!byDir[dir]) byDir[dir] = { total: 0, risk: 0 };
      byDir[dir].total++;
      if (getSuccessionStatus(l) !== 'saudavel') byDir[dir].risk++;
    });
    const worstDir = Object.entries(byDir).sort((a, b) => (b[1].risk / b[1].total) - (a[1].risk / a[1].total))[0];
    if (worstDir) msgs.push({ icon: <Lightbulb className="w-4 h-4" />, text: `${worstDir[0]} concentra maior risco de sucessão (${Math.round((worstDir[1].risk / worstDir[1].total) * 100)}%)`, severity: 'info' });

    return msgs;
  }, [leaders]);

  const quadrantColors: Record<string, string> = {
    referencia: '#0F9688',
    risco_futuro: '#FFC20E',
    oportunidade: '#FF8200',
    risco_critico: '#FF0058',
  };

  return (
    <div className="space-y-4">
      {/* Quadrant summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuadrantCard title="Referência" count={quadrantCounts.referencia} icon={<Star className="w-4 h-4" />} color="text-senior-green" desc="Forte liderança + sucessão" />
        <QuadrantCard title="Risco Futuro" count={quadrantCounts.risco_futuro} icon={<ArrowUpRight className="w-4 h-4" />} color="text-senior-yellow" desc="Boa liderança, baixa sucessão" />
        <QuadrantCard title="Oportunidade" count={quadrantCounts.oportunidade} icon={<RefreshCw className="w-4 h-4" />} color="text-senior-orange" desc="Liderança frágil, boa sucessão" />
        <QuadrantCard title="Risco Crítico" count={quadrantCounts.risco_critico} icon={<XOctagon className="w-4 h-4" />} color="text-senior-pink" desc="Frágil + sem sucessão" />
      </div>

      {/* Matrix */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Matriz Liderança × Sucessão</CardTitle>
        </CardHeader>
        <CardContent className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <XAxis type="number" dataKey="healthScore" name="Saúde Liderança" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Saúde da Liderança →', position: 'bottom', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="number" dataKey="successionScore" name="Maturidade Sucessão" domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: 'Maturidade Sucessão →', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <ReferenceLine x={60} stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <ReferenceLine y={60} stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <ReferenceArea x1={60} x2={100} y1={60} y2={100} fill="#0F9688" fillOpacity={0.05} />
              <ReferenceArea x1={60} x2={100} y1={0} y2={60} fill="#FFC20E" fillOpacity={0.05} />
              <ReferenceArea x1={0} x2={60} y1={60} y2={100} fill="#FF8200" fillOpacity={0.05} />
              <ReferenceArea x1={0} x2={60} y1={0} y2={60} fill="#FF0058" fillOpacity={0.05} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-card border rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-semibold">{d.nome}</p>
                    <p className="text-muted-foreground">{d.diretoria}</p>
                    <p>Saúde: {d.healthScore} | Sucessão: {d.successionScore}</p>
                  </div>
                );
              }} />
              <Scatter data={leaderScores}>
                {leaderScores.map((l, i) => (
                  <Cell key={i} fill={quadrantColors[l.quadrant]} fillOpacity={0.7} r={5} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Insights Automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${
                  insight.severity === 'critical' ? 'bg-senior-pink/10 text-senior-pink' :
                  insight.severity === 'warning' ? 'bg-senior-orange/10 text-senior-orange' :
                  'bg-senior-turquoise/10 text-senior-turquoise'
                }`}>
                  {insight.icon}
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuadrantCard({ title, count, icon, color, desc }: {
  title: string; count: number; icon: React.ReactNode; color: string; desc: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{title}</span>
          <span className={color}>{icon}</span>
        </div>
        <div className={`text-2xl font-bold ${color}`}>{count}</div>
        <span className="text-[10px] text-muted-foreground">{desc}</span>
      </CardContent>
    </Card>
  );
}
