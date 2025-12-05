import { useMemo } from 'react';
import { KPICard } from '../KPICard';
import { AlertTriangle, TrendingDown, UserMinus, XCircle, ShieldAlert, Lightbulb } from 'lucide-react';
import { Leader, getDiretorias, getHighRiskLeaders } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface RiscosViewProps {
  data: Leader[];
}

export function RiscosView({ data }: RiscosViewProps) {
  const diretorias = getDiretorias();
  
  // Risk calculations
  const riskAnalysis = useMemo(() => {
    const lowENPS = data.filter(l => l.gptwENPS2025 !== null && l.gptwENPS2025 < 50);
    const lowCR = data.filter(l => l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80);
    const highTurnover = data.filter(l => (l.percentDesligamentos2025 || 0) > 15);
    const noSuccessor = data.filter(l => l.indicados.length === 0 && l.nivelCarreira !== 'M1');
    const criticalRisk = data.filter(l => 
      (l.gptwENPS2025 !== null && l.gptwENPS2025 < 50) && 
      (l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80)
    );
    
    return {
      lowENPS,
      lowCR,
      highTurnover,
      noSuccessor,
      criticalRisk,
    };
  }, [data]);

  // Risk by diretoria
  const riskByDiretoria = useMemo(() => {
    return diretorias.map(d => {
      const lideres = data.filter(l => l.diretoria === d);
      const riscos = lideres.filter(l => 
        (l.gptwENPS2025 !== null && l.gptwENPS2025 < 50) || 
        (l.atingimentoCR2025 !== null && l.atingimentoCR2025 < 80) || 
        (l.percentDesligamentos2025 || 0) > 15
      );
      const semSucessor = lideres.filter(l => l.indicados.length === 0);
      
      return {
        diretoria: d.replace('Diretoria de ', '').replace('Diretoria ', ''),
        total: lideres.length,
        riscos: riscos.length,
        semSucessor: semSucessor.length,
        riskScore: lideres.length > 0 ? Math.round(((riscos.length + semSucessor.length) / (lideres.length * 2)) * 100) : 0,
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [data, diretorias]);

  // Top risk leaders
  const topRiskLeaders = useMemo(() => getHighRiskLeaders(), []);

  // Auto insights
  const insights = useMemo(() => {
    const items = [];
    
    // Critical areas
    const criticalAreas = riskByDiretoria.filter(d => d.riskScore > 50);
    if (criticalAreas.length > 0) {
      items.push({
        type: 'danger',
        title: 'Áreas Críticas',
        description: `${criticalAreas.map(a => a.diretoria).join(', ')} apresentam risco elevado (score > 50%)`,
        action: 'Implementar plano de ação urgente para desenvolvimento e retenção',
      });
    }

    // Succession gaps
    const totalSemSucessor = riskByDiretoria.reduce((acc, d) => acc + d.semSucessor, 0);
    if (totalSemSucessor > data.length * 0.3) {
      items.push({
        type: 'warning',
        title: 'Gap de Sucessão',
        description: `${totalSemSucessor} líderes (${Math.round((totalSemSucessor / data.length) * 100)}%) sem sucessores mapeados`,
        action: 'Acelerar programa de identificação e desenvolvimento de potenciais',
      });
    }

    // ENPS decline
    const enpsDecline = data.filter(l => 
      l.gptwENPS2024 !== null && l.gptwENPS2025 !== null && 
      l.gptwENPS2025 < l.gptwENPS2024
    ).length;
    if (enpsDecline > data.length * 0.4) {
      items.push({
        type: 'warning',
        title: 'Queda de Clima',
        description: `${enpsDecline} líderes tiveram queda no ENPS comparado a 2024`,
        action: 'Investigar causas e implementar ações de engajamento',
      });
    }

    // Top talents ready
    const readyNow = data.filter(l => 
      l.indicados.some(i => i.prontidao.toLowerCase().includes('imediato')) && 
      l.gptwENPS2025 !== null && l.gptwENPS2025 > 70
    );
    if (readyNow.length > 3) {
      items.push({
        type: 'success',
        title: 'Talentos Prontos',
        description: `${readyNow.length} líderes com indicados prontos para assumir posições estratégicas`,
        action: 'Considerar movimentações e promoções no próximo ciclo',
      });
    }

    return items;
  }, [data, riskByDiretoria]);

  const getRiskColor = (score: number) => {
    if (score >= 60) return 'bg-destructive/20 border-destructive/40 text-destructive';
    if (score >= 40) return 'bg-warning/20 border-warning/40 text-warning';
    return 'bg-success/20 border-success/40 text-success';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Análise de Riscos</h1>
        <p className="text-muted-foreground mt-1">Identificação e monitoramento de riscos de liderança</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Risco Crítico"
          value={riskAnalysis.criticalRisk.length}
          subtitle="ENPS + CR baixos"
          icon={ShieldAlert}
          variant="danger"
        />
        <KPICard
          title="ENPS Baixo"
          value={riskAnalysis.lowENPS.length}
          subtitle="< 50"
          icon={TrendingDown}
          variant="warning"
        />
        <KPICard
          title="CR Abaixo Meta"
          value={riskAnalysis.lowCR.length}
          subtitle="< 80%"
          icon={AlertTriangle}
          variant="warning"
        />
        <KPICard
          title="Alta Rotatividade"
          value={riskAnalysis.highTurnover.length}
          subtitle="> 15%"
          icon={UserMinus}
          variant="danger"
        />
        <KPICard
          title="Sem Indicados"
          value={riskAnalysis.noSuccessor.length}
          subtitle="não mapeado"
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Risk by Diretoria & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score by Diretoria */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4">Score de Risco por Diretoria</h3>
          <div className="space-y-3">
            {riskByDiretoria.map(d => (
              <div key={d.diretoria} className="p-3 rounded-lg border bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{d.diretoria}</span>
                  <span className={cn(
                    'text-sm font-bold px-2 py-0.5 rounded',
                    getRiskColor(d.riskScore)
                  )}>
                    {d.riskScore}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all',
                      d.riskScore >= 60 ? 'bg-destructive' : 
                      d.riskScore >= 40 ? 'bg-warning' : 'bg-success'
                    )}
                    style={{ width: `${d.riskScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{d.riscos} em risco</span>
                  <span>{d.semSucessor} sem indicados</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Insights */}
        <div className="chart-container">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Insights Automáticos para o CE
          </h3>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div 
                key={i}
                className={cn(
                  'p-4 rounded-lg border',
                  insight.type === 'danger' && 'bg-destructive/10 border-destructive/30',
                  insight.type === 'warning' && 'bg-warning/10 border-warning/30',
                  insight.type === 'success' && 'bg-success/10 border-success/30',
                )}
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'danger' && <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />}
                  {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />}
                  {insight.type === 'success' && <Lightbulb className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className={cn(
                      'font-medium text-sm',
                      insight.type === 'danger' && 'text-destructive',
                      insight.type === 'warning' && 'text-warning',
                      insight.type === 'success' && 'text-success',
                    )}>
                      {insight.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    <p className="text-xs text-foreground mt-2 font-medium">→ {insight.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Risk Leaders Table */}
      <div className="chart-container">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          Líderes que Precisam de Atenção Imediata
        </h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Líder</th>
                <th>Diretoria</th>
                <th>Cargo</th>
                <th>ENPS Time</th>
                <th>CR 2025</th>
                <th>Turnover</th>
                <th>Indicados</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topRiskLeaders.map((leader) => (
                <tr key={leader.id}>
                  <td className="font-medium">{leader.nome}</td>
                  <td className="text-muted-foreground text-xs">{leader.diretoria.replace('Diretoria de ', '')}</td>
                  <td className="text-muted-foreground text-xs">{leader.cargo}</td>
                  <td>
                    <span className={cn(
                      'status-badge',
                      leader.gptwENPS2025 >= 70 ? 'status-success' : 
                      leader.gptwENPS2025 >= 50 ? 'status-warning' : 'status-danger'
                    )}>
                      {leader.gptwENPS2025}
                    </span>
                  </td>
                  <td>
                    <span className={cn(
                      'status-badge',
                      leader.atingimentoCR2025 >= 100 ? 'status-success' : 
                      leader.atingimentoCR2025 >= 80 ? 'status-warning' : 'status-danger'
                    )}>
                      {leader.atingimentoCR2025?.toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    <span className={cn(
                      leader.percentDesligamentos2025 > 15 ? 'text-destructive font-medium' : ''
                    )}>
                      {leader.percentDesligamentos2025?.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    {leader.indicados.length > 0 ? (
                      <span className="status-badge status-success">Sim ({leader.indicados.length})</span>
                    ) : (
                      <span className="status-badge status-danger">Não</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {leader.gptwENPS2025 < 50 && (
                        <span className="w-2 h-2 rounded-full bg-destructive" title="ENPS baixo" />
                      )}
                      {leader.atingimentoCR2025 < 80 && (
                        <span className="w-2 h-2 rounded-full bg-warning" title="CR baixo" />
                      )}
                      {leader.percentDesligamentos2025 > 15 && (
                        <span className="w-2 h-2 rounded-full bg-destructive" title="Alta rotatividade" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
