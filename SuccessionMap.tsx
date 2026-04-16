import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Leader } from '@/data/leaders';
import { useLeadersData } from '@/hooks/useLeadersData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectNative } from '@/components/ui/select-native';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { normalizeProntidao, getProntidaoOrder } from '@/lib/scoring';
import { FilterX, Users, UserCheck, Clock, Pencil, Save, XCircle, Plus, Download, AlertTriangle, Search, MessageSquare, Award, Loader2, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { NivelFilter } from '@/components/succession-map/NivelFilter';
import { SuccessorEditBlock } from '@/components/succession-map/SuccessorEditBlock';
import { useSuccessionEdits } from '@/components/succession-map/useSuccessionEdits';
import { EditableSuccessor } from '@/components/succession-map/types';
import { exportSuccessionReport } from '@/components/succession-map/exportSuccession';
import { exportSuccessionChanges } from '@/components/succession-map/exportSuccessionChanges';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

function MultiSelectFilter({ selected, onChange, options, placeholder }: {
  selected: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return options.filter(name => {
      const lower = name.toLowerCase();
      return terms.every(t => lower.includes(t));
    });
  }, [options, query]);

  const displayText = selected.length === 0 ? placeholder : `${selected.length} selecionado${selected.length > 1 ? 's' : ''}`;

  const toggleItem = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(n => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-9 min-w-[200px] rounded-lg border border-border bg-card px-3 pl-8 text-sm text-foreground text-left outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 truncate"
        >
          {displayText}
        </button>
      </div>
      {open && (
        <div className="absolute z-[100] top-full left-0 mt-1 bg-popover border rounded-md shadow-lg max-h-[70vh] overflow-hidden flex flex-col min-w-[320px] w-max">
          <div className="p-2 border-b shrink-0">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="h-7 text-xs"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {selected.length > 0 && (
              <button
                type="button"
                className="w-full text-left px-3 py-1.5 text-xs text-destructive hover:bg-accent transition-colors"
                onClick={() => { onChange([]); }}
              >
                Limpar seleção
              </button>
            )}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">Nenhum resultado</p>
            )}
            {filtered.slice(0, 50).map(name => (
              <button
                key={name}
                type="button"
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                onClick={() => toggleItem(name)}
              >
                <Checkbox checked={selected.includes(name)} className="pointer-events-none h-3.5 w-3.5" />
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ALL = '__all__';

function calcTempoCargo(dataLider: string | null): string {
  if (!dataLider) return '—';
  const start = new Date(dataLider);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (months < 0) return '< 1m';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem}m`;
  if (rem === 0) return `${years}a`;
  return `${years}a ${rem}m`;
}

function parseExcelOrStringDate(dateStr: string): Date | null {
  const num = Number(dateStr);
  if (!isNaN(num) && num > 30000 && num < 100000) {
    const excelEpoch = new Date(1899, 11, 30);
    const ms = excelEpoch.getTime() + num * 86400000;
    return new Date(ms);
  }
  const brMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const d = new Date(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1]));
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function calcTempoCargoFaixa(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const start = parseExcelOrStringDate(String(dateStr).trim());
  if (!start) return '—';
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (months < 0) return '—';
  const years = months / 12;
  if (years <= 1) return 'Até 1 ano';
  if (years <= 2) return 'Entre 1 e 2 anos';
  if (years <= 3) return 'Entre 2 e 3 anos';
  if (years <= 5) return 'Entre 3 e 5 anos';
  if (years <= 10) return 'Entre 6 e 10 anos';
  return 'Entre 10 e 15 anos';
}

function calcTempoCargoSucessor(tempoNoCargo: string | null | undefined): string {
  if (!tempoNoCargo) return '—';
  const t = tempoNoCargo.trim();
  if (t.toLowerCase().includes('ano') || t.toLowerCase().includes('mês') || t.toLowerCase().includes('mes')) return t;
  const d = new Date(t);
  if (!isNaN(d.getTime())) return calcTempoCargoFaixa(t);
  return t || '—';
}

function getEnpsColor(enps: number | null, year?: number): string {
  if (enps === null) return '';
  const rounded = Math.round(enps);
  const greenThreshold = year === 2026 ? 75 : 77;
  const yellowFloor = 70;
  if (rounded >= greenThreshold) return 'bg-[#b5e6a2]/30 text-[#3a7a2a]';
  if (rounded >= yellowFloor) return 'bg-[#ffff00]/25 text-[#7a6e00]';
  return 'bg-[#ff7c80]/25 text-[#a11a1d]';
}

function getCrColor(cr: number | null): string {
  if (cr === null) return '';
  const rounded = Math.round(cr);
  if (rounded > 100) return 'bg-[#61cbf3]/25 text-[#1a6e8a]';
  if (rounded >= 96) return 'bg-[#b5e6a2]/30 text-[#3a7a2a]';
  if (rounded >= 91) return 'bg-[#ffff00]/25 text-[#7a6e00]';
  return 'bg-[#ff7c80]/25 text-[#a11a1d]';
}

function getQuadranteShort(q: string | null): string {
  if (!q) return '—';
  const lower = q.toLowerCase();
  if (lower.includes('diferenciado')) return 'Q6';
  if (lower.includes('acima do esperado') && lower.includes('alto potencial')) return 'Q9';
  if (lower.includes('acima do esperado')) return 'Q3';
  if (lower.includes('alto potencial') && lower.includes('esperado') && !lower.includes('abaixo')) return 'Q8';
  if (lower.includes('alto potencial') && lower.includes('abaixo')) return 'Q7';
  if (lower.includes('adequado')) return 'Q5';
  if (lower.includes('esperado') && !lower.includes('abaixo') && !lower.includes('acima') && !lower.includes('alto')) return 'Q2';
  if (lower.includes('insuficiente')) return 'Q1';
  if (lower.includes('abaixo do esperado') && !lower.includes('alto')) return 'Q4';
  return '—';
}

function getQuadranteColor(q: string | null): string {
  const num = getQuadranteShort(q);
  if (['Q9', 'Q8', 'Q6'].includes(num)) return 'bg-[#61cbf3]/25 text-[#1a6e8a]';
  if (['Q4', 'Q5', 'Q7'].includes(num)) return 'bg-[#b5e6a2]/30 text-[#3a7a2a]';
  if (['Q3'].includes(num)) return 'bg-[#ffff00]/25 text-[#7a6e00]';
  if (['Q1', 'Q2'].includes(num)) return 'bg-[#ff7c80]/25 text-[#a11a1d]';
  return '';
}

function getProntidaoColor(p: string | null): string {
  const norm = normalizeProntidao(p);
  if (norm === 'Imediato') return 'bg-senior-green-3 text-foreground';
  if (norm === '1-2 anos') return 'bg-[hsl(var(--senior-orange))] text-primary-foreground';
  if (norm === '2-3 anos') return 'bg-[hsl(var(--senior-yellow))] text-foreground';
  if (norm === '3-4 anos') return 'bg-[hsl(var(--senior-gray))] text-muted-foreground';
  if (norm === 'Job Rotation') return 'bg-[hsl(var(--senior-purple))] text-primary-foreground';
  if (norm === 'Acompanhamento') return 'bg-[hsl(var(--senior-turquoise))] text-foreground';
  return 'bg-muted text-muted-foreground';
}

function SkeletonCard() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-1" />
        <Skeleton className="h-3 w-2/3" />
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="overflow-hidden rounded-md border border-border/60">
          <div className="space-y-1 p-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <div className="border rounded-md p-2 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-full" />
      </CardContent>
    </Card>
  );
}

const NON_LEADER_LEVELS = ['P1','P2','P3','P4','S1','S2','S3','S4','T2','T3','U1','U2'];

function isNonLeaderLevel(nivel: string | null | undefined): boolean {
  if (!nivel) return false;
  return NON_LEADER_LEVELS.includes(nivel.toUpperCase());
}

function isValidSuccessorName(name: string | null | undefined): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (trimmed.toUpperCase() === 'SEM INDICAÇÃO' || trimmed === '**') return false;
  return true;
}

function isSuccessorInactive(s: EditableSuccessor): boolean {
  if (!s.status) return false;
  return s.status.toLowerCase().includes('inativo') || s.status.toLowerCase().includes('desligado');
}

function IndicatorTable({ year, quadrante, cr, enps }: { year: number; quadrante: string | null; cr: number | null; enps: number | null }) {
  const crPercent = cr !== null ? Math.round(cr * 100) : null;
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-1.5 px-2 text-xs font-medium text-foreground">{year}</td>
      <td className={`py-1.5 px-2 text-xs font-semibold text-center rounded ${getQuadranteColor(quadrante)}`}>
        {getQuadranteShort(quadrante)}
      </td>
      <td className={`py-1.5 px-2 text-xs font-semibold text-center rounded ${getCrColor(crPercent)}`}>
        {crPercent !== null ? `${crPercent}%` : '**'}
      </td>
      <td className={`py-1.5 px-2 text-xs font-semibold text-center rounded ${getEnpsColor(enps, year)}`}>
        {enps !== null ? Math.round(enps) : '—'}
      </td>
    </tr>
  );
}

function findSuccessorIndicators(s: EditableSuccessor, allLeaders: Leader[]): {
  cr2026: number | null; cr2025: number | null;
  enps2026: number | null; enps2025: number | null;
  ultimoQuadrante: string | null; penultimoQuadrante: string | null;
} {
  if (!isNonLeaderLevel(s.nivelCarreira)) {
    const leaderRecord = allLeaders.find(l => l.nome.toLowerCase() === (s.nome || '').toLowerCase());
    if (leaderRecord) {
      return {
        cr2026: leaderRecord.cr2026 ?? null, cr2025: leaderRecord.cr2025,
        enps2026: leaderRecord.moods2026 ?? null, enps2025: leaderRecord.moods2025 ?? null,
        ultimoQuadrante: leaderRecord.ultimoQuadrante,
        penultimoQuadrante: leaderRecord.penultimoQuadrante ?? null,
      };
    }
    return {
      cr2026: (s as any).cr2026 ?? null, cr2025: (s as any).cr2025 ?? null,
      enps2026: (s as any).enps2026 ?? null, enps2025: s.enps2025 ?? null,
      ultimoQuadrante: s.ultimoQuadrante ?? null, penultimoQuadrante: (s as any).penultimoQuadrante ?? null,
    };
  }
  const liName = (s as any).liderImediato;
  if (!liName) return { cr2026: null, cr2025: null, enps2026: (s as any).enps2026 ?? null, enps2025: s.enps2025, ultimoQuadrante: s.ultimoQuadrante, penultimoQuadrante: (s as any).penultimoQuadrante ?? null };
  const immLeader = allLeaders.find(l => l.nome.toLowerCase() === liName.toLowerCase());
  return {
    cr2026: immLeader?.cr2026 ?? null, cr2025: immLeader?.cr2025 ?? null,
    enps2026: (s as any).enps2026 ?? null, enps2025: s.enps2025,
    ultimoQuadrante: s.ultimoQuadrante, penultimoQuadrante: (s as any).penultimoQuadrante ?? null,
  };
}

function resolveEffectiveProntidao(s: EditableSuccessor, leaderNivel: string | null | undefined): string | null {
  if (!isNonLeaderLevel(s.nivelCarreira) && s.nivelCarreira && leaderNivel &&
      s.nivelCarreira.toUpperCase() === leaderNivel.toUpperCase()) {
    return 'Job Rotation';
  }
  return s.prontidao;
}

function getLeaderDisplayStatus(leader: Leader): 'Ativo' | 'Inativo' | 'Atenção' {
  const sit = leader.situacao?.toLowerCase() ?? '';
  if (sit.includes('inativo') || sit.includes('desligado')) return 'Inativo';
  if (sit.includes('atenção') || sit.includes('atencao') || sit.includes('atencion')) return 'Atenção';
  return 'Ativo';
}

type CalibrationRecord = {
  id: string;
  successor_name: string;
  leader_name: string;
  calibrated_by_name: string;
  created_at: string;
};

function CalibrationButton({ successorName, leaderName, profile }: {
  successorName: string;
  leaderName: string;
  profile: any;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<CalibrationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);

  useEffect(() => {
    supabase
      .from('calibration_history')
      .select('id')
      .eq('successor_name', successorName)
      .eq('leader_name', leaderName)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setIsCalibrated(true);
      });
  }, [successorName, leaderName]);

  const loadHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('calibration_history')
      .select('*')
      .eq('successor_name', successorName)
      .eq('leader_name', leaderName)
      .order('created_at', { ascending: false });
    setHistory((data as CalibrationRecord[]) || []);
    setLoading(false);
    setShowHistory(true);
  };

  const handleCalibrate = async () => {
    if (!window.confirm(`Confirmar calibração do sucessor "${successorName}"?`)) return;
    setCalibrating(true);
    const { error } = await supabase.from('calibration_history').insert({
      successor_name: successorName,
      leader_name: leaderName,
      calibrated_by_user_id: profile.auth_id,
      calibrated_by_name: profile.nome,
    } as any);
    if (error) {
      toast.error('Erro ao registrar calibração');
    } else {
      toast.success('Calibração registrada!');
      setIsCalibrated(true);
    }
    setCalibrating(false);
  };

  return (
    <>
      <div className="flex items-center gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCalibrate}
                disabled={calibrating}
                className={`p-0.5 rounded transition-colors ${isCalibrated ? 'text-[hsl(172,82%,33%)]' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Award className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isCalibrated ? 'Calibrado — clique para nova calibração' : 'Calibrar sucessor'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={loadHistory}
                className="p-0.5 rounded text-muted-foreground hover:text-primary transition-colors"
              >
                <Clock className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Histórico de calibração
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Histórico de Calibração — {successorName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-64">
            {loading ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Carregando...</p>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma calibração registrada</p>
            ) : (
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="border rounded-md p-2 text-xs">
                    <p className="font-medium">{h.calibrated_by_name}</p>
                    <p className="text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString('pt-BR')} às {new Date(h.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AtencaoPopover({ comentario }: { comentario?: string | null }) {
  if (!comentario?.trim()) {
    return (
      <Badge className="text-[9px] px-1.5 py-0 h-4 gap-0.5 bg-[hsl(var(--senior-yellow))]/20 text-[hsl(45,100%,30%)]">
        <AlertTriangle className="w-2.5 h-2.5" />
        Atenção
      </Badge>
    );
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-transparent px-1.5 py-0 text-[9px] font-semibold h-4 gap-0.5 bg-[hsl(var(--senior-yellow))]/20 text-[hsl(45,100%,30%)] cursor-pointer hover:bg-[hsl(var(--senior-yellow))]/30 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <AlertTriangle className="w-2.5 h-2.5" />
          Atenção
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="max-w-xs text-xs p-3">
        {comentario}
      </PopoverContent>
    </Popover>
  );
}

function LeaderCard({ leader, allLeaders, getSuccessors, saveSuccessors, profile }: {
  leader: Leader;
  allLeaders: Leader[];
  getSuccessors: (l: Leader) => EditableSuccessor[];
  saveSuccessors: (l: Leader, s: EditableSuccessor[]) => void | Promise<void>;
  profile: any;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableSuccessor[]>([]);
  const [expandedComment, setExpandedComment] = useState<number | null>(null);

  const currentSuccessors = getSuccessors(leader);
  const validSuccessors = currentSuccessors.filter(s => isValidSuccessorName(s.nome));
  const resolvedSuccessors = validSuccessors.map(s => ({
    ...s,
    prontidao: resolveEffectiveProntidao(s, leader.nivelCarreira),
  }));
  const sortedSuccessors = [...resolvedSuccessors].sort((a, b) => getProntidaoOrder(a.prontidao) - getProntidaoOrder(b.prontidao));
  const nonJobRotationSuccessors = sortedSuccessors.filter(s => normalizeProntidao(s.prontidao) !== 'Job Rotation');
  const displaySuccessorCount = nonJobRotationSuccessors.length;

  const displayStatus = getLeaderDisplayStatus(leader);
  const leaderInactive = displayStatus === 'Inativo';
  const leaderAtencao = displayStatus === 'Atenção';

  const canEdit = profile && (profile.role === 'master' || profile.role === 'admin' || profile.role === 'bp');

  const startEdit = () => {
    setDraft(sortedSuccessors.length > 0 ? sortedSuccessors.map(s => ({ ...s })) : []);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft([]);
    setEditing(false);
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const resolvedDraft = draft.map(s => ({
      ...s,
      prontidao: resolveEffectiveProntidao(s, leader.nivelCarreira),
    }));
    for (const s of resolvedDraft) {
      if (!s.nome?.trim()) { toast.error('Preencha o nome do sucessor'); return; }
      if (isSuccessorInactive(s)) { toast.error('Não é possível salvar um sucessor inativo. Remova ou substitua esse sucessor.'); return; }
      if (!s.prontidao) { toast.error('Para salvar as alterações, é obrigatório informar o tempo de prontidão de cada sucessor alterado.'); return; }
      if (normalizeProntidao(s.prontidao) === 'Acompanhamento' && !s.comentario?.trim()) { toast.error('Comentário obrigatório para prontidão Acompanhamento.'); return; }
      if (normalizeProntidao(s.prontidao) === 'Job Rotation') {
        const successorNivel = s.nivelCarreira?.toUpperCase();
        const leaderNivel = leader.nivelCarreira?.toUpperCase();
        if (successorNivel !== leaderNivel) { toast.error('Job Rotation só pode ser salvo quando o sucessor possui o mesmo nível de carreira da pessoa sucedida.'); return; }
      }
    }
    const names = resolvedDraft.map(s => s.nome.trim().toLowerCase());
    if (new Set(names).size !== names.length) { toast.error('Não é permitido duplicar sucessores no mesmo líder'); return; }
    setSaving(true);
    await saveSuccessors(leader, resolvedDraft);
    setSaving(false);
    setEditing(false);
    toast.success('Sucessores salvos com sucesso!');
  };

  const addSuccessor = () => {
    if (draft.length >= 4) return;
    setDraft([...draft, { nome: '', cargo: null, nivelCarreira: null, prontidao: null, status: null, diretoria: null, ultimoQuadrante: null, enps2025: null }]);
  };

  const updateDraft = (idx: number, updated: EditableSuccessor) => {
    setDraft(prev => prev.map((s, i) => i === idx ? updated : s));
  };

  const removeDraft = (idx: number) => {
    setDraft(prev => prev.filter((_, i) => i !== idx));
  };

  const excludeNames = draft.map(s => s.nome).filter(Boolean);

  const headerBg = leaderInactive
    ? 'bg-[hsl(var(--senior-pink))]/10'
    : leaderAtencao
      ? 'bg-[hsl(var(--senior-yellow))]/10'
      : 'bg-[hsl(var(--senior-green))]/5';

  const borderColor = leaderInactive
    ? 'border-[hsl(var(--senior-pink))] bg-[hsl(var(--senior-pink))]/5'
    : leaderAtencao
      ? 'border-[hsl(var(--senior-yellow))]/60'
      : 'border-border';

  return (
    <Card className={`border shadow-sm hover:shadow-md transition-shadow ${borderColor}`}>
      <CardHeader className={`pb-2 border-b border-border/50 ${headerBg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-bold text-foreground leading-tight">
              {leader.cargo}
            </CardTitle>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs font-semibold text-primary">{leader.nome}</p>
              {leaderInactive && (
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Inativo
                </Badge>
              )}
              {leaderAtencao && (
                <AtencaoPopover comentario={leader.comentarioSituacao} />
              )}
              {!leaderInactive && !leaderAtencao && leader.situacao && (
                <Badge className="text-[9px] px-1.5 py-0 h-4 bg-[hsl(var(--senior-green))]/15 text-[hsl(172,82%,33%)]">
                  Ativo
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-muted-foreground">
              {leader.diretoria && <span className="font-medium">{leader.diretoria}</span>}
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                D: {leader.qtdDiretos ?? 0} e I: {leader.qtdIndiretos ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {calcTempoCargoFaixa(leader.dataInicioCargoAtual)}
              </span>
            </div>
          </div>
          {!editing && (
            displaySuccessorCount > 0 ? (
              <Badge className="bg-[hsl(var(--senior-green))] text-white text-[10px] shrink-0">
                {displaySuccessorCount} sucessor{displaySuccessorCount > 1 ? 'es' : ''}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px] shrink-0">
                Sem sucessor
              </Badge>
            )
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        <div className="overflow-hidden rounded-md border border-border/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-1.5 px-2 text-left text-[10px] font-semibold text-muted-foreground uppercase">Ano</th>
                <th className="py-1.5 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">9Box</th>
                <th className="py-1.5 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">Ating. CR</th>
                <th className="py-1.5 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">Med. eNPS</th>
              </tr>
            </thead>
            <tbody>
              <IndicatorTable year={2026} quadrante={leader.ultimoQuadrante} cr={leader.cr2026 ?? null} enps={leader.moods2026 ?? null} />
              <IndicatorTable year={2025} quadrante={leader.penultimoQuadrante ?? null} cr={leader.cr2025} enps={leader.moods2025 ?? null} />
            </tbody>
          </table>
        </div>

        {!editing && sortedSuccessors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Pot. Sucessor + Prontidão</span>
            </div>
            {sortedSuccessors.map((s, i) => {
              const sInactive = isSuccessorInactive(s);
              return (
                <div key={i} className={`border rounded-md overflow-hidden ${sInactive ? 'border-[hsl(var(--senior-pink))] bg-[hsl(var(--senior-pink))]/5' : 'border-border/50'}`}>
                  <div className={`px-2.5 py-1.5 border-b border-border/40 ${sInactive ? 'bg-[hsl(var(--senior-pink))]/10' : 'bg-muted/30'}`}>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-semibold text-foreground truncate">{s.nome}</p>
                          {canEdit && (
                            <CalibrationButton
                              successorName={s.nome}
                              leaderName={leader.nome}
                              profile={profile}
                            />
                          )}
                          {s.comentario?.trim() && (
                            <button
                              type="button"
                              onClick={() => setExpandedComment(prev => prev === i ? null : i)}
                              className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                              title="Ver comentário"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          )}
                          {sInactive && (
                            <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5 gap-0.5">
                              <AlertTriangle className="w-2 h-2" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {s.cargo}{s.diretoria ? ` · ${s.diretoria}` : ''}
                        </p>
                        {(s as any).tempoNoCargo && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {calcTempoCargoSucessor((s as any).tempoNoCargo)}
                          </p>
                        )}
                      </div>
                      <Badge className={`text-[9px] shrink-0 gap-0.5 min-h-[28px] ${getProntidaoColor(s.prontidao)}`}>
                        {normalizeProntidao(s.prontidao)}
                      </Badge>
                    </div>
                    {expandedComment === i && s.comentario?.trim() && (
                      <div className="mt-1.5 p-2 bg-muted/20 rounded text-[10px] text-muted-foreground border border-border/30">
                        {s.comentario}
                      </div>
                    )}
                  </div>
                  {isNonLeaderLevel(s.nivelCarreira) && (
                    <p className="px-2.5 py-1 text-[9px] text-muted-foreground italic bg-muted/10">
                      CR referência do líder imediato{(s as any).liderImediato ? ` (${(s as any).liderImediato})` : ''}
                    </p>
                  )}
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="py-1 px-2 text-left text-[10px] font-semibold text-muted-foreground uppercase">Ano</th>
                        <th className="py-1 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">9Box</th>
                        <th className="py-1 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">
                          {isNonLeaderLevel(s.nivelCarreira) ? 'CR (líder)' : 'Ating. CR'}
                        </th>
                        <th className="py-1 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">Med. eNPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const ind = findSuccessorIndicators(s, allLeaders);
                         return (
                          <>
                            <IndicatorTable year={2026} quadrante={ind.ultimoQuadrante} cr={ind.cr2026} enps={ind.enps2026} />
                            <IndicatorTable year={2025} quadrante={ind.penultimoQuadrante} cr={ind.cr2025} enps={ind.enps2025} />
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {editing && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Pencil className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Editando Sucessores</span>
            </div>
            {draft.map((s, i) => (
              <SuccessorEditBlock
                key={i}
                index={i}
                successor={s}
                allLeaders={allLeaders}
                excludeNames={excludeNames.filter((_, idx) => idx !== i)}
                onChange={(u) => updateDraft(i, u)}
                onRemove={() => removeDraft(i)}
                leaderNivel={leader.nivelCarreira}
              />
            ))}
            {draft.length < 4 && (
              <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={addSuccessor}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar sucessor
              </Button>
            )}
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={cancelEdit}>
                <XCircle className="w-3 h-3 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {!editing && (
          <Button variant="outline" size="sm" className="w-full text-xs h-7 mt-1" onClick={startEdit}>
            <Pencil className="w-3 h-3 mr-1" /> Editar sucessores
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function SuccessionMap() {
  const { leaders: dbLeaders, baseId } = useLeadersData();
  const { profile } = useAuth();
  const [diretoria, setDiretoria] = useState(ALL);
  const [selectedNivel, setSelectedNivel] = useState(ALL);
  const [ligacaoCE, setLigacaoCE] = useState(ALL);
  const [statusLider, setStatusLider] = useState(ALL);
  const [selectedLeaders, setSelectedLeaders] = useState<string[]>([]);
  const [selectedSuccessors, setSelectedSuccessors] = useState<string[]>([]);
  const [prontidaoFilter, setProntidaoFilter] = useState<string | null>(null);
  const { getSuccessors, saveSuccessors } = useSuccessionEdits(baseId, profile);

  const isMaster = profile?.role === 'master';

  const hasActiveFilter = diretoria !== ALL || selectedNivel !== ALL || ligacaoCE !== ALL || statusLider !== ALL || selectedLeaders.length > 0 || selectedSuccessors.length > 0 || prontidaoFilter !== null;

  const clearAllFilters = useCallback(() => {
    setDiretoria(ALL);
    setSelectedNivel(ALL);
    setLigacaoCE(ALL);
    setStatusLider(ALL);
    setSelectedLeaders([]);
    setSelectedSuccessors([]);
    setProntidaoFilter(null);
  }, []);

  const allLeaders = useMemo(() => {
    const leaders = dbLeaders as Leader[];
    const seen = new Set<string>();
    return leaders.filter(l => {
      const key = `${l.cargo}|${l.nome}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [dbLeaders]);

  const allLeadersForSearch = allLeaders;

  const diretorias = useMemo(() =>
    [...new Set(allLeaders.map(l => l.diretoria).filter(Boolean))].sort(),
    [allLeaders]
  );

  const niveis = useMemo(() =>
    [...new Set(allLeaders.map(l => l.nivelCarreira).filter(Boolean))].sort() as string[],
    [allLeaders]
  );

  const CE_ORDER = ['Membro do CE', 'Direto do CE', 'Indireto do CE'];
  const ligacoesCE = useMemo(() => {
    const raw = [...new Set(allLeaders.map(l => l.ligacaoCE).filter(Boolean))] as string[];
    return raw.sort((a, b) => {
      const ia = CE_ORDER.findIndex(x => a.toLowerCase().includes(x.toLowerCase()));
      const ib = CE_ORDER.findIndex(x => b.toLowerCase().includes(x.toLowerCase()));
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [allLeaders]);

  const preFiltered = useMemo(() => {
    let result = allLeaders;
    if (diretoria !== ALL) result = result.filter(l => l.diretoria === diretoria);
    if (selectedNivel !== ALL) result = result.filter(l => l.nivelCarreira === selectedNivel);
    if (ligacaoCE !== ALL) result = result.filter(l => l.ligacaoCE === ligacaoCE);
    if (statusLider !== ALL) {
      if (statusLider === 'Ativo') result = result.filter(l => {
        const s = getLeaderDisplayStatus(l);
        return s === 'Ativo';
      });
      else if (statusLider === 'Atenção') result = result.filter(l => getLeaderDisplayStatus(l) === 'Atenção');
      else if (statusLider === 'Inativo') result = result.filter(l => getLeaderDisplayStatus(l) === 'Inativo');
    }
    return result;
  }, [allLeaders, diretoria, selectedNivel, ligacaoCE, statusLider]);

  const leaderNameOptions = useMemo(() =>
    [...new Set(preFiltered.map(l => l.nome.trim()))].sort((a, b) => a.localeCompare(b)),
    [preFiltered]
  );

  const successorNameOptions = useMemo(() => {
    const names = new Set<string>();
    preFiltered.forEach(l => {
      getSuccessors(l).forEach(s => {
        if (isValidSuccessorName(s.nome)) names.add(s.nome);
      });
    });
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [preFiltered, getSuccessors]);

  const filtered = useMemo(() => {
    let result = preFiltered;
    if (selectedLeaders.length > 0) result = result.filter(l => selectedLeaders.includes(l.nome));
    if (selectedSuccessors.length > 0) {
      result = result.filter(l => {
        const succs = getSuccessors(l);
        return succs.some(s => selectedSuccessors.includes(s.nome));
      });
    }
    if (prontidaoFilter) {
      result = result.filter(l => {
        const succs = getSuccessors(l).filter(s => isValidSuccessorName(s.nome));
        const nonJR = succs.filter(s => normalizeProntidao(resolveEffectiveProntidao(s, l.nivelCarreira)) !== 'Job Rotation');
        if (prontidaoFilter === 'Sem sucessor') return nonJR.length === 0;
        return succs.some(s => {
          const effective = resolveEffectiveProntidao(s, l.nivelCarreira);
          return normalizeProntidao(effective) === prontidaoFilter;
        });
      });
    }
    return result.sort((a, b) => {
      const aSucc = getSuccessors(a).filter(s => isValidSuccessorName(s.nome));
      const aNonJR = aSucc.filter(s => normalizeProntidao(resolveEffectiveProntidao(s, a.nivelCarreira)) !== 'Job Rotation');
      const bSucc = getSuccessors(b).filter(s => isValidSuccessorName(s.nome));
      const bNonJR = bSucc.filter(s => normalizeProntidao(resolveEffectiveProntidao(s, b.nivelCarreira)) !== 'Job Rotation');
      if (aNonJR.length > 0 && bNonJR.length === 0) return -1;
      if (aNonJR.length === 0 && bNonJR.length > 0) return 1;
      return a.nome.localeCompare(b.nome);
    });
  }, [preFiltered, selectedLeaders, selectedSuccessors, prontidaoFilter, getSuccessors]);

  const [exporting, setExporting] = useState(false);
  const [exportingChanges, setExportingChanges] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      exportSuccessionReport(filtered, getSuccessors, allLeaders);
      toast.success('Relatório exportado!');
    } finally {
      setExporting(false);
    }
  };

  const handleExportChanges = async () => {
    if (!baseId) { toast.error('Base não identificada'); return; }
    setExportingChanges(true);
    try {
      await exportSuccessionChanges(baseId);
      toast.success('Alterações exportadas!');
    } catch {
      toast.error('Erro ao exportar alterações');
    } finally {
      setExportingChanges(false);
    }
  };

  const isLoading = !dbLeaders || dbLeaders.length === 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
              <p className="text-xs text-muted-foreground">Visão detalhada por posição de liderança</p>
              </div>
              <div className="flex items-center gap-2">
                {isMaster && (
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleExportChanges} disabled={exportingChanges}>
                    {exportingChanges ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <FileText className="w-3.5 h-3.5 mr-1" />}
                    {exportingChanges ? 'Gerando...' : 'Exportar Alterações'}
                  </Button>
                )}
                {isMaster && (
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleExport} disabled={exporting}>
                    {exporting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                    {exporting ? 'Gerando...' : 'Exportar'}
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="border-b bg-card/50">
            <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center gap-3 flex-wrap">
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={clearAllFilters}
                >
                  <FilterX className="w-3.5 h-3.5" />
                  Limpar filtros
                </Button>
              )}

              <SelectNative
                value={diretoria}
                onChange={e => setDiretoria(e.target.value)}
                options={(diretorias as string[]).map(d => ({ value: d, label: d }))}
                placeholder="Diretorias"
              />

              <NivelFilter niveis={niveis} selected={selectedNivel} onChange={setSelectedNivel} />
              
              <SelectNative
                value={ligacaoCE}
                onChange={e => setLigacaoCE(e.target.value)}
                options={ligacoesCE.map(ce => ({ value: ce, label: ce }))}
                placeholder="Direto ou Indireto do CE"
              />

              <SelectNative
                value={statusLider}
                onChange={e => setStatusLider(e.target.value)}
                options={[
                  { value: 'Ativo', label: 'Ativo' },
                  { value: 'Atenção', label: 'Atenção' },
                  { value: 'Inativo', label: 'Inativo' },
                ]}
                placeholder="Status do Líder"
              />

              <MultiSelectFilter
                selected={selectedLeaders}
                onChange={setSelectedLeaders}
                options={leaderNameOptions}
                placeholder="Líder a Ser Sucedido"
              />

              <MultiSelectFilter
                selected={selectedSuccessors}
                onChange={setSelectedSuccessors}
                options={successorNameOptions}
                placeholder="Sucessor"
              />
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto px-4 pt-4">
            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground mb-4 px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">Legenda Prontidão:</span>
              </div>
              {[
                { label: 'Imediata', key: 'Imediato', color: 'bg-senior-green-3' },
                { label: '1 a 2 anos', key: '1-2 anos', color: 'bg-[hsl(var(--senior-orange))]' },
                { label: '2 a 3 anos', key: '2-3 anos', color: 'bg-[hsl(var(--senior-yellow))]' },
                { label: '3 a 4 anos', key: '3-4 anos', color: 'bg-[hsl(var(--senior-gray))]' },
                { label: 'Job Rotation', key: 'Job Rotation', color: 'bg-[hsl(var(--senior-purple))]' },
                { label: 'Acompanhamento', key: 'Acompanhamento', color: 'bg-[hsl(var(--senior-turquoise))]' },
                { label: 'Sem sucessor', key: 'Sem sucessor', color: 'bg-[hsl(var(--senior-pink))]' },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setProntidaoFilter(prev => prev === item.key ? null : item.key)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all cursor-pointer hover:bg-accent min-h-[28px] ${prontidaoFilter === item.key ? 'ring-2 ring-primary bg-accent font-semibold text-foreground' : ''}`}
                >
                  <span className={`w-3 h-3 rounded-sm ${item.color}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <main className="max-w-[1600px] mx-auto px-4 pb-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300">
                {filtered.map((leader) => (
                  <LeaderCard
                    key={`${leader.cargo}|${leader.nome}`}
                    leader={leader}
                    allLeaders={allLeadersForSearch}
                    getSuccessors={getSuccessors}
                    saveSuccessors={saveSuccessors}
                    profile={profile}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
