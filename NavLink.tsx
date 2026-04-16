import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { FilterX } from 'lucide-react';
import { SelectNative } from '@/components/ui/select-native';
import { useMemo, useState, useCallback } from 'react';
import { Leader } from '@/data/leaders';
import { useLeadersData } from '@/hooks/useLeadersData';
import { Button } from '@/components/ui/button';

const ALL = '__all__';

export interface DashboardFilters {
  diretoria: string;
  nivel: string;
  ligacaoCE: string;
}

export interface GlobalFilterControls {
  diretoria: string;
  setDiretoria: (v: string) => void;
  nivel: string;
  setNivel: (v: string) => void;
  ligacaoCE: string;
  setLigacaoCE: (v: string) => void;
  diretorias: string[];
  niveis: string[];
  hasActiveGlobalFilter: boolean;
  clearGlobalFilters: () => void;
}

interface DashboardLayoutProps {
  hideHeaderFilters?: boolean;
  children: (props: {
    filtered: Leader[];
    allLeaders: Leader[];
    allDbLeaders: Leader[];
    filters: DashboardFilters;
    globalFilterControls: GlobalFilterControls;
  }) => React.ReactNode;
}

export function DashboardLayout({ children, hideHeaderFilters = false }: DashboardLayoutProps) {
  const { leaders: dbLeaders } = useLeadersData();
  const [diretoria, setDiretoria] = useState(ALL);
  const [nivel, setNivel] = useState(ALL);
  const [ligacaoCE, setLigacaoCE] = useState(ALL);

  const allLeaders = useMemo(() => (dbLeaders as Leader[]).filter(l => l.situacao === 'Ativo'), [dbLeaders]);

  const diretorias = useMemo(() => [...new Set(allLeaders.map(l => l.diretoria).filter(Boolean))].sort() as string[], [allLeaders]);
  const niveis = useMemo(() => [...new Set(allLeaders.map(l => l.nivelCarreira).filter(Boolean))].sort() as string[], [allLeaders]);

  const hasActiveFilter = diretoria !== ALL || nivel !== ALL || ligacaoCE !== ALL;

  const clearFilters = useCallback(() => {
    setDiretoria(ALL);
    setNivel(ALL);
    setLigacaoCE(ALL);
  }, []);

  const filtered = useMemo(() => {
    return allLeaders.filter(l => {
      if (diretoria !== ALL && l.diretoria !== diretoria) return false;
      if (nivel !== ALL && l.nivelCarreira !== nivel) return false;
      if (ligacaoCE !== ALL && l.ligacaoCE !== ligacaoCE) return false;
      return true;
    });
  }, [allLeaders, diretoria, nivel, ligacaoCE]);

  const globalFilterControls: GlobalFilterControls = {
    diretoria, setDiretoria,
    nivel, setNivel,
    ligacaoCE, setLigacaoCE,
    diretorias, niveis,
    hasActiveGlobalFilter: hasActiveFilter,
    clearGlobalFilters: clearFilters,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center border-b border-border bg-card px-6 gap-3 sticky top-0 z-50">
            <SidebarTrigger />
            {!hideHeaderFilters && (
              <div className="flex items-center gap-3 flex-1 flex-nowrap overflow-x-auto">
                {hasActiveFilter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={clearFilters}
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    Limpar filtros
                  </Button>
                )}
                <SelectNative
                  value={diretoria}
                  onChange={e => setDiretoria(e.target.value)}
                  options={diretorias.map(d => ({ value: d, label: d }))}
                  placeholder="Diretorias"
                />
                <SelectNative
                  value={nivel}
                  onChange={e => setNivel(e.target.value)}
                  options={niveis.map(n => ({ value: n, label: n }))}
                  placeholder="Níveis de Carreira"
                />
                <SelectNative
                  value={ligacaoCE}
                  onChange={e => setLigacaoCE(e.target.value)}
                  options={['CE', 'Direto', 'Indireto'].map(v => ({ value: v, label: v }))}
                  placeholder="Direto ou Indireto do CE"
                />
              </div>
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 overflow-auto">
            {children({ filtered, allLeaders, allDbLeaders: dbLeaders as Leader[], filters: { diretoria, nivel, ligacaoCE }, globalFilterControls })}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
