import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  GitBranch,
  UserCheck,
  AlertTriangle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'clima', label: 'Clima', icon: Users },
  { id: 'pipeline', label: 'Pipeline Sucessão', icon: GitBranch },
  { id: 'indicados', label: 'Indicados', icon: UserCheck },
  { id: 'riscos', label: 'Riscos', icon: AlertTriangle },
  { id: 'jobrotation', label: 'Job Rotation', icon: Briefcase },
  { id: 'admin', label: 'Admin', icon: Settings },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-lg">S</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-semibold text-foreground">Senior</h1>
              <p className="text-xs text-muted-foreground">Leadership Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
                isActive && 'text-sidebar-primary bg-sidebar-primary/10 border-l-2 border-sidebar-primary'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
              {!collapsed && (
                <span className="text-sm font-medium animate-fade-in">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
