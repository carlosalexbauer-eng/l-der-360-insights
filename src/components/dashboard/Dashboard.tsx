import { useState, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OverviewView } from './views/OverviewView';
import { PerformanceView } from './views/PerformanceView';
import { ClimaView } from './views/ClimaView';
import { PipelineView } from './views/PipelineView';
import { IndicadosView } from './views/IndicadosView';
import { RiscosView } from './views/RiscosView';
import { JobRotationView } from './views/JobRotationView';
import { leaders } from '@/data/mockData';

export function Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [filters, setFilters] = useState({
    diretoria: 'all',
    ano: '2025',
    nivelCarreira: 'all',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filter data based on filters
  const filteredData = useMemo(() => {
    return leaders.filter(l => {
      const matchesDiretoria = filters.diretoria === 'all' || l.diretoria === filters.diretoria;
      const matchesNivel = filters.nivelCarreira === 'all' || l.nivelCarreira === filters.nivelCarreira;
      return matchesDiretoria && matchesNivel;
    });
  }, [filters]);

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView data={filteredData} />;
      case 'performance':
        return <PerformanceView data={filteredData} />;
      case 'clima':
        return <ClimaView data={filteredData} />;
      case 'pipeline':
        return <PipelineView data={filteredData} />;
      case 'indicados':
        return <IndicadosView data={filteredData} />;
      case 'riscos':
        return <RiscosView data={filteredData} />;
      case 'jobrotation':
        return <JobRotationView data={filteredData} />;
      default:
        return <OverviewView data={filteredData} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header filters={filters} onFilterChange={handleFilterChange} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
