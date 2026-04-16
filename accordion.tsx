import { useState, useRef, useEffect } from 'react';
import { Leader } from '@/data/leaders';
import { Input } from '@/components/ui/input';

interface Props {
  allLeaders: Leader[];
  value: string;
  excludeNames: string[];
  onSelect: (leader: Leader) => void;
}

export function SuccessorAutocomplete({ allLeaders, value, excludeNames, onSelect }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = allLeaders.filter(l => {
    if (excludeNames.includes(l.nome)) return false;
    if (!query.trim()) return true;
    return l.nome.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 20);

  return (
    <div ref={ref} className="relative">
      <Input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar líder..."
        className="h-8 text-xs"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-[70vh] overflow-y-auto min-w-[280px]">
          {filtered.map(l => (
            <button
              key={l.cadastro || l.nome}
              type="button"
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => { onSelect(l); setQuery(l.nome); setOpen(false); }}
            >
              <span className="font-medium">{l.nome}</span>
              <span className="text-muted-foreground ml-2">— {l.cargo}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
