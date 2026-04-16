import { useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Database, FileSpreadsheet, Download, Eye, Edit3, Save, X, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as XLSX from 'xlsx';

/** Normalize column name */
function normalizeColName(name: string): string {
  return name.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function buildColLookup(row: Record<string, unknown>): Map<string, string> {
  const map = new Map<string, string>();
  for (const key of Object.keys(row)) {
    map.set(normalizeColName(key), key);
  }
  return map;
}

function findCol(lookup: Map<string, string>, row: Record<string, unknown>, ...candidates: string[]): unknown {
  for (const c of candidates) {
    const norm = normalizeColName(c);
    const key = lookup.get(norm);
    if (key !== undefined && row[key] !== undefined) return row[key];
  }
  for (const c of candidates) {
    const parts = normalizeColName(c).split(' ').filter(p => p.length > 3);
    for (const [normKey, origKey] of lookup) {
      if (parts.length > 0 && parts.every(p => normKey.includes(p))) {
        if (row[origKey] !== undefined) return row[origKey];
      }
    }
  }
  return null;
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '' || v === '**') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

function toStr(v: unknown): string | null {
  if (v === null || v === undefined || v === '**') return null;
  const s = String(v).trim();
  return s || null;
}

function isInvalidName(name: string | null): boolean {
  if (!name) return true;
  const t = name.trim();
  if (!t || t === '**' || t.toUpperCase() === 'SEM INDICAÇÃO') return true;
  return false;
}

function parseExcelToLeaders(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
  if (rows.length === 0) return [];

  const sampleLookup = buildColLookup(rows[0] as Record<string, unknown>);

  // Debug: log available columns related to quadrante/leadership review
  const quadranteKeys = [...sampleLookup.entries()].filter(([k]) => k.includes('quadrante') || k.includes('leadership') || k.includes('review'));
  console.log('[DataUpload] Colunas de quadrante encontradas:', quadranteKeys.map(([norm, orig]) => `"${orig}" → normalized: "${norm}"`));
  
  // Debug: show first row quadrant values
  const testRow = rows[0] as Record<string, unknown>;
  const testPQ = findCol(sampleLookup, testRow, 'Último quadrante Leadership Review (2025/ I)', 'Último quadrante Leadership Review (2025/I)', 'Quadrante Leadership Review 2025', 'Penúltimo quadrante Leadership Review', 'Penúltimo quadrante Leadership Review (2023/II ou 2024/I)', 'Quadrante Leadership Review (2025/ I)', 'Quadrante Leadership Review (2025/I)');
  const testUQ = findCol(sampleLookup, testRow, 'Último quadrante Leadership Review 2026', 'Quadrante Leadership Review 2026', 'Último Quadrante', 'Último quadrante Leadership Review', 'Quadrante Leadership Review');
  console.log('[DataUpload] Primeiro registro - penultimoQuadrante:', testPQ, '| ultimoQuadrante:', testUQ);

  return rows.map(row => {
    const lookup = sampleLookup;

    const leader: Record<string, unknown> = {
      nome: toStr(findCol(lookup, row, 'Líder', 'Nome')),
      cadastro: toNum(findCol(lookup, row, 'Cadastro')),
      sexo: toStr(findCol(lookup, row, 'Sexo')),
      situacao: toStr(findCol(lookup, row, 'Situação do líder', 'Situação')),
      liderDoLider: toStr(findCol(lookup, row, 'Líder do Líder')),
      cargo: toStr(findCol(lookup, row, 'Cargo')),
      filial: toStr(findCol(lookup, row, 'Filial')),
      diretoria: toStr(findCol(lookup, row, 'Diretoria')),
      ligacaoCE: toStr(findCol(lookup, row, 'Direto ou indireto do CE, CE', 'Ligação CE')),
      nivelCarreira: toStr(findCol(lookup, row, 'Nível de carreira', 'Nível de Carreira')),
      dataAdmissao: toStr(findCol(lookup, row, 'Data Admissão', 'Data de Admissão')),
      dataAdmissaoOriginal: toStr(findCol(lookup, row, 'Data de admissão Original')),
      dataLider: toStr(findCol(lookup, row, 'Data que virou líder na Senior', 'Data de Líder')),
      primeiraLideranca: toStr(findCol(lookup, row, 'É a primeira liderança na Senior', 'Primeira Liderança')),
      comoSetornouLider: toStr(findCol(lookup, row, 'Como se tornou líder na Senior')),
      origemLiderPosicao: toStr(findCol(lookup, row, 'Origem do líder na posição')),
      origemLiderPosicaoMacro: toStr(findCol(lookup, row, 'Origem do líder na posição (macro)')),
      dataInicioCargoAtual: toStr(findCol(lookup, row, 'Data de início no cargo atual')),
      qtdDiretos: toNum(findCol(lookup, row, 'Qtde de colabs diretos no time 2025', 'Qtde de colabs diretos', 'Qtd diretos')),
      qtdIndiretos: toNum(findCol(lookup, row, 'Qtde de colabs indiretos no time 2025', 'Qtde de colabs indiretos', 'Qtd indiretos')),
      admissoes2025: toNum(findCol(lookup, row, 'Admissões 2025')),
      penultimoQuadrante: toStr(findCol(lookup, row, 'Último quadrante Leadership Review (2025/ I)', 'Último quadrante Leadership Review (2025/I)', 'Quadrante Leadership Review 2025', 'Penúltimo quadrante Leadership Review', 'Penúltimo quadrante Leadership Review (2023/II ou 2024/I)', 'Quadrante Leadership Review (2025/ I)', 'Quadrante Leadership Review (2025/I)')),
      ultimoQuadrante: toStr(findCol(lookup, row, 'Último quadrante Leadership Review 2026', 'Quadrante Leadership Review 2026', 'Último Quadrante', 'Último quadrante Leadership Review', 'Quadrante Leadership Review')),
      conceitoFinal2024: toStr(findCol(lookup, row, 'Avaliação de competências: Conceito final 2024', 'Conceito Final 2024')),
      conceitoFocoLiderado2024: toStr(findCol(lookup, row, 'Avaliação de competências: Conceito foco liderado: 2024')),
      cr2024: toNum(findCol(lookup, row, 'Atingimento Contrato de Resultados 2024 (sem mapa estratégico)', 'CR 2024')),
      cr2025: toNum(findCol(lookup, row, 'Atingimento Contrato de Resultados 2025 (sem mapa estratégico)', 'CR 2025')),
      cr2026: toNum(findCol(lookup, row, 'Atingimento Contrato de Resultados 2026 (sem mapa estratégico)', 'CR 2026')),
      desejoCarreira2025: toStr(findCol(lookup, row, 'Desejo de carreira 2025')),
      mapeadoSucessor2024: toStr(findCol(lookup, row, 'Mapeado como potencial sucessor 2024')),
      mapeadoSucessor2025: toStr(findCol(lookup, row, 'Mapeado como potencial sucessor 2025')),
      enps2024: toNum(findCol(lookup, row, 'GPTW: ENPS 2024', 'eNPS 2024')),
      enps2025: toNum(findCol(lookup, row, 'GPTW: ENPS 2025', 'eNPS 2025')),
      lnps2025: toNum(findCol(lookup, row, 'GPTW: LNPS 2025', 'lNPS 2025')),
      estagioLideranca2024: toStr(findCol(lookup, row, 'GPTW: Estágio da Liderança 2024')),
      estagioLideranca2025: toStr(findCol(lookup, row, 'GPTW: Estágio da Liderança 2025', 'Estágio de Liderança 2025')),
      moods2024: toNum(findCol(lookup, row, 'MOODS: ENPS Visão Gestor Média 2024', 'MOODS ENPS Visão Gestor Média 2024')),
      moods2025: toNum(findCol(lookup, row, 'MOODS: ENPS Visão Gestor Média 2025', 'MOODS ENPS Visão Gestor Média 2025')),
      moods2026: toNum(findCol(lookup, row, 'MOODS: ENPS Visão Gestor Média 2026', 'MOODS ENPS Visão Gestor Média 2026')),
      feedback2024: toNum(findCol(lookup, row, '% de atingimento da meta de Registrar no HCM 3 Feedbacks por colaborador em 2024')),
      feedback2025: toNum(findCol(lookup, row, '% de atingimento da meta de Registrar no HCM 3 Feedbacks por colaborador em 20252', '% de atingimento da meta de Registrar no HCM 3 Feedbacks por colaborador em 2025')),
      turnoverColab2024: toNum(findCol(lookup, row, '%Desl. Colab/ Headcount 2024')),
      turnoverColab2025: toNum(findCol(lookup, row, '%Desl. Colab/ Headcount 2025', '%Desl. Colab/ Headcount 2026')),
      turnoverEmpresa2024: toNum(findCol(lookup, row, '%Desl. empresa/ Headcount 2024')),
      turnoverEmpresa2025: toNum(findCol(lookup, row, '%Desl. empresa/ Headcount 2025', '%Desl. empresa/ Headcount 2026')),
      pesqDesligEmpresaEnps2024: toNum(findCol(lookup, row, 'Pesquisa de desligamento Iniciativa empresa: ENPS 2024')),
      pesqDesligEmpresaEnps2025: toNum(findCol(lookup, row, 'Pesquisa de desligamento Iniciativa empresa: ENPS 2025')),
      pesqDesligColabEnps2024: toNum(findCol(lookup, row, 'Pesquisa de desligamento Iniciativa colab: ENPS 2024')),
      pesqDesligColabEnps2025: toNum(findCol(lookup, row, 'Pesquisa de desligamento Iniciativa colab: ENPS 2025')),
      calibradoCE: toStr(findCol(lookup, row, 'CALIBRADO PELO CE 2026', 'Calibrado pelo CE 2026', 'Calibrado CE 2026')),
      calibradoCE2025: toStr(findCol(lookup, row, 'CALIBRADO PELO CE 2025', 'Calibrado pelo CE 2025', 'Calibrado CE 2025')),
      comentarioSituacao: toStr(findCol(lookup, row, 'Comentário Situação do Líder', 'Comentário situação do líder')),
    };

    const sucessores: Record<string, unknown>[] = [];
    for (let i = 1; i <= 4; i++) {
      const nome = toStr(findCol(lookup, row, `Nome do indicado ${i}`));
      if (isInvalidName(nome)) continue;
      sucessores.push({
        nome,
        cadastro: toNum(findCol(lookup, row, `Cadastro do indicado ${i}`)),
        cargo: toStr(findCol(lookup, row, `Cargo atual do indicado ${i}`)),
        nivelCarreira: toStr(findCol(lookup, row, `Nível de Carreira do indicado ${i}`)),
        nivelCarreiraPool: toStr(findCol(lookup, row, `Indicado ${i} para o Pool`)),
        tempoNoCargo: toStr(findCol(lookup, row, `Tempo no cargo atual do indicado ${i}`)),
        liderImediato: toStr(findCol(lookup, row, `Líder Imediato do indicado ${i}`)),
        prontidao: toStr(findCol(lookup, row, `Prontidão do indicado ${i}`)),
        penultimoQuadrante: toStr(findCol(lookup, row, `Penúltimo Quadrante Leadership Review do indicado ${i}`)),
        ultimoQuadrante: toStr(findCol(lookup, row, `Último Quadrante Leadership Review do indicado ${i}`)),
        enps2024: toNum(findCol(lookup, row, `Média eNPS 2024 do indicado ${i}`)),
        enps2025: toNum(findCol(lookup, row, `Média eNPS 2025 do indicado ${i}`)),
        enps2026: toNum(findCol(lookup, row, `Média eNPS 2026 do indicado ${i}`)),
        cr2024: toNum(findCol(lookup, row, `Atingimento CR 2024 do indicado ${i}`, `Atingimento CR 2024  do indicado ${i}`)),
        cr2025: toNum(findCol(lookup, row, `Atingimento CR 2025 do indicado ${i}`)),
        cr2026: toNum(findCol(lookup, row, `Atingimento CR 2026 do indicado ${i}`)),
        diretoria: toStr(findCol(lookup, row, `Diretoria do indicado ${i}`)),
        status: toStr(findCol(lookup, row, `Status do indicado ${i}`)),
        anoIndicacao: toStr(findCol(lookup, row, `Ano da indicação ${i}`)),
      });
    }
    leader.sucessores = sucessores;
    return leader;
  });
}

type BaseType = 'main' | 'historical' | 'collaborators';

interface BaseBlockProps {
  type: BaseType;
  title: string;
  description: string;
  profile: any;
}

function BaseBlock({ type, title, description, profile }: BaseBlockProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tableData, setTableData] = useState<Record<string, unknown>[] | null>(null);
  const [editedData, setEditedData] = useState<Record<string, unknown>[] | null>(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  const tableName = type === 'main' ? 'leaders_data' : type === 'historical' ? 'leaders_data_historical' : 'collaborators_data';

  const fetchLastUpdate = useCallback(async () => {
    const { data } = await supabase
      .from(tableName as any)
      .select('uploaded_at')
      .eq('is_active', true)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setLastUpdate((data as any).uploaded_at);
  }, [tableName]);

  useState(() => { fetchLastUpdate(); });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });

      let dataToStore: any;
      if (type === 'main') {
        dataToStore = parseExcelToLeaders(wb);
        if (dataToStore.length === 0) {
          toast({ title: 'Erro', description: 'Nenhum dado encontrado.', variant: 'destructive' });
          setUploading(false);
          return;
        }
      } else {
        // Historical: store raw rows
        const sheet = wb.Sheets[wb.SheetNames[0]];
        dataToStore = XLSX.utils.sheet_to_json(sheet, { defval: null });
        if (dataToStore.length === 0) {
          toast({ title: 'Erro', description: 'Nenhum dado encontrado.', variant: 'destructive' });
          setUploading(false);
          return;
        }
      }

      // Deactivate previous
      await supabase.from(tableName as any).update({ is_active: false } as any).eq('is_active', true);

      const { error } = await supabase.from(tableName as any).insert({
        data: dataToStore,
        uploaded_by: profile?.id,
        is_active: true,
      } as any);
      if (error) throw error;

      if (type === 'main') {
        const now = new Date().toISOString();
        await supabase.from('system_metadata').update({
          value: { timestamp: now, updated_by: profile?.nome } as any,
          updated_at: now,
          updated_by: profile?.id,
        }).eq('key', 'last_update');
        queryClient.invalidateQueries({ queryKey: ['leaders-data'] });
      }

      toast({ title: 'Base atualizada!', description: `${dataToStore.length} registros carregados.` });
      fetchLastUpdate();
      setTableData(null);
      setEditedData(null);
      setShowTable(false);
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const loadTable = async () => {
    setLoadingTable(true);
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('id, data')
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data && (data as any).data) {
        const rows = (data as any).data as Record<string, unknown>[];
        // Flatten successors for main base display
        const flatRows = type === 'main'
          ? rows.map((r: any) => {
              const { sucessores, ...rest } = r;
              return rest;
            })
          : rows;
        setTableData(flatRows);
        setEditedData(JSON.parse(JSON.stringify(flatRows)));
        setRecordId((data as any).id);
        setShowTable(true);
      } else {
        toast({ title: 'Sem dados', description: 'Nenhuma base encontrada.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
    setLoadingTable(false);
  };

  const handleSave = async () => {
    if (!editedData || !recordId) return;
    setSaving(true);
    try {
      // If main, we need to re-attach successors
      let finalData = editedData;
      if (type === 'main' && tableData) {
        const { data: origRec } = await supabase
          .from('leaders_data')
          .select('data')
          .eq('id', recordId)
          .single();
        if (origRec?.data) {
          const origRows = origRec.data as any[];
          finalData = editedData.map((editedRow: any, idx: number) => {
            const orig = origRows[idx];
            return { ...editedRow, sucessores: orig?.sucessores || [] };
          });
        }
      }

      const { error } = await supabase
        .from(tableName as any)
        .update({ data: finalData } as any)
        .eq('id', recordId);
      if (error) throw error;

      setTableData(JSON.parse(JSON.stringify(editedData)));
      setEditing(false);
      toast({ title: 'Salvo!', description: 'Alterações salvas com sucesso.' });

      if (type === 'main') {
        queryClient.invalidateQueries({ queryKey: ['leaders-data'] });
      }
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditedData(JSON.parse(JSON.stringify(tableData)));
    setEditing(false);
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('data')
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data || !(data as any).data) {
        toast({ title: 'Sem dados', description: 'Nenhuma base para baixar.', variant: 'destructive' });
        return;
      }
      const rows = (data as any).data as any[];
      const flatRows = type === 'main'
        ? rows.map((r: any) => { const { sucessores, ...rest } = r; return rest; })
        : rows;

      const ws = XLSX.utils.json_to_sheet(flatRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      XLSX.writeFile(wb, `${type === 'main' ? 'base_principal' : 'base_historica_2025'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const columns = useMemo(() => {
    if (!editedData || editedData.length === 0) return [];
    return Object.keys(editedData[0]);
  }, [editedData]);

  const handleCellChange = (rowIdx: number, col: string, value: string) => {
    if (!editedData) return;
    const updated = [...editedData];
    updated[rowIdx] = { ...updated[rowIdx], [col]: value || null };
    setEditedData(updated);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center">
          <FileSpreadsheet className="w-8 h-8 text-primary/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-3">Selecione um arquivo Excel (.xlsx) ou CSV</p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="gap-1.5"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? 'Processando...' : 'Subir base'}
          </Button>
        </div>

        {/* Last update */}
        {lastUpdate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Última atualização: {new Date(lastUpdate).toLocaleString('pt-BR')}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={loadTable} disabled={loadingTable}>
            {loadingTable ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
            Visualizar tabela
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
            Baixar base atualizada
          </Button>
        </div>

        {/* Table dialog */}
        <Dialog open={showTable} onOpenChange={setShowTable}>
          <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-8">
                <span>{title}</span>
                <div className="flex gap-2">
                  {!editing ? (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(true)}>
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="default" className="gap-1.5" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Salvar alterações
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCancel}>
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(90vh-120px)] w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-muted">
                        <th className="px-2 py-1.5 border border-border text-left font-medium text-muted-foreground whitespace-nowrap">#</th>
                        {columns.map(col => (
                          <th key={col} className="px-2 py-1.5 border border-border text-left font-medium text-muted-foreground whitespace-nowrap max-w-[200px]" title={col}>
                            {col.length > 25 ? col.slice(0, 22) + '...' : col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {editedData?.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-muted/30">
                          <td className="px-2 py-1 border border-border text-muted-foreground">{rowIdx + 1}</td>
                          {columns.map(col => (
                            <td key={col} className="px-0 py-0 border border-border">
                              {editing ? (
                                <input
                                  className="w-full px-2 py-1 text-xs bg-transparent border-none outline-none focus:bg-primary/5 min-w-[80px]"
                                  value={row[col] != null ? String(row[col]) : ''}
                                  onChange={e => handleCellChange(rowIdx, col, e.target.value)}
                                />
                              ) : (
                                <span className="px-2 py-1 block truncate max-w-[200px]" title={row[col] != null ? String(row[col]) : ''}>
                                  {row[col] != null ? String(row[col]) : ''}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function DataUpload() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <BaseBlock
        type="main"
        title="Base Principal"
        description="Base que alimenta todas as visões do dashboard (Sucessão, Liderança, Mapa)."
        profile={profile}
      />
      <BaseBlock
        type="historical"
        title="Base Histórica 2025"
        description="Base de dados históricos de 2025 para comparações e análises de evolução."
        profile={profile}
      />
      <BaseBlock
        type="collaborators"
        title="Base de Colaboradores"
        description="Base completa de colaboradores para enriquecimento de dados de sucessores (ex: tempo no cargo)."
        profile={profile}
      />
    </div>
  );
}
