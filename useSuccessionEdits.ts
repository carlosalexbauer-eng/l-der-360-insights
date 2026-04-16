import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL = '__all__';

interface Props {
  niveis: string[];
  selected: string;
  onChange: (selected: string) => void;
}

export function NivelFilter({ niveis, selected, onChange }: Props) {
  return (
    <Select value={selected} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[220px] text-xs bg-card">
        <SelectValue placeholder="Nível de carreira" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Todos os Níveis</SelectItem>
        {niveis.map(n => (
          <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
