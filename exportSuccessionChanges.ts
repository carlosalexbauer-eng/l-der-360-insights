import { useMemo, useState, useEffect, ReactNode } from 'react';
import { Leader } from '@/data/leaders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { normalizeProntidao } from '@/lib/scoring';
import { CheckCircle, Users, ShieldAlert, ArrowUp, ArrowDown, Minus, Clock, ChevronUp, ChevronDown, RefreshCw, ArrowLeftRight, X, TrendingUp, AlertTriangle, Pencil, Save, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHistoricalData, historicalToLeaders } from '@/hooks/useHistoricalData';
import { DashboardFilters } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const NON_LEADER_LEVELS = ['P1','P2','P3','P4','S1','S2','S3','S4','T2','T3','U1','U2'];
const ALL_LEVELS = ['E2', 'E1', 'M3', 'M2', 'M1'];
const DEFAULT_BLOCK_ORDER = ['kpi_cards', 'distribuicao_prontidao', 'cobertura_posicoes', 'pool_nivel_carreira', 'movimentacao_interna'];

function SortableBlock({ id, isMaster, children }: { id: string; isMaster: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !isMaster });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {isMaster && (
        <button {...attributes} {...listeners} className="absolute -right-1 top-3 z-10 p-1 rounded bg-muted/80 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  );
}

const ALL = '__all__';

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

function isSuccessorInactive(s: { status?: string | null }): boolean {
  if (!s.status) return false;
  const st = s.status.toLowerCase();
  return st === 'inativo' || st.includes('desligado');
}

function isJobRotation(successor: { nivelCarreira: string | null; nivelCarreiraPool?: string | null }, leaderNivel: string | null | undefined): boolean {
  // Use actual career level (nivelCarreira) for JR validation, NOT pool level
  const sucLevel = successor.nivelCarreira;
  if (!sucLevel || !leaderNivel) return false;
  if (isNonLeaderLevel(sucLevel)) return false;
  return sucLevel.toUpperCase() === leaderNivel.toUpperCase();
}

function hasValidCadastro(leader: { cadastro: number | null }): boolean {
  return leader.cadastro !== null && leader.cadastro !== undefined && !isNaN(leader.cadastro);
}

/** Get active valid successors for a leader */
function getActiveSuccessors(l: Leader) {
  return (l.sucessores || []).filter(s =>
    isValidSuccessorName(s.nome) && !isSuccessorInactive(s)
  );
}

// Compute stats for 2026 (current leaders) — ALL positions with valid cadastro
function computeStats2026(leaders: Leader[]) {
  const total = leaders.length;
  let comSucessor = 0;
  let semSucessao = 0;
  let somenteJobRotation = 0;

  const prontidaoCounts: Record<string, number> = { 'Imediato': 0, '1-2 anos': 0, '2-3 anos': 0, '3-4 anos': 0, 'Job Rotation': 0 };

  leaders.forEach(l => {
    const validSuccessors = getActiveSuccessors(l);
    const hasRealSuccessor = validSuccessors.some(s => !isJobRotation(s, l.nivelCarreira));
    const hasJobRotation = validSuccessors.some(s => isJobRotation(s, l.nivelCarreira));

    if (hasRealSuccessor) {
      comSucessor++;
    } else if (hasJobRotation) {
      somenteJobRotation++;
    } else {
      semSucessao++;
    }

    validSuccessors.forEach(s => {
      if (isJobRotation(s, l.nivelCarreira)) {
        prontidaoCounts['Job Rotation']++;
      } else {
        const p = normalizeProntidao(s.prontidao);
        if (prontidaoCounts[p] !== undefined) prontidaoCounts[p]++;
      }
    });
  });

  return {
    total,
    comSucessor,
    comSucessorPct: total > 0 ? Math.round((comSucessor / total) * 100) : 0,
    semSucessao,
    semSucessaoPct: total > 0 ? Math.round((semSucessao / total) * 100) : 0,
    somenteJobRotation,
    somenteJobRotationPct: total > 0 ? Math.round((somenteJobRotation / total) * 100) : 0,
    prontidaoCounts,
  };
}

// computeStats2025 removed — now uses computeStats2026 on converted historical data

export function SuccessionTab({ leaders, allDbLeaders, filters }: { leaders: Leader[]; allDbLeaders: Leader[]; filters: DashboardFilters }) {
  const { historicalLeaders } = useHistoricalData();
  const { profile } = useAuth();

  const [selectedProntidoes, setSelectedProntidoes] = useState<Set<string>>(new Set());
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showJRModal, setShowJRModal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [modalDiretoria, setModalDiretoria] = useState(ALL);
  const [modalNivel, setModalNivel] = useState(ALL);
  const [modalSort, setModalSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'diretoria', dir: 'asc' });
  const [jrModalDiretoria, setJrModalDiretoria] = useState(ALL);
  const [jrModalSort, setJrModalSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'liderNome', dir: 'asc' });
  const [tableInverted, setTableInverted] = useState(true);
  const [movIntInverted, setMovIntInverted] = useState(true);
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [poolModalData, setPoolModalData] = useState<{ nivel: string; year: '2025' | '2026'; rows: { sucessorNome: string; poolLevel: string; liderNome: string; liderDiretoria: string }[] }>({ nivel: '', year: '2026', rows: [] });
  const [showSemSucessorModal, setShowSemSucessorModal] = useState(false);
  const [semSucessorModalData, setSemSucessorModalData] = useState<{ nivel: string; year: '2025' | '2026'; leaders: { nome: string; cargo: string; diretoria: string; nivelCarreira: string; liderDoLider: string }[] }>({ nivel: '', year: '2026', leaders: [] });

  const [coverage2027, setCoverage2027] = useState<{ pct: number | null; mapped: number | null; total: number | null }>({ pct: null, mapped: null, total: null });
  const [editing2027, setEditing2027] = useState(false);
  const [edit2027Pct, setEdit2027Pct] = useState('');
  const [edit2027Mapped, setEdit2027Mapped] = useState('');
  const [edit2027Total, setEdit2027Total] = useState('');
  const [saving2027, setSaving2027] = useState(false);

  // Movimentação Interna state
  const [movInt2025, setMovInt2025] = useState<{ total_fechadas: number | null; internos: number | null; pct: number | null }>({ total_fechadas: null, internos: null, pct: null });
  const [movInt2026, setMovInt2026] = useState<{ total_fechadas: number | null; internos: number | null; pct: number | null }>({ total_fechadas: null, internos: null, pct: null });
  const [editingMovInt2025, setEditingMovInt2025] = useState(false);
  const [editMovInt2025Fechadas, setEditMovInt2025Fechadas] = useState('');
  const [editMovInt2025Internos, setEditMovInt2025Internos] = useState('');
  const [editMovInt2025Pct, setEditMovInt2025Pct] = useState('');
  const [savingMovInt2025, setSavingMovInt2025] = useState(false);
  const [editingMovInt2026, setEditingMovInt2026] = useState(false);
  const [editMovInt2026Fechadas, setEditMovInt2026Fechadas] = useState('');
  const [editMovInt2026Internos, setEditMovInt2026Internos] = useState('');
  const [editMovInt2026Pct, setEditMovInt2026Pct] = useState('');
  const [savingMovInt2026, setSavingMovInt2026] = useState(false);

  // Meta 2026 state
  const [meta2026, setMeta2026] = useState<number | null>(null);
  const [editMeta2026, setEditMeta2026] = useState('');
  const [editingMeta2026, setEditingMeta2026] = useState(false);
  const [savingMeta2026, setSavingMeta2026] = useState(false);

  const isAdmin = profile?.role === 'master' || profile?.role === 'admin';
  const isMaster = profile?.role === 'master';
  const canToggleOrder = profile?.role === 'master' || profile?.role === 'admin' || profile?.role === 'bp';

  // Block order state + persistence
  const [blockOrder, setBlockOrder] = useState<string[]>(DEFAULT_BLOCK_ORDER);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  useEffect(() => {
    supabase.from('system_metadata').select('value').eq('key', 'succession_block_order').maybeSingle().then(({ data }) => {
      if (data?.value && Array.isArray(data.value)) {
        const saved = data.value as string[];
        // Ensure all blocks are present
        const valid = saved.filter(id => DEFAULT_BLOCK_ORDER.includes(id));
        DEFAULT_BLOCK_ORDER.forEach(id => { if (!valid.includes(id)) valid.push(id); });
        setBlockOrder(valid);
      }
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlockOrder(prev => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const newOrder = arrayMove(prev, oldIndex, newIndex);
      // Persist
      supabase.from('system_metadata').upsert({ key: 'succession_block_order', value: newOrder as any, updated_by: profile?.id || null } as any, { onConflict: 'key' });
      return newOrder;
    });
  };

  useEffect(() => {
    supabase
      .from('system_metadata')
      .select('value')
      .eq('key', 'last_update')
      .maybeSingle()
      .then(({ data }) => {
        const ts = (data?.value as any)?.timestamp;
        if (ts) {
          const d = new Date(ts);
          setLastUpdate(
            d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) +
            ' ' +
            d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
          );
        }
      });
  }, []);

  // Load 2027 manual data
  useEffect(() => {
    supabase
      .from('system_metadata')
      .select('value')
      .eq('key', 'coverage_2027')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const v = data.value as any;
          setCoverage2027({ pct: v.pct ?? null, mapped: v.mapped ?? null, total: v.total ?? null });
        }
      });
  }, []);

  // Load movimentação interna data
  useEffect(() => {
    supabase
      .from('system_metadata')
      .select('key, value')
      .in('key', ['movimentacao_interna_2025', 'movimentacao_interna_2026'])
      .then(({ data }) => {
        data?.forEach(row => {
          const v = row.value as any;
          if (row.key === 'movimentacao_interna_2025') {
            setMovInt2025({ total_fechadas: v?.total_fechadas ?? null, internos: v?.internos ?? null, pct: v?.pct ?? null });
          }
          if (row.key === 'movimentacao_interna_2026') {
            setMovInt2026({ total_fechadas: v?.total_fechadas ?? null, internos: v?.internos ?? null, pct: v?.pct ?? null });
          }
        });
      });
  }, []);

  // Load meta 2026
  useEffect(() => {
    supabase
      .from('system_metadata')
      .select('value')
      .eq('key', 'meta_movimentacao_2026')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const v = data.value as any;
          setMeta2026(v?.pct ?? null);
        }
      });
  }, []);

  const handleSave2027 = async () => {
    setSaving2027(true);
    const pct = edit2027Pct !== '' ? Number(edit2027Pct) : null;
    const mapped = edit2027Mapped !== '' ? Number(edit2027Mapped) : null;
    const total = edit2027Total !== '' ? Number(edit2027Total) : null;
    await supabase
      .from('system_metadata')
      .update({ value: { pct, mapped, total } as any, updated_by: profile?.id || null })
      .eq('key', 'coverage_2027');
    setCoverage2027({ pct, mapped, total });
    setEditing2027(false);
    setSaving2027(false);
  };

  const handleSaveMovInt2025 = async () => {
    setSavingMovInt2025(true);
    const total_fechadas = editMovInt2025Fechadas !== '' ? Number(editMovInt2025Fechadas) : null;
    const internos = editMovInt2025Internos !== '' ? Number(editMovInt2025Internos) : null;
    const pct = editMovInt2025Pct !== '' ? Number(editMovInt2025Pct) : null;
    await supabase
      .from('system_metadata')
      .update({ value: { total_fechadas, internos, pct } as any, updated_by: profile?.id || null })
      .eq('key', 'movimentacao_interna_2025');
    setMovInt2025({ total_fechadas, internos, pct });
    setEditingMovInt2025(false);
    setSavingMovInt2025(false);
  };

  const handleSaveMeta2026 = async () => {
    setSavingMeta2026(true);
    const pct = editMeta2026 !== '' ? Number(editMeta2026) : null;
    await supabase
      .from('system_metadata')
      .upsert({ key: 'meta_movimentacao_2026', value: { pct } as any, updated_by: profile?.id || null } as any, { onConflict: 'key' });
    setMeta2026(pct);
    setEditingMeta2026(false);
    setSavingMeta2026(false);
  };

  const handleSaveMovInt2026 = async () => {
    setSavingMovInt2026(true);
    const total_fechadas = editMovInt2026Fechadas !== '' ? Number(editMovInt2026Fechadas) : null;
    const internos = editMovInt2026Internos !== '' ? Number(editMovInt2026Internos) : null;
    const pct = editMovInt2026Pct !== '' ? Number(editMovInt2026Pct) : null;
    await supabase
      .from('system_metadata')
      .upsert({ key: 'movimentacao_interna_2026', value: { total_fechadas, internos, pct } as any, updated_by: profile?.id || null } as any, { onConflict: 'key' });
    setMovInt2026({ total_fechadas, internos, pct });
    setEditingMovInt2026(false);
    setSavingMovInt2026(false);
  };

  // All positions with valid cadastro, applying global filters
  const allPositions = useMemo(() => {
    return (allDbLeaders || []).filter(l => {
      if (!hasValidCadastro(l)) return false;
      if (filters.diretoria !== ALL && l.diretoria !== filters.diretoria) return false;
      if (filters.nivel !== ALL && l.nivelCarreira !== filters.nivel) return false;
      if (filters.ligacaoCE !== ALL && l.ligacaoCE !== filters.ligacaoCE) return false;
      return true;
    });
  }, [allDbLeaders, filters]);

  // Convert historical leaders to Leader format, then apply same filters
  const filteredHistorical = useMemo(() => {
    const asLeaders = historicalToLeaders(historicalLeaders);
    return asLeaders.filter(l => {
      if (!hasValidCadastro(l)) return false;
      if (filters.diretoria !== ALL && l.diretoria !== filters.diretoria) return false;
      if (filters.nivel !== ALL && l.nivelCarreira !== filters.nivel) return false;
      if (filters.ligacaoCE !== ALL && l.ligacaoCE !== filters.ligacaoCE) return false;
      return true;
    });
  }, [historicalLeaders, filters]);

  const stats2026 = useMemo(() => computeStats2026(allPositions), [allPositions]);
  const stats2025 = useMemo(() => computeStats2026(filteredHistorical), [filteredHistorical]);

  // Leaders without any successor (no real successor AND no job rotation) — 2026
  const leadersWithoutSuccessor = useMemo(() => {
    return allPositions
      .filter(l => {
        const validSuccessors = getActiveSuccessors(l);
        const hasRealSuccessor = validSuccessors.some(s => !isJobRotation(s, l.nivelCarreira));
        const hasJobRotation = validSuccessors.some(s => isJobRotation(s, l.nivelCarreira));
        return !hasRealSuccessor && !hasJobRotation;
      })
      .sort((a, b) => (a.diretoria || '').localeCompare(b.diretoria || ''));
  }, [allPositions]);

  // Leaders with ONLY Job Rotation (no real successors) — 2026
  const leadersOnlyJobRotation = useMemo(() => {
    return allPositions.filter(l => {
      const validSuccessors = getActiveSuccessors(l);
      if (validSuccessors.length === 0) return false;
      const hasRealSuccessor = validSuccessors.some(s => !isJobRotation(s, l.nivelCarreira));
      return !hasRealSuccessor;
    });
  }, [allPositions]);

  // Flat rows for JR modal
  const jrModalRows = useMemo(() => {
    const rows: { liderNome: string; liderCargo: string; liderDiretoria: string; sucessorNome: string; sucessorCargo: string; sucessorDiretoria: string }[] = [];
    leadersOnlyJobRotation.forEach(l => {
      const jrSuccessors = getActiveSuccessors(l).filter(s => isJobRotation(s, l.nivelCarreira));
      jrSuccessors.forEach(s => {
        rows.push({
          liderNome: l.nome || '—',
          liderCargo: l.cargo || '—',
          liderDiretoria: l.diretoria || '—',
          sucessorNome: s.nome || '—',
          sucessorCargo: s.cargo || '—',
          sucessorDiretoria: s.diretoria || '—',
        });
      });
    });
    return rows;
  }, [leadersOnlyJobRotation]);

  const totalMapped2026 = useMemo(() =>
    Object.values(stats2026.prontidaoCounts).reduce((a, b) => a + b, 0)
  , [stats2026]);

  const totalMapped2025 = useMemo(() =>
    Object.values(stats2025.prontidaoCounts).reduce((a, b) => a + b, 0)
  , [stats2025]);

  // Grouped bar data: 2025 vs 2026
  const chartData = useMemo(() => {
    const categories = ['Imediato', '1-2 anos', '2-3 anos', '3-4 anos', 'Job Rotation'];
    return categories.map(name => {
      const v2026 = stats2026.prontidaoCounts[name] || 0;
      const v2025 = stats2025.prontidaoCounts[name] || 0;
      const pct2026 = totalMapped2026 > 0 ? Math.round((v2026 / totalMapped2026) * 100) : 0;
      const pct2025 = totalMapped2025 > 0 ? Math.round((v2025 / totalMapped2025) * 100) : 0;
      return { name, '2026': v2026, '2025': v2025, pct2026, pct2025 };
    });
  }, [stats2026, stats2025, totalMapped2026, totalMapped2025]);

  // Coverage by career level — 2026 using Pool columns + dedup
  const coverageData2026 = useMemo(() => {
    const byLevel: Record<string, { total: number; semSucessor: number; semSucessorLeaders: { nome: string; cargo: string; diretoria: string; nivelCarreira: string; liderDoLider: string }[]; poolNames: Set<string>; poolDetails: { sucessorNome: string; poolLevel: string; liderNome: string; liderDiretoria: string }[] }> = {};
    ALL_LEVELS.forEach(lv => { byLevel[lv] = { total: 0, semSucessor: 0, semSucessorLeaders: [], poolNames: new Set(), poolDetails: [] }; });

    allPositions.forEach(l => {
      const lv = l.nivelCarreira;
      if (!lv) return;
      const lvUp = lv.toUpperCase();
      if (!ALL_LEVELS.includes(lvUp)) return;
      byLevel[lvUp].total++;

      const activeSuccessors = getActiveSuccessors(l);
      const hasSuccessorForOwnLevel = activeSuccessors.some(s => {
        if (isJobRotation(s, l.nivelCarreira)) return false;
        const poolLevel = ((s as any).nivelCarreiraPool || null)?.toUpperCase?.() as string | undefined;
        return poolLevel === lvUp;
      });
      if (!hasSuccessorForOwnLevel) {
        byLevel[lvUp].semSucessor++;
        byLevel[lvUp].semSucessorLeaders.push({
          nome: l.nome || '—',
          cargo: l.cargo || '—',
          diretoria: l.diretoria || '—',
          nivelCarreira: l.nivelCarreira || '—',
          liderDoLider: l.liderDoLider || '—',
        });
      }

      activeSuccessors.forEach(s => {
        if (isJobRotation(s, l.nivelCarreira)) return;
        const poolLevel = ((s as any).nivelCarreiraPool || null)?.toUpperCase?.() as string | undefined;
        if (!poolLevel || !ALL_LEVELS.includes(poolLevel)) return;
        if (!isValidSuccessorName(s.nome)) return;

        if (selectedProntidoes.size > 0) {
          const isJR = isJobRotation(s, l.nivelCarreira);
          const pront = isJR ? 'Job Rotation' : normalizeProntidao(s.prontidao);
          if (!selectedProntidoes.has(pront)) return;
        }

        const nameKey = s.nome!.trim().toUpperCase();
        if (!byLevel[poolLevel].poolNames.has(nameKey)) {
          byLevel[poolLevel].poolNames.add(nameKey);
          byLevel[poolLevel].poolDetails.push({
            sucessorNome: s.nome!.trim(),
            poolLevel,
            liderNome: l.nome || '—',
            liderDiretoria: l.diretoria || '—',
          });
        }
      });
    });

    return ALL_LEVELS.map(lv => {
      const d = byLevel[lv];
      const pool = d.poolNames.size;
      return { nivel: lv, total: d.total, semSucessor: d.semSucessor, semSucessorLeaders: d.semSucessorLeaders, pool, pct: d.total === 0 && pool === 0 ? -1 : (d.total > 0 ? Math.round((pool / d.total) * 100) : 0), poolDetails: d.poolDetails };
    });
  }, [allPositions, selectedProntidoes]);

  // Coverage by career level — 2025 using same logic as 2026 on converted historical data
  const coverageData2025 = useMemo(() => {
    const byLevel: Record<string, { total: number; semSucessor: number; semSucessorLeaders: { nome: string; cargo: string; diretoria: string; nivelCarreira: string; liderDoLider: string }[]; poolNames: Set<string>; poolDetails: { sucessorNome: string; poolLevel: string; liderNome: string; liderDiretoria: string }[] }> = {};
    ALL_LEVELS.forEach(lv => { byLevel[lv] = { total: 0, semSucessor: 0, semSucessorLeaders: [], poolNames: new Set(), poolDetails: [] }; });

    filteredHistorical.forEach(l => {
      const lv = l.nivelCarreira;
      if (!lv) return;
      const lvUp = lv.toUpperCase();
      if (!ALL_LEVELS.includes(lvUp)) return;
      byLevel[lvUp].total++;

      const activeSuccessors = getActiveSuccessors(l);
      const hasSuccessorForOwnLevel = activeSuccessors.some(s => {
        if (isJobRotation(s, l.nivelCarreira)) return false;
        const poolLevel = ((s as any).nivelCarreiraPool || null)?.toUpperCase?.() as string | undefined;
        return poolLevel === lvUp;
      });
      if (!hasSuccessorForOwnLevel) {
        byLevel[lvUp].semSucessor++;
        byLevel[lvUp].semSucessorLeaders.push({
          nome: l.nome || '—',
          cargo: l.cargo || '—',
          diretoria: l.diretoria || '—',
          nivelCarreira: l.nivelCarreira || '—',
          liderDoLider: l.liderDoLider || '—',
        });
      }

      activeSuccessors.forEach(s => {
        if (isJobRotation(s, l.nivelCarreira)) return;
        const poolLevel = ((s as any).nivelCarreiraPool || null)?.toUpperCase?.() as string | undefined;
        if (!poolLevel || !ALL_LEVELS.includes(poolLevel)) return;
        if (!isValidSuccessorName(s.nome)) return;

        if (selectedProntidoes.size > 0) {
          const isJR = isJobRotation(s, l.nivelCarreira);
          const pront = isJR ? 'Job Rotation' : normalizeProntidao(s.prontidao);
          if (!selectedProntidoes.has(pront)) return;
        }

        const nameKey = s.nome!.trim().toUpperCase();
        if (!byLevel[poolLevel].poolNames.has(nameKey)) {
          byLevel[poolLevel].poolNames.add(nameKey);
          byLevel[poolLevel].poolDetails.push({
            sucessorNome: s.nome!.trim(),
            poolLevel,
            liderNome: l.nome || '—',
            liderDiretoria: l.diretoria || '—',
          });
        }
      });
    });

    return ALL_LEVELS.map(lv => {
      const d = byLevel[lv];
      const pool = d.poolNames.size;
      return { nivel: lv, total: d.total, semSucessor: d.semSucessor, semSucessorLeaders: d.semSucessorLeaders, pool, pct: d.total === 0 && pool === 0 ? -1 : (d.total > 0 ? Math.round((pool / d.total) * 100) : 0), poolDetails: d.poolDetails };
    });
  }, [filteredHistorical, selectedProntidoes]);

  // Executive coverage: (Imediato + 1-2 anos) / total positions
  const executiveCoverage = useMemo(() => {
    const imediato2026 = stats2026.prontidaoCounts['Imediato'] || 0;
    const curto2026 = stats2026.prontidaoCounts['1-2 anos'] || 0;
    const total2026 = stats2026.total;
    const pct2026 = total2026 > 0 ? Math.round(((imediato2026 + curto2026) / total2026) * 100) : 0;

    const imediato2025 = stats2025.prontidaoCounts['Imediato'] || 0;
    const curto2025 = stats2025.prontidaoCounts['1-2 anos'] || 0;
    const total2025 = stats2025.total;
    const pct2025 = total2025 > 0 ? Math.round(((imediato2025 + curto2025) / total2025) * 100) : 0;

    return {
      mapped2026: imediato2026 + curto2026,
      total2026,
      pct2026,
      mapped2025: imediato2025 + curto2025,
      total2025,
      pct2025,
    };
  }, [stats2026, stats2025]);

  const kpiCards = [
    {
      key: 'total',
      title: 'Total de Posições',
      value: stats2026.total,
      subtext: '',
      numValue: stats2026.total,
      prev: stats2025.total,
      icon: <Users className="w-5 h-5" />,
      color: 'text-[hsl(var(--senior-turquoise))]',
      bgColor: 'bg-[hsl(var(--senior-turquoise))]/15',
      borderColor: 'border-l-[hsl(var(--senior-turquoise))]',
      onClick: undefined as (() => void) | undefined,
      invertLogic: false,
    },
    {
      key: 'cobertura',
      title: 'Com Sucessor Mapeado',
      value: stats2026.comSucessor,
      subtext: `${stats2026.comSucessorPct}% do total`,
      numValue: stats2026.comSucessor,
      prev: stats2025.comSucessor,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-[hsl(var(--senior-green))]',
      bgColor: 'bg-[hsl(var(--senior-green))]/15',
      borderColor: 'border-l-[hsl(var(--senior-green))]',
      onClick: undefined as (() => void) | undefined,
      invertLogic: false,
    },
    {
      key: 'risco',
      title: 'Sem Sucessor Mapeado',
      value: stats2026.semSucessao,
      subtext: `${stats2026.semSucessaoPct}% do total`,
      numValue: stats2026.semSucessao,
      prev: stats2025.semSucessao,
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'text-[hsl(var(--senior-pink))]',
      bgColor: 'bg-[hsl(var(--senior-pink))]/10',
      borderColor: 'border-l-[hsl(var(--senior-pink))]',
      onClick: () => setShowRiskModal(true),
      invertLogic: true,
    },
    {
      key: 'somente_jr',
      title: 'Somente Job Rotation',
      value: stats2026.somenteJobRotation,
      subtext: `${stats2026.somenteJobRotationPct}% do total`,
      numValue: stats2026.somenteJobRotation,
      prev: stats2025.somenteJobRotation,
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-[hsl(var(--senior-yellow))]',
      bgColor: 'bg-[hsl(var(--senior-yellow))]/15',
      borderColor: 'border-l-[hsl(var(--senior-yellow))]',
      onClick: () => setShowJRModal(true),
      invertLogic: false,
    },
  ];

  const COLOR_2025 = '#00958B';
  const COLOR_2026 = '#2AC4AA';

  const handleBarClick = (data: any) => {
    if (!data || !data.name) return;
    setSelectedProntidoes(prev => {
      const next = new Set(prev);
      if (next.has(data.name)) {
        next.delete(data.name);
      } else {
        next.add(data.name);
      }
      return next;
    });
  };

  const renderBarLabel = (year: '2025' | '2026') => (props: any) => {
    const { x, y, width, height, value, index } = props;
    if (!value || width < 30) return null;
    const entry = chartData[index];
    if (!entry) return null;
    const pct = year === '2026' ? entry.pct2026 : entry.pct2025;
    return (
      <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {value} ({pct}%)
      </text>
    );
  };

  function getCoveragePctColor(pct: number): string {
    if (pct > 90) return 'text-[hsl(var(--senior-green))] bg-[hsl(var(--senior-green))]/15';
    if (pct >= 80) return 'text-[hsl(var(--senior-yellow))] bg-[hsl(var(--senior-yellow))]/15';
    return 'text-destructive bg-destructive/10';
  }

  // Block content map for dynamic ordering
  const blockContent: Record<string, ReactNode> = {
    kpi_cards: (
      <>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <Card
            key={card.key}
            className={`bg-card border border-border shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${card.onClick ? 'cursor-pointer' : ''}`}
            onClick={card.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium text-muted-foreground">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <span className={card.color}>{card.icon}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-foreground font-display tabular-nums leading-none">{card.value}</span>
                {card.subtext && <span className="text-xs text-muted-foreground">{card.subtext}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <VariationIndicator current={card.numValue} previous={card.prev} invertLogic={card.invertLogic} />
                <span className="text-[11px] text-muted-foreground">
                  2025: {card.prev}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </>
    ),
    distribuicao_prontidao: (
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2 px-6 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground">Distribuição de Prontidão — 2025 vs 2026</CardTitle>
            {selectedProntidoes.size > 0 && (
              <button onClick={() => setSelectedProntidoes(new Set())} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3 h-3" /> Limpar filtros ({selectedProntidoes.size})
              </button>
            )}
          </div>
          {selectedProntidoes.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.from(selectedProntidoes).map(p => (
                <Badge key={p} variant="secondary" className="text-[10px] gap-1 cursor-pointer" onClick={() => {
                  setSelectedProntidoes(prev => {
                    const next = new Set(prev);
                    next.delete(p);
                    return next;
                  });
                }}>
                  {p} <X className="w-2.5 h-2.5" />
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="h-[320px] px-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" barCategoryGap="18%" margin={{ left: 10, right: 60 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: 'hsl(var(--foreground))' }} width={90} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, fontSize: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(value: number, name: string) => [`${value}`, name]}
              />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value) => <span className="text-xs font-medium text-muted-foreground">{value}</span>}
              />
              <Bar dataKey="2025" fill={COLOR_2025} barSize={14} name="2025" label={renderBarLabel('2025')} radius={[0, 4, 4, 0]} />
              <Bar
                dataKey="2026"
                fill={COLOR_2026}
                barSize={14}
                name="2026"
                onClick={handleBarClick}
                cursor="pointer"
                label={renderBarLabel('2026')}
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={COLOR_2026}
                    opacity={selectedProntidoes.size > 0 && !selectedProntidoes.has(entry.name) ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    ),
    cobertura_posicoes: (
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-2 px-6 pt-6">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--senior-turquoise))]" />
            Cobertura de Posições — Prontidão de Curto Prazo
          </CardTitle>
          <p className="text-[11px] text-muted-foreground mt-1">
            Percentual de posições com sucessores mapeados com prontidão <strong>Imediato</strong> ou <strong>1 a 2 anos</strong>.
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {/* 2025 */}
            <div className="rounded-xl border-2 p-5 flex flex-col items-center gap-2" style={{ borderColor: '#00958B' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#00958B' }}>2025</span>
              <span className="text-4xl font-extrabold font-display tabular-nums" style={{ color: '#00958B' }}>
                {executiveCoverage.pct2025}%
              </span>
              <span className="text-[11px] text-muted-foreground text-center">
                {executiveCoverage.mapped2025} pessoas mapeadas / {executiveCoverage.total2025} posições
              </span>
              {executiveCoverage.pct2025 < 50 && (
                <Badge variant="destructive" className="text-[10px] gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" /> Risco Alto
                </Badge>
              )}
              {executiveCoverage.pct2025 >= 50 && executiveCoverage.pct2025 < 80 && (
                <Badge className="text-[10px] gap-1 mt-1 bg-[hsl(var(--senior-yellow))]/15 text-[hsl(var(--senior-yellow))] border-0">
                  <AlertTriangle className="w-3 h-3" /> Atenção
                </Badge>
              )}
              {executiveCoverage.pct2025 >= 80 && (
                <Badge className="text-[10px] gap-1 mt-1 bg-[hsl(var(--senior-green))]/15 text-[hsl(var(--senior-green))] border-0">
                  <CheckCircle className="w-3 h-3" /> Saudável
                </Badge>
              )}
            </div>
            {/* 2026 */}
            <div className="rounded-xl border-2 p-5 flex flex-col items-center gap-2" style={{ borderColor: '#2AC4AA' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2AC4AA' }}>2026</span>
              <span className="text-4xl font-extrabold font-display tabular-nums" style={{ color: '#2AC4AA' }}>
                {executiveCoverage.pct2026}%
              </span>
              <span className="text-[11px] text-muted-foreground text-center">
                {executiveCoverage.mapped2026} pessoas mapeadas / {executiveCoverage.total2026} posições
              </span>
              {executiveCoverage.pct2026 < 50 && (
                <Badge variant="destructive" className="text-[10px] gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" /> Risco Alto
                </Badge>
              )}
              {executiveCoverage.pct2026 >= 50 && executiveCoverage.pct2026 < 80 && (
                <Badge className="text-[10px] gap-1 mt-1 bg-[hsl(var(--senior-yellow))]/15 text-[hsl(var(--senior-yellow))] border-0">
                  <AlertTriangle className="w-3 h-3" /> Atenção
                </Badge>
              )}
              {executiveCoverage.pct2026 >= 80 && (
                <Badge className="text-[10px] gap-1 mt-1 bg-[hsl(var(--senior-green))]/15 text-[hsl(var(--senior-green))] border-0">
                  <CheckCircle className="w-3 h-3" /> Saudável
                </Badge>
              )}
            </div>
            {/* 2027 — manual */}
            <div className="rounded-xl border-2 p-5 flex flex-col items-center gap-2 relative" style={{ borderColor: '#7C3AED' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7C3AED' }}>2027</span>
              {editing2027 ? (
                <>
                  <div className="flex flex-col gap-2 w-full items-center">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className="w-16 h-8 text-center text-lg font-bold border rounded bg-background text-foreground"
                        placeholder="%"
                        value={edit2027Pct}
                        onChange={e => setEdit2027Pct(e.target.value)}
                      />
                      <span className="text-sm font-bold text-muted-foreground">%</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <input
                        type="number"
                        className="w-14 h-6 text-center text-xs border rounded bg-background text-foreground"
                        placeholder="Mapeados"
                        value={edit2027Mapped}
                        onChange={e => setEdit2027Mapped(e.target.value)}
                      />
                      <span>/</span>
                      <input
                        type="number"
                        className="w-14 h-6 text-center text-xs border rounded bg-background text-foreground"
                        placeholder="Total"
                        value={edit2027Total}
                        onChange={e => setEdit2027Total(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSave2027} disabled={saving2027}>
                      <Save className="w-3 h-3" /> {saving2027 ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing2027(false)}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : coverage2027.pct !== null ? (
                <>
                  <span className="text-4xl font-extrabold font-display tabular-nums" style={{ color: '#7C3AED' }}>
                    {coverage2027.pct}%
                  </span>
                  <span className="text-[11px] text-muted-foreground text-center">
                    {coverage2027.mapped ?? '—'} pessoas mapeadas / {coverage2027.total ?? '—'} posições
                  </span>
                  {coverage2027.pct < 50 && (
                    <Badge variant="destructive" className="text-[10px] gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Risco Alto
                    </Badge>
                  )}
                  {coverage2027.pct >= 50 && coverage2027.pct < 80 && (
                    <Badge className="text-[10px] gap-1 mt-1 bg-[hsl(var(--senior-yellow))]/15 text-[hsl(var(--senior-yellow))] border-0">
                      <AlertTriangle className="w-3 h-3" /> Atenção
                    </Badge>
                  )}
                  {coverage2027.pct >= 80 && (
                    <Badge className="text-[10px] gap-1 mt-1 bg-[hsl(var(--senior-green))]/15 text-[hsl(var(--senior-green))] border-0">
                      <CheckCircle className="w-3 h-3" /> Saudável
                    </Badge>
                  )}
                  {isMaster && (
                    <button
                      className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {
                        setEdit2027Pct(coverage2027.pct?.toString() ?? '');
                        setEdit2027Mapped(coverage2027.mapped?.toString() ?? '');
                        setEdit2027Total(coverage2027.total?.toString() ?? '');
                        setEditing2027(true);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground mt-2">Sem dados</span>
                  {isMaster && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 mt-2"
                      onClick={() => { setEdit2027Pct(''); setEdit2027Mapped(''); setEdit2027Total(''); setEditing2027(true); }}
                    >
                      <Pencil className="w-3 h-3" /> Preencher
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-3">
            Cobertura de posições (%) = Número de pessoas mapeadas com prontidão Imediato + 1 a 2 anos / Total de posições da empresa
          </p>
        </CardContent>
      </Card>
    ),
    pool_nivel_carreira: (
      <Card className="bg-card border border-border shadow-sm rounded-xl">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground">
              Pool por Nível de Carreira
              {selectedProntidoes.size > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px]">Filtro: {Array.from(selectedProntidoes).join(', ')}</Badge>
              )}
            </CardTitle>
            {canToggleOrder && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setTableInverted(prev => !prev)}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {tableInverted ? '2025 → 2026' : '2026 → 2025'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-3">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                {(() => {
                  const firstYear = tableInverted ? '2026' : '2025';
                  const secondYear = tableInverted ? '2025' : '2026';
                  const firstColor = tableInverted ? '#2AC4AA' : '#00958B';
                  const secondColor = tableInverted ? '#00958B' : '#2AC4AA';
                  const firstData = tableInverted ? coverageData2026 : coverageData2025;
                  const secondData = tableInverted ? coverageData2025 : coverageData2026;
                  return (
                    <>
                      <tr>
                        <th rowSpan={2} className="py-3 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px] bg-secondary/70 border-b border-border">Nível</th>
                        <th colSpan={3} className="py-2.5 px-3 text-center font-bold text-white uppercase tracking-wider text-[10px] border-b border-border" style={{ backgroundColor: firstColor }}>
                          {firstYear}
                        </th>
                        <th className="py-2.5 px-3 text-center font-bold text-white uppercase tracking-wider text-[10px] border-b border-border" style={{ backgroundColor: firstColor }}>
                          % Cobertura {firstYear}
                        </th>
                        <th className="py-2.5 px-3 text-center font-bold text-white uppercase tracking-wider text-[10px] border-b border-border" style={{ backgroundColor: secondColor }}>
                          % Cobertura {secondYear}
                        </th>
                        <th colSpan={3} className="py-2.5 px-3 text-center font-bold text-white uppercase tracking-wider text-[10px] border-b border-border" style={{ backgroundColor: secondColor }}>
                          {secondYear}
                        </th>
                      </tr>
                      <tr className="bg-secondary/40">
                        <th className="py-1.5 px-3 text-center text-[9px] text-muted-foreground font-semibold">Total</th>
                        <th className="py-1.5 px-3 text-center text-[9px] text-muted-foreground font-semibold">Pool</th>
                        <th className="py-1.5 px-3 text-center text-[9px] text-muted-foreground font-semibold">Sem Sucessor</th>
                        <th className="py-1.5 px-3"></th>
                        <th className="py-1.5 px-3"></th>
                        <th className="py-1.5 px-3 text-center text-[9px] text-muted-foreground font-semibold">Total</th>
                        <th className="py-1.5 px-3 text-center text-[9px] text-muted-foreground font-semibold">Pool</th>
                        <th className="py-1.5 px-3 text-center text-[9px] text-muted-foreground font-semibold">Sem Sucessor</th>
                      </tr>
                    </>
                  );
                })()}
              </thead>
              <tbody>
                {coverageData2026.map((d26, idx) => {
                  const d25 = coverageData2025[idx];
                  const first = tableInverted ? d26 : d25;
                  const second = tableInverted ? d25 : d26;
                  const firstYear: '2025' | '2026' = tableInverted ? '2026' : '2025';
                  const secondYear: '2025' | '2026' = tableInverted ? '2025' : '2026';

                  const handlePoolClick = (data: typeof d26 | typeof d25 | undefined, year: '2025' | '2026') => {
                    if (!data || data.pool === 0) return;
                    setPoolModalData({ nivel: d26.nivel, year, rows: data.poolDetails || [] });
                    setShowPoolModal(true);
                  };

                  const handleSemSucessorClick = (data: typeof d26 | typeof d25 | undefined, year: '2025' | '2026') => {
                    if (!data || data.semSucessor === 0) return;
                    setSemSucessorModalData({ nivel: d26.nivel, year, leaders: data.semSucessorLeaders || [] });
                    setShowSemSucessorModal(true);
                  };

                  return (
                    <tr key={d26.nivel} className="border-t border-border hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-foreground">{d26.nivel}</td>
                      {/* First year columns */}
                      <td className="py-3 px-3 text-center text-foreground font-semibold">{first?.total ?? 0}</td>
                      <td
                        className={`py-3 px-3 text-center font-semibold text-primary ${(first?.pool ?? 0) > 0 ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={() => handlePoolClick(first, firstYear)}
                      >
                        {first?.pool ?? 0}
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-semibold text-muted-foreground ${(first?.semSucessor ?? 0) > 0 ? 'cursor-pointer hover:underline hover:text-destructive' : ''}`}
                        onClick={() => handleSemSucessorClick(first, firstYear)}
                      >
                        {first?.semSucessor ?? 0}
                      </td>
                      {/* % Cobertura first year */}
                      <td className="py-3 px-3 text-center">
                        {(first?.pct ?? -1) === -1 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <Badge className={`text-[10px] min-w-[44px] justify-center font-bold border-0 ${getCoveragePctColor(first?.pct ?? 0)}`}>
                            {first?.pct}%
                          </Badge>
                        )}
                      </td>
                      {/* % Cobertura second year */}
                      <td className="py-3 px-3 text-center">
                        {(second?.pct ?? -1) === -1 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <Badge className={`text-[10px] min-w-[44px] justify-center font-bold border-0 ${getCoveragePctColor(second?.pct ?? 0)}`}>
                            {second?.pct}%
                          </Badge>
                        )}
                      </td>
                      {/* Second year columns */}
                      <td className="py-3 px-3 text-center text-foreground font-semibold">{second?.total ?? 0}</td>
                      <td
                        className={`py-3 px-3 text-center font-semibold text-primary ${(second?.pool ?? 0) > 0 ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={() => handlePoolClick(second, secondYear)}
                      >
                        {second?.pool ?? 0}
                      </td>
                      <td
                        className={`py-3 px-3 text-center font-semibold text-muted-foreground ${(second?.semSucessor ?? 0) > 0 ? 'cursor-pointer hover:underline hover:text-destructive' : ''}`}
                        onClick={() => handleSemSucessorClick(second, secondYear)}
                      >
                        {second?.semSucessor ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            % Cobertura = Número do Pool de Sucessores / Total de posições por nível
          </p>
        </CardContent>
      </Card>
    ),
    movimentacao_interna: (() => {
      const card2025 = (
        <div className="rounded-xl border-2 p-5 flex flex-col items-center gap-2 relative" style={{ borderColor: '#00958B' }}>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#00958B' }}>2025</span>
          {editingMovInt2025 ? (
            <>
              <div className="flex flex-col gap-2 w-full items-center">
                <div className="flex items-center gap-1">
                  <input type="number" className="w-16 h-8 text-center text-lg font-bold border rounded bg-background text-foreground" placeholder="%" value={editMovInt2025Pct} onChange={e => setEditMovInt2025Pct(e.target.value)} />
                  <span className="text-sm font-bold text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px]">Fechadas</span>
                    <input type="number" className="w-14 h-6 text-center text-xs border rounded bg-background text-foreground" placeholder="Total" value={editMovInt2025Fechadas} onChange={e => setEditMovInt2025Fechadas(e.target.value)} />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px]">Internos</span>
                    <input type="number" className="w-14 h-6 text-center text-xs border rounded bg-background text-foreground" placeholder="Internos" value={editMovInt2025Internos} onChange={e => setEditMovInt2025Internos(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSaveMovInt2025} disabled={savingMovInt2025}>
                  <Save className="w-3 h-3" /> {savingMovInt2025 ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingMovInt2025(false)}>Cancelar</Button>
              </div>
            </>
          ) : movInt2025.total_fechadas !== null ? (
            <>
              <span className="text-4xl font-extrabold font-display tabular-nums" style={{ color: '#00958B' }}>{movInt2025.pct !== null ? `${movInt2025.pct}%` : '—'}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground -mt-1">Atingido no Ano</span>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Total fechadas: <strong className="text-foreground">{movInt2025.total_fechadas ?? '—'}</strong></span>
                <span className="text-border">|</span>
                <span>Internos: <strong className="text-foreground">{movInt2025.internos ?? '—'}</strong></span>
              </div>
              {isMaster && (
                <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" onClick={() => { setEditMovInt2025Fechadas(movInt2025.total_fechadas?.toString() ?? ''); setEditMovInt2025Internos(movInt2025.internos?.toString() ?? ''); setEditMovInt2025Pct(movInt2025.pct?.toString() ?? ''); setEditingMovInt2025(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground mt-2">Sem dados</span>
              {isMaster && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 mt-2" onClick={() => { setEditMovInt2025Fechadas(''); setEditMovInt2025Internos(''); setEditMovInt2025Pct(''); setEditingMovInt2025(true); }}>
                  <Pencil className="w-3 h-3" /> Preencher
                </Button>
              )}
            </>
          )}
        </div>
      );

      const card2026 = (
        <div className="rounded-xl border-2 p-5 flex flex-col items-center gap-2 relative" style={{ borderColor: '#2AC4AA' }}>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2AC4AA' }}>2026</span>
          {editingMovInt2026 ? (
            <>
              <div className="flex flex-col gap-2 w-full items-center">
                <div className="flex items-center gap-1">
                  <input type="number" className="w-16 h-8 text-center text-lg font-bold border rounded bg-background text-foreground" placeholder="%" value={editMovInt2026Pct} onChange={e => setEditMovInt2026Pct(e.target.value)} />
                  <span className="text-sm font-bold text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px]">Fechadas</span>
                    <input type="number" className="w-14 h-6 text-center text-xs border rounded bg-background text-foreground" placeholder="Total" value={editMovInt2026Fechadas} onChange={e => setEditMovInt2026Fechadas(e.target.value)} />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px]">Internos</span>
                    <input type="number" className="w-14 h-6 text-center text-xs border rounded bg-background text-foreground" placeholder="Internos" value={editMovInt2026Internos} onChange={e => setEditMovInt2026Internos(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-muted-foreground">Meta (%)</span>
                  <input type="number" className="w-14 h-6 text-center text-xs border rounded bg-background text-foreground" placeholder="Meta" value={editMeta2026} onChange={e => setEditMeta2026(e.target.value)} />
                  <span className="text-[10px] text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" className="h-7 text-xs gap-1" onClick={async () => { await handleSaveMovInt2026(); await handleSaveMeta2026(); }} disabled={savingMovInt2026 || savingMeta2026}>
                  <Save className="w-3 h-3" /> {savingMovInt2026 || savingMeta2026 ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingMovInt2026(false); setEditingMeta2026(false); }}>Cancelar</Button>
              </div>
            </>
          ) : movInt2026.total_fechadas !== null ? (
            <>
              <span className="text-4xl font-extrabold font-display tabular-nums" style={{ color: '#2AC4AA' }}>{movInt2026.pct !== null ? `${movInt2026.pct}%` : '—'}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground -mt-1">Acumulado</span>
              {meta2026 !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border text-[10px] font-semibold text-muted-foreground -mt-1">
                  META: <span className="text-foreground">{meta2026}%</span>
                </span>
              )}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Total fechadas: <strong className="text-foreground">{movInt2026.total_fechadas ?? '—'}</strong></span>
                <span className="text-border">|</span>
                <span>Internos: <strong className="text-foreground">{movInt2026.internos ?? '—'}</strong></span>
              </div>
              {isMaster && (
                <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" onClick={() => {
                  setEditMovInt2026Fechadas(movInt2026.total_fechadas?.toString() ?? '');
                  setEditMovInt2026Internos(movInt2026.internos?.toString() ?? '');
                  setEditMovInt2026Pct(movInt2026.pct?.toString() ?? '');
                  setEditMeta2026(meta2026?.toString() ?? '');
                  setEditingMovInt2026(true);
                  setEditingMeta2026(true);
                }}>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground mt-2">Sem dados</span>
              {isMaster && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 mt-2" onClick={() => { setEditMovInt2026Fechadas(''); setEditMovInt2026Internos(''); setEditMovInt2026Pct(''); setEditMeta2026(''); setEditingMovInt2026(true); setEditingMeta2026(true); }}>
                  <Pencil className="w-3 h-3" /> Preencher
                </Button>
              )}
            </>
          )}
        </div>
      );

      const cards = movIntInverted ? [card2026, card2025] : [card2025, card2026];

      return (
        <Card className="bg-card border border-border shadow-sm rounded-xl">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[hsl(var(--senior-turquoise))]" />
                Movimentação Interna — Lideranças
              </CardTitle>
              {canToggleOrder && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setMovIntInverted(prev => !prev)}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  {movIntInverted ? '2025 → 2026' : '2026 → 2025'}
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Total de vagas de liderança fechadas e percentual de preenchimento com candidatos internos.
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {cards[0]}
              {cards[1]}
            </div>
            <p className="text-[10px] text-muted-foreground italic mt-3">
              Fórmula — Total fechamento Internos / Total Vagas fechadas (a diferença da fórmula para vagas gerais é que excluímos vagas de entrada em gerais)
            </p>
          </CardContent>
        </Card>
      );
    })(),
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blockOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {blockOrder.map(id => (
            <SortableBlock key={id} id={id} isMaster={isMaster}>
              {blockContent[id]}
            </SortableBlock>
          ))}

      {/* Footer — última atualização */}
      {lastUpdate && (
        <div className="flex justify-end pt-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            Última atualização: {lastUpdate}
          </span>
        </div>
      )}


      {/* Modal: leaders without successor */}
      <Dialog open={showRiskModal} onOpenChange={(open) => { setShowRiskModal(open); if (!open) { setModalDiretoria(ALL); setModalNivel(ALL); setModalSort({ col: 'diretoria', dir: 'asc' }); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Posições sem Sucessor Mapeado</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-3">
            <Select value={modalDiretoria} onValueChange={setModalDiretoria}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Todas Diretorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas Diretorias</SelectItem>
                {[...new Set(leadersWithoutSuccessor.map(l => l.diretoria).filter(Boolean))].sort().map(d => (
                  <SelectItem key={d!} value={d!} className="text-xs">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={modalNivel} onValueChange={setModalNivel}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Todos Níveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos Níveis</SelectItem>
                {[...new Set(leadersWithoutSuccessor.map(l => l.nivelCarreira).filter(Boolean))].sort().map(n => (
                  <SelectItem key={n!} value={n!} className="text-xs">{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="max-h-[60vh]">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/70">
                    {[
                      { key: 'nome', label: 'Líder' },
                      { key: 'nivelCarreira', label: 'Nível' },
                      { key: 'diretoria', label: 'Diretoria' },
                      { key: 'liderDoLider', label: 'Líder do Líder' },
                    ].map(col => (
                      <th
                        key={col.key}
                        className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => setModalSort(prev => prev.col === col.key ? { col: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col: col.key, dir: 'asc' })}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {modalSort.col === col.key ? (
                            modalSort.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          ) : (
                            <span className="w-3 h-3 opacity-0">↕</span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leadersWithoutSuccessor
                    .filter(l => modalDiretoria === ALL || l.diretoria === modalDiretoria)
                    .filter(l => modalNivel === ALL || l.nivelCarreira === modalNivel)
                    .sort((a, b) => {
                      const getValue = (l: Leader) => {
                        switch (modalSort.col) {
                          case 'nome': return l.nome || '';
                          case 'nivelCarreira': return l.nivelCarreira || '';
                          case 'diretoria': return l.diretoria || '';
                          case 'liderDoLider': return l.liderDoLider || '';
                          default: return '';
                        }
                      };
                      const cmp = getValue(a).localeCompare(getValue(b));
                      return modalSort.dir === 'asc' ? cmp : -cmp;
                    })
                    .map((l, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-semibold text-foreground">{l.nome}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{l.nivelCarreira || '—'}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{l.diretoria || '—'}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{l.liderDoLider || '—'}</td>
                    </tr>
                  ))}
                  {leadersWithoutSuccessor.filter(l => modalDiretoria === ALL || l.diretoria === modalDiretoria).filter(l => modalNivel === ALL || l.nivelCarreira === modalNivel).length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Nenhuma posição encontrada com os filtros selecionados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: positions with only Job Rotation */}
      <Dialog open={showJRModal} onOpenChange={(open) => { setShowJRModal(open); if (!open) { setJrModalDiretoria(ALL); setJrModalSort({ col: 'liderNome', dir: 'asc' }); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Posições com Somente Job Rotation</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-3">
            <Select value={jrModalDiretoria} onValueChange={setJrModalDiretoria}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder="Todas Diretorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas Diretorias</SelectItem>
                {[...new Set(jrModalRows.map(r => r.liderDiretoria).filter(d => d !== '—'))].sort().map(d => (
                  <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="max-h-[60vh]">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/70">
                    {[
                      { key: 'liderNome', label: 'Líder a ser sucedido' },
                      { key: 'liderCargo', label: 'Cargo' },
                      { key: 'liderDiretoria', label: 'Diretoria' },
                      { key: 'sucessorNome', label: 'Sucessor' },
                      { key: 'sucessorCargo', label: 'Cargo' },
                      { key: 'sucessorDiretoria', label: 'Diretoria' },
                    ].map(col => (
                      <th
                        key={col.key}
                        className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px] cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => setJrModalSort(prev => prev.col === col.key ? { col: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col: col.key, dir: 'asc' })}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {jrModalSort.col === col.key ? (
                            jrModalSort.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          ) : (
                            <span className="w-3 h-3 opacity-0">↕</span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jrModalRows
                    .filter(r => jrModalDiretoria === ALL || r.liderDiretoria === jrModalDiretoria)
                    .sort((a, b) => {
                      const va = (a as any)[jrModalSort.col] || '';
                      const vb = (b as any)[jrModalSort.col] || '';
                      const cmp = va.localeCompare(vb);
                      return jrModalSort.dir === 'asc' ? cmp : -cmp;
                    })
                    .map((r, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-semibold text-foreground">{r.liderNome}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.liderCargo}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.liderDiretoria}</td>
                      <td className="py-2.5 px-3 font-semibold text-foreground">{r.sucessorNome}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.sucessorCargo}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.sucessorDiretoria}</td>
                    </tr>
                  ))}
                  {jrModalRows.filter(r => jrModalDiretoria === ALL || r.liderDiretoria === jrModalDiretoria).length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Nenhuma posição encontrada com os filtros selecionados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: Pool de Sucessores detail */}
      <Dialog open={showPoolModal} onOpenChange={(open) => { setShowPoolModal(open); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Pool de Sucessores — {poolModalData.nivel} ({poolModalData.year})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/70">
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Sucessor</th>
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Pool</th>
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Líder a ser sucedido</th>
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Diretoria do Líder</th>
                  </tr>
                </thead>
                <tbody>
                  {poolModalData.rows
                    .sort((a, b) => a.sucessorNome.localeCompare(b.sucessorNome))
                    .map((r, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-semibold text-foreground">{r.sucessorNome}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.poolLevel}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.liderNome}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.liderDiretoria}</td>
                    </tr>
                  ))}
                  {poolModalData.rows.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Nenhum sucessor encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: Sem Sucessor detail */}
      <Dialog open={showSemSucessorModal} onOpenChange={setShowSemSucessorModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Posições Sem Sucessor — {semSucessorModalData.nivel} ({semSucessorModalData.year})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/70">
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Líder</th>
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Cargo</th>
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Diretoria</th>
                    <th className="py-2.5 px-3 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Líder do Líder</th>
                  </tr>
                </thead>
                <tbody>
                  {semSucessorModalData.leaders
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map((l, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-semibold text-foreground">{l.nome}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{l.cargo}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{l.diretoria}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{l.liderDoLider}</td>
                    </tr>
                  ))}
                  {semSucessorModalData.leaders.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Nenhuma posição encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
        </div>
      </SortableContext>
    </DndContext>
  );
}

function VariationIndicator({ current, previous, invertLogic = false }: { current: number; previous: number | null; invertLogic?: boolean }) {
  if (previous === null || previous === undefined) return null;
  const diff = current - previous;
  const isPositive = invertLogic ? diff < 0 : diff > 0;
  const isNegative = invertLogic ? diff > 0 : diff < 0;
  if (isPositive) {
    const icon = invertLogic ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />;
    return <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[hsl(var(--variation-positive))]">{icon}{invertLogic ? '' : '+'}{diff}</span>;
  }
  if (isNegative) {
    const icon = invertLogic ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
    return <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[hsl(var(--variation-negative))]">{icon}{invertLogic ? '+' : ''}{invertLogic ? Math.abs(diff) : diff}</span>;
  }
  return <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[hsl(var(--variation-neutral))]"><Minus className="w-3.5 h-3.5" />0</span>;
}
