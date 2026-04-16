import { useState, useCallback, useEffect, useRef } from 'react';
import { Leader } from '@/data/leaders';
import { EditableSuccessor } from './types';
import { supabase } from '@/integrations/supabase/client';

const PRONTIDAO_ORDER: Record<string, number> = {
  'Imediato': 0,
  'De 1 a 2 anos': 1,
  '1-2 anos': 1,
  'De 2 a 3 anos': 2,
  '2-3 anos': 2,
  'De 3 a 4 anos': 3,
  '3-4 anos': 3,
  'Job Rotation': 4,
  'Acompanhamento': 5,
};

function leaderKey(l: Leader): string {
  return `${l.cargo}|${l.nome}`;
}

function sortByProntidao(successors: EditableSuccessor[]): EditableSuccessor[] {
  return [...successors].sort((a, b) => {
    const orderA = a.prontidao ? (PRONTIDAO_ORDER[a.prontidao] ?? 99) : 99;
    const orderB = b.prontidao ? (PRONTIDAO_ORDER[b.prontidao] ?? 99) : 99;
    return orderA - orderB;
  });
}

interface ChangeLogEntry {
  leader_name: string;
  leader_cargo: string | null;
  change_type: string;
  successor_index: number | null;
  successor_previous_name: string | null;
  successor_new_name: string | null;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by_user_id: string;
  changed_by_name: string;
  base_id: string;
}

function diffSuccessors(
  original: EditableSuccessor[],
  edited: EditableSuccessor[],
  leader: Leader,
  userId: string,
  userName: string,
  baseId: string,
): ChangeLogEntry[] {
  const entries: ChangeLogEntry[] = [];
  const base = { leader_name: leader.nome, leader_cargo: leader.cargo, changed_by_user_id: userId, changed_by_name: userName, base_id: baseId };

  const maxLen = Math.max(original.length, edited.length);
  for (let i = 0; i < maxLen; i++) {
    const orig = original[i];
    const edit = edited[i];

    if (!orig && edit) {
      entries.push({ ...base, change_type: 'add', successor_index: i + 1, successor_previous_name: null, successor_new_name: edit.nome, field_changed: null, old_value: null, new_value: JSON.stringify({ nome: edit.nome, prontidao: edit.prontidao, comentario: edit.comentario }) });
    } else if (orig && !edit) {
      entries.push({ ...base, change_type: 'remove', successor_index: i + 1, successor_previous_name: orig.nome, successor_new_name: null, field_changed: null, old_value: JSON.stringify({ nome: orig.nome, prontidao: orig.prontidao, comentario: orig.comentario }), new_value: null });
    } else if (orig && edit) {
      if (orig.nome !== edit.nome) {
        entries.push({ ...base, change_type: 'modify', successor_index: i + 1, successor_previous_name: orig.nome, successor_new_name: edit.nome, field_changed: 'nome', old_value: orig.nome, new_value: edit.nome });
      }
      if (orig.prontidao !== edit.prontidao) {
        entries.push({ ...base, change_type: 'modify', successor_index: i + 1, successor_previous_name: orig.nome, successor_new_name: edit.nome || orig.nome, field_changed: 'prontidao', old_value: orig.prontidao, new_value: edit.prontidao });
      }
      if ((orig.comentario ?? '') !== (edit.comentario ?? '')) {
        entries.push({ ...base, change_type: 'modify', successor_index: i + 1, successor_previous_name: orig.nome, successor_new_name: edit.nome || orig.nome, field_changed: 'comentario', old_value: orig.comentario ?? '', new_value: edit.comentario ?? '' });
      }
    }
  }
  return entries;
}

export function useSuccessionEdits(baseId: string | null, profile: { auth_id: string; nome: string } | null) {
  const [dbEdits, setDbEdits] = useState<Record<string, EditableSuccessor[]>>({});
  const [loaded, setLoaded] = useState(false);
  const loadedBaseRef = useRef<string | null>(null);

  // Load edits from DB for current base
  useEffect(() => {
    if (!baseId) { setDbEdits({}); setLoaded(true); return; }
    if (loadedBaseRef.current === baseId) return;
    loadedBaseRef.current = baseId;

    (async () => {
      const { data } = await supabase
        .from('succession_map_edits')
        .select('leader_key, successors')
        .eq('base_id', baseId);

      const edits: Record<string, EditableSuccessor[]> = {};
      if (data) {
        for (const row of data) {
          edits[row.leader_key] = row.successors as unknown as EditableSuccessor[];
        }
      }
      setDbEdits(edits);
      setLoaded(true);
    })();
  }, [baseId]);

  const getSuccessors = useCallback((leader: Leader): EditableSuccessor[] => {
    const key = leaderKey(leader);
    if (dbEdits[key]) return sortByProntidao(dbEdits[key]);
    // Always return from the leader object (base data) — no localStorage
    return sortByProntidao((leader.sucessores || []).map(s => ({ ...s })));
  }, [dbEdits]);

  const saveSuccessors = useCallback(async (leader: Leader, successors: EditableSuccessor[]) => {
    if (!baseId || !profile) return;
    const key = leaderKey(leader);
    const sorted = sortByProntidao(successors);

    // Get original successors from base for diff
    const original = sortByProntidao((leader.sucessores || []).map(s => ({ ...s })));

    // Check if edit reverts to base — if so, remove the override
    const isRevert = JSON.stringify(sorted.map(s => ({ nome: s.nome, prontidao: s.prontidao, comentario: s.comentario ?? '' }))) ===
                     JSON.stringify(original.map(s => ({ nome: s.nome, prontidao: s.prontidao, comentario: (s as any).comentario ?? '' })));

    // Record change log
    const changes = diffSuccessors(original, sorted, leader, profile.auth_id, profile.nome, baseId);
    if (changes.length > 0) {
      await supabase.from('succession_map_change_log').insert(changes as any);
    }

    if (isRevert) {
      // Remove override — go back to base
      await supabase.from('succession_map_edits').delete().eq('leader_key', key).eq('base_id', baseId);
      setDbEdits(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      // Upsert override
      const { error } = await supabase.from('succession_map_edits').upsert(
        { leader_key: key, base_id: baseId, successors: sorted as any, updated_by: profile.auth_id, updated_at: new Date().toISOString() } as any,
        { onConflict: 'leader_key,base_id' }
      );
      if (!error) {
        setDbEdits(prev => ({ ...prev, [key]: sorted }));
      }
    }
  }, [baseId, profile]);

  return { getSuccessors, saveSuccessors, loaded };
}
