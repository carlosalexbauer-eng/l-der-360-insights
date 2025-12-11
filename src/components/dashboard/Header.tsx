import { Bell, Search, Filter, LogOut, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDiretorias, getNiveisCarreira } from '@/data/mockData';
import { AdminUpload } from './AdminUpload';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  filters: {
    diretoria: string;
    ano: string;
    nivelCarreira: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function Header({ filters, onFilterChange }: HeaderProps) {
  const diretorias = getDiretorias();
  const niveisCarreira = getNiveisCarreira();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar líder, diretoria..."
            className="w-80 pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        
        <Select value={filters.diretoria} onValueChange={(v) => onFilterChange('diretoria', v)}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="Diretoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {diretorias.map((d) => (
              <SelectItem key={d} value={d}>{d.replace('Diretoria de ', '').replace('Diretoria ', '')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.ano} onValueChange={(v) => onFilterChange('ano', v)}>
          <SelectTrigger className="w-28 bg-secondary border-border">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.nivelCarreira} onValueChange={(v) => onFilterChange('nivelCarreira', v)}>
          <SelectTrigger className="w-36 bg-secondary border-border">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {niveisCarreira.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Admin Upload */}
        <AdminUpload />

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User Menu */}
        {user ? (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <span className="text-xs text-muted-foreground max-w-24 truncate">
              {user.email}
            </span>
            {isAdmin && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                Admin
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="ml-2"
          >
            <User className="w-4 h-4 mr-1" />
            Entrar
          </Button>
        )}
      </div>
    </header>
  );
}
