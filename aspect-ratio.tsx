import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface ChangeLogRow {
  leader_name: string;
  leader_cargo: string | null;
  change_type: string;
  successor_index: number | null;
  successor_previous_name: string | null;
  successor_new_name: string | null;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by_name: string;
  changed_at: string;
}

function formatChangeType(t: string): string {
  if (t === 'add') return 'Inclusão';
  if (t === 'remove') return 'Remoção';
  if (t === 'modify') return 'Alteração';
  return t;
}

function formatField(f: string | null): string {
  if (!f) return '';
  if (f === 'nome') return 'Sucessor';
  if (f === 'prontidao') return 'Prontidão';
  if (f === 'comentario') return 'Comentário';
  return f;
}

export async function exportSuccessionChanges(baseId: string) {
  const { data, error } = await supabase
    .from('succession_map_change_log')
    .select('*')
    .eq('base_id', baseId)
    .order('changed_at', { ascending: true });

  if (error) throw error;

  const rows = (data as ChangeLogRow[]).map(row => {
    const dt = new Date(row.changed_at);
    return {
      'Líder': row.leader_name,
      'Cargo do Líder': row.leader_cargo ?? '',
      'Tipo de Alteração': formatChangeType(row.change_type),
      'Posição (Indicado)': row.successor_index ?? '',
      'Sucessor Anterior': row.successor_previous_name ?? '',
      'Sucessor Novo': row.successor_new_name ?? '',
      'Campo Alterado': formatField(row.field_changed),
      'Valor Anterior': row.old_value ?? '',
      'Valor Novo': row.new_value ?? '',
      'Usuário': row.changed_by_name,
      'Data': dt.toLocaleDateString('pt-BR'),
      'Hora': dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{}]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Alterações Mapa de Sucessão');
  XLSX.writeFile(wb, 'alteracoes_mapa_sucessao.xlsx');
}
