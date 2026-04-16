import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { LeadershipParams, DEFAULT_PARAMS } from '@/lib/leadership-scoring';

interface Props {
  params: LeadershipParams;
  onChange: (params: LeadershipParams) => void;
}

export function LeadershipSettings({ params, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<LeadershipParams>(params);

  const handleOpen = (o: boolean) => {
    if (o) setLocal(params);
    setOpen(o);
  };

  const handleSave = () => {
    onChange(local);
    setOpen(false);
  };

  const handleReset = () => {
    setLocal(DEFAULT_PARAMS);
  };

  const update = (key: keyof LeadershipParams, value: string) => {
    setLocal(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const fields: { key: keyof LeadershipParams; label: string; desc: string }[] = [
    { key: 'crQ1', label: 'CR Q1', desc: 'Quartil 1 de CR (abaixo = baixo)' },
    { key: 'crQ3', label: 'CR Q3', desc: 'Quartil 3 de CR (acima = alto)' },
    { key: 'moodsQ1', label: 'MOODS Q1', desc: 'Quartil 1 de eNPS (abaixo = baixo)' },
    { key: 'moodsQ3', label: 'MOODS Q3', desc: 'Quartil 3 de eNPS (acima = alto)' },
    { key: 'feedbackQ3', label: 'Feedback Q3', desc: '% de feedbacks (referência)' },
    { key: 'competenciasQ1', label: 'Competências Q1', desc: '% avaliações concluídas (referência)' },
    { key: 'quedaCR', label: 'Queda CR', desc: 'Delta CR considerado queda relevante' },
    { key: 'quedaMOODS', label: 'Queda MOODS', desc: 'Delta MOODS considerado queda relevante' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Settings className="w-3.5 h-3.5" />
          Parâmetros
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Parâmetros do Painel</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {fields.map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs font-medium">{f.label}</Label>
              <Input
                type="number"
                step="0.1"
                value={local[f.key]}
                onChange={e => update(f.key, e.target.value)}
                className="h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
            Restaurar padrões
          </Button>
          <Button size="sm" onClick={handleSave} className="text-xs">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
