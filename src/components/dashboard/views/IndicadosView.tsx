import { useMemo, useState } from 'react';
import { KPICard } from '../KPICard';
import { UserCheck, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { Leader, Indicado } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface IndicadosViewProps {
  data: Leader[];
}

interface IndicadoWithLeader extends Indicado {
  liderNome: string;
  liderDiretoria: string;
  liderId: string;
}

export function IndicadosView({ data }: IndicadosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProntidao, setFilterProntidao] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Flatten all indicados with leader info
  const allIndicados = useMemo((): IndicadoWithLeader[] => {
    const indicados: IndicadoWithLeader[] = [];
    data.forEach(l => {
      l.indicados.forEach(ind => {
        indicados.push({
          ...ind,
          liderNome: l.nome,
          liderDiretoria: l.diretoria,
          liderId: l.id,
        });
      });
    });
    return indicados;
  }, [data]);

  // Filter indicados
  const filteredIndicados = useMemo(() => {
    return allIndicados.filter(ind => {
      const matchesSearch = ind.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.liderNome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProntidao = filterProntidao === 'all' || ind.prontidao.toLowerCase().includes(filterProntidao.toLowerCase());
      const matchesStatus = filterStatus === 'all' || ind.status === filterStatus;
      return matchesSearch && matchesProntidao && matchesStatus;
    });
  }, [allIndicados, searchTerm, filterProntidao, filterStatus]);

  const stats = useMemo(() => ({
    total: allIndicados.length,
    ativos: allIndicados.filter(i => i.status === 'Ativo').length,
    readyNow: allIndicados.filter(i => i.prontidao.toLowerCase().includes('imediato')).length,
    readySoon: allIndicados.filter(i => i.prontidao.toLowerCase().includes('1 a 2')).length,
    lideresComIndicados: data.filter(l => l.indicados.length > 0).length,
  }), [allIndicados, data]);

  // Indicados by nível de carreira
  const byNivel = useMemo(() => {
    const counts: Record<string, number> = {};
    allIndicados.forEach(i => {
      counts[i.nivelCarreira] = (counts[i.nivelCarreira] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([nivel, count]) => ({ nivel, count }))
      .sort((a, b) => b.count - a.count);
  }, [allIndicados]);

  const getProntidaoColor = (prontidao: string) => {
    if (prontidao.toLowerCase().includes('imediato')) return 'status-success';
    if (prontidao.toLowerCase().includes('1 a 2')) return 'status-warning';
    return 'status-danger';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">Indicados para Sucessão</h1>
        <p className="text-muted-foreground mt-1">Gestão de potenciais sucessores</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Indicados"
          value={stats.total}
          icon={UserCheck}
        />
        <KPICard
          title="Ativos"
          value={stats.ativos}
          subtitle={`${stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}%`}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Imediato"
          value={stats.readyNow}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="1 a 2 anos"
          value={stats.readySoon}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Líderes c/ Indicados"
          value={stats.lideresComIndicados}
          subtitle={`de ${data.length}`}
          icon={UserCheck}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar indicado ou líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <select
          value={filterProntidao}
          onChange={(e) => setFilterProntidao(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas Prontidões</option>
          <option value="imediato">Imediato</option>
          <option value="1 a 2">1 a 2 anos</option>
          <option value="2 a 3">2 a 3 anos</option>
          <option value="3 a 4">3 a 4 anos</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos Status</option>
          <option value="Ativo">Ativos</option>
          <option value="Inativo">Inativos</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicados Table */}
        <div className="lg:col-span-2 chart-container">
          <h3 className="font-display font-semibold mb-4">Lista de Indicados ({filteredIndicados.length})</h3>
          <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
            <table className="data-table">
              <thead className="sticky top-0 bg-card">
                <tr>
                  <th>Indicado</th>
                  <th>Cargo</th>
                  <th>Líder</th>
                  <th>Status</th>
                  <th>Prontidão</th>
                  <th>CR 2024</th>
                </tr>
              </thead>
              <tbody>
                {filteredIndicados.map((ind, i) => (
                  <tr key={`${ind.liderId}-${ind.nome}-${i}`}>
                    <td className="font-medium">{ind.nome}</td>
                    <td className="text-muted-foreground text-xs">{ind.cargoAtual}</td>
                    <td>
                      <div>
                        <span className="text-sm">{ind.liderNome}</span>
                        <span className="block text-xs text-muted-foreground">{ind.liderDiretoria.replace('Diretoria de ', '')}</span>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        'status-badge',
                        ind.status === 'Ativo' ? 'status-success' : 'status-danger'
                      )}>
                        {ind.status}
                      </span>
                    </td>
                    <td>
                      <span className={cn('status-badge', getProntidaoColor(ind.prontidao))}>
                        {ind.prontidao}
                      </span>
                    </td>
                    <td>
                      {ind.atingimentoCR2024 !== null && ind.atingimentoCR2024 !== undefined ? (
                        <span className={cn(
                          (ind.atingimentoCR2024 || 0) >= 100 ? 'text-success' : 
                          (ind.atingimentoCR2024 || 0) >= 80 ? 'text-warning' : 'text-destructive'
                        )}>
                          {ind.atingimentoCR2024?.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          {/* By Nível */}
          <div className="chart-container">
            <h3 className="font-display font-semibold mb-4">Por Nível de Carreira</h3>
            <div className="space-y-3">
              {byNivel.map(n => (
                <div key={n.nivel} className="flex items-center justify-between">
                  <span className="text-sm">{n.nivel}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${stats.total > 0 ? (n.count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{n.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prontidão Distribution */}
          <div className="chart-container">
            <h3 className="font-display font-semibold mb-4">Distribuição de Prontidão</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Imediato</span>
                    <span className="font-medium">{stats.readyNow}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.readyNow / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>1 a 2 anos</span>
                    <span className="font-medium">{stats.readySoon}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-warning rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.readySoon / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>2+ anos</span>
                    <span className="font-medium">{stats.total - stats.readyNow - stats.readySoon}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-destructive rounded-full"
                      style={{ width: `${stats.total > 0 ? ((stats.total - stats.readyNow - stats.readySoon) / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
