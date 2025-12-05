import { useMemo } from 'react';
import { KPICard } from '../KPICard';
import { Briefcase, CheckCircle, Clock, XCircle, ArrowRightLeft } from 'lucide-react';
import { Leader } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface JobRotationViewProps {
  data: Leader[];
}

export function JobRotationView({ data }: JobRotationViewProps) {
  // Leaders with job rotation
  const rotationData = useMemo(() => {
    return data.filter(l => l.jobRotation).map(l => ({
      ...l,
      rotation: l.jobRotation!,
    }));
  }, [data]);

  const stats = useMemo(() => ({
    total: rotationData.length,
    aprovados: rotationData.filter(r => r.rotation.status === 'Aprovado').length,
    emAnalise: rotationData.filter(r => r.rotation.status === 'Em análise').length,
    concluidos: rotationData.filter(r => r.rotation.status === 'Concluído').length,
    recusados: rotationData.filter(r => r.rotation.status === 'Recusado').length,
  }), [rotationData]);

  // By status
  const byStatus = [
    { status: 'Aprovado', count: stats.aprovados, color: 'success' },
    { status: 'Em análise', count: stats.emAnalise, color: 'warning' },
    { status: 'Concluído', count: stats.concluidos, color: 'primary' },
    { status: 'Recusado', count: stats.recusados, color: 'danger' },
  ];

  // Candidates by nivel
  const byNivel = useMemo(() => {
    const counts: Record<string, number> = {};
    rotationData.forEach(l => {
      counts[l.nivelCarreira] = (counts[l.nivelCarreira] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([nivel, count]) => ({ nivel, count }))
      .sort((a, b) => b.count - a.count);
  }, [rotationData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aprovado': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Em análise': return <Clock className="w-4 h-4 text-warning" />;
      case 'Concluído': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'Recusado': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado': return 'status-success';
      case 'Em análise': return 'status-warning';
      case 'Concluído': return 'bg-primary/20 text-primary';
      case 'Recusado': return 'status-danger';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  // Calculate average time in position
  const avgTimeInPosition = rotationData.length > 0 
    ? rotationData.reduce((acc, l) => acc + (l.rotation.tempoNoCargo || 0), 0) / rotationData.length 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Job Rotation</h1>
        <p className="text-muted-foreground mt-1">Movimentações e indicações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Indicações"
          value={stats.total}
          icon={ArrowRightLeft}
        />
        <KPICard
          title="Aprovados"
          value={stats.aprovados}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Em Análise"
          value={stats.emAnalise}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Concluídos"
          value={stats.concluidos}
          icon={Briefcase}
        />
        <KPICard
          title="Recusados"
          value={stats.recusados}
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rotation Table */}
        <div className="lg:col-span-2 chart-container">
          <h3 className="font-display font-semibold mb-4">Indicações para Job Rotation</h3>
          {rotationData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma indicação de Job Rotation encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
              <table className="data-table">
                <thead className="sticky top-0 bg-card">
                  <tr>
                    <th>Líder</th>
                    <th>Cargo Atual</th>
                    <th>Nível</th>
                    <th>Tempo no Cargo</th>
                    <th>Status</th>
                    <th>ENPS</th>
                    <th>CR</th>
                  </tr>
                </thead>
                <tbody>
                  {rotationData.map((leader) => (
                    <tr key={leader.id}>
                      <td>
                        <div>
                          <span className="font-medium">{leader.nome}</span>
                          <span className="block text-xs text-muted-foreground">{leader.diretoria.replace('Diretoria de ', '')}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground text-sm">{leader.cargo}</td>
                      <td>
                        <span className="status-badge bg-secondary text-foreground">
                          {leader.nivelCarreira}
                        </span>
                      </td>
                      <td>{leader.rotation.tempoNoCargo?.toFixed(1) || '-'} anos</td>
                      <td>
                        <span className={cn('status-badge', getStatusBadge(leader.rotation.status))}>
                          {leader.rotation.status || 'Pendente'}
                        </span>
                      </td>
                      <td className={leader.gptwENPS2025 !== null && leader.gptwENPS2025 < 50 ? 'text-destructive' : ''}>
                        {leader.gptwENPS2025 ?? '-'}
                      </td>
                      <td>
                        <span className={cn(
                          leader.atingimentoCR2025 !== null && leader.atingimentoCR2025 >= 100 ? 'text-success' : 
                          leader.atingimentoCR2025 !== null && leader.atingimentoCR2025 >= 80 ? '' : 'text-destructive'
                        )}>
                          {leader.atingimentoCR2025?.toFixed(0) ?? '-'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          {/* Status Distribution */}
          <div className="chart-container">
            <h3 className="font-display font-semibold mb-4">Por Status</h3>
            <div className="space-y-3">
              {byStatus.map(s => (
                <div key={s.status} className="flex items-center gap-3">
                  {getStatusIcon(s.status)}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s.status}</span>
                      <span className="font-medium">{s.count}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full',
                          s.color === 'success' && 'bg-success',
                          s.color === 'warning' && 'bg-warning',
                          s.color === 'primary' && 'bg-primary',
                          s.color === 'danger' && 'bg-destructive',
                        )}
                        style={{ width: `${stats.total > 0 ? (s.count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Nivel */}
          <div className="chart-container">
            <h3 className="font-display font-semibold mb-4">Por Nível de Carreira</h3>
            <div className="space-y-3">
              {byNivel.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
              ) : (
                byNivel.map(n => (
                  <div key={n.nivel} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                    <span className="text-sm">{n.nivel}</span>
                    <span className="text-lg font-display font-bold text-primary">{n.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Avg Time in Position */}
          <div className="chart-container">
            <h3 className="font-display font-semibold mb-4">Tempo Médio no Cargo</h3>
            <div className="text-center py-4">
              <span className="text-4xl font-display font-bold text-primary">
                {avgTimeInPosition.toFixed(1)}
              </span>
              <span className="text-muted-foreground ml-2">anos</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Média entre candidatos a Job Rotation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
