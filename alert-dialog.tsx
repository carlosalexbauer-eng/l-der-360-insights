import { useState } from 'react';
import { Leader } from '@/data/leaders';
import { EditableSuccessor } from './types';
import { SuccessorAutocomplete } from './SuccessorAutocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { X, AlertTriangle } from 'lucide-react';
import { normalizeProntidao } from '@/lib/scoring';

const PRONTIDAO_OPTIONS = ['Imediato', 'De 1 a 2 anos', 'De 2 a 3 anos', 'De 3 a 4 anos', 'Job Rotation', 'Acompanhamento'];

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

const NON_LEADER_LEVELS = ['P1','P2','P3','P4','S1','S2','S3','S4','T2','T3','U1','U2'];

function isNonLeaderLevel(nivel: string | null | undefined): boolean {
  if (!nivel) return false;
  return NON_LEADER_LEVELS.includes(nivel.toUpperCase());
}

function isSuccessorInactive(s: EditableSuccessor): boolean {
  if (!s.status) return false;
  return s.status.toLowerCase().includes('inativo') || s.status.toLowerCase().includes('desligado');
}

interface Props {
  index: number;
  successor: EditableSuccessor;
  allLeaders: Leader[];
  excludeNames: string[];
  onChange: (updated: EditableSuccessor) => void;
  onRemove: () => void;
  leaderNivel?: string | null;
}

export function SuccessorEditBlock({ index, successor, allLeaders, excludeNames, onChange, onRemove, leaderNivel }: Props) {
  const nonLeader = isNonLeaderLevel(successor.nivelCarreira);
  const inactive = isSuccessorInactive(successor);

  // For non-leader successors, find the immediate leader's CR
  const immLeader = nonLeader && successor.liderImediato
    ? allLeaders.find(l => l.nome.toLowerCase() === successor.liderImediato!.toLowerCase())
    : null;
  const displayCr2026 = nonLeader ? (immLeader?.cr2026 ?? null) : (successor.cr2026 ?? null);
  const displayCr2025 = nonLeader ? (immLeader?.cr2025 ?? null) : (successor.cr2025 ?? null);

  // Filter prontidão options: Job Rotation only if same level as leader
  const prontidaoOptions = PRONTIDAO_OPTIONS.filter(opt => {
    if (opt === 'Job Rotation') {
      if (!successor.nivelCarreira || !leaderNivel) return false;
      return successor.nivelCarreira.toUpperCase() === leaderNivel.toUpperCase();
    }
    return true;
  });

  const handleSelect = (leader: Leader) => {
    let cr2025: number | null = leader.cr2025 ?? null;
    let cr2026: number | null = leader.cr2026 ?? null;
    let enps2025: number | null = leader.moods2025 ?? null;
    let enps2026: number | null = leader.moods2026 ?? null;
    let ultimoQuadrante: string | null = leader.ultimoQuadrante ?? null;
    let penultimoQuadrante: string | null = (leader as any).penultimoQuadrante ?? null;
    let liderImediato: string | null = null;

    for (const l of allLeaders) {
      for (const s of (l as any).sucessores || []) {
        if (s.nome && s.nome.toLowerCase() === leader.nome.toLowerCase()) {
          if (s.liderImediato) liderImediato = s.liderImediato;
          break;
        }
      }
    }

    const isLeaderLevel = !isNonLeaderLevel(leader.nivelCarreira);
    let prontidao = successor.prontidao;
    if (isLeaderLevel && leader.nivelCarreira && leaderNivel &&
        leader.nivelCarreira.toUpperCase() === leaderNivel.toUpperCase()) {
      prontidao = 'Job Rotation';
    }

    onChange({
      nome: leader.nome,
      cargo: leader.cargo,
      nivelCarreira: leader.nivelCarreira,
      prontidao,
      status: leader.situacao,
      diretoria: leader.diretoria,
      ultimoQuadrante,
      penultimoQuadrante,
      enps2025,
      enps2026,
      cr2025,
      cr2026,
      liderImediato,
    });
  };

  const handleProntidao = (val: string) => {
    // If auto Job Rotation applies, don't allow changing
    const isLeaderLevel = !isNonLeaderLevel(successor.nivelCarreira);
    if (isLeaderLevel && successor.nivelCarreira && leaderNivel &&
        successor.nivelCarreira.toUpperCase() === leaderNivel.toUpperCase()) {
      return; // Auto Job Rotation, ignore manual change
    }
    onChange({ ...successor, prontidao: val });
  };

  return (
    <div className={`border rounded-md p-2.5 space-y-2 ${inactive ? 'border-[hsl(var(--senior-pink))] bg-[hsl(var(--senior-pink))]/5' : 'border-border/50 bg-muted/10'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Sucessor {index + 1}</span>
          {inactive && (
            <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5 gap-0.5">
              <AlertTriangle className="w-2 h-2" />
              Inativo
            </Badge>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 min-h-[44px] min-w-[44px] -m-2">
              <X className="w-3 h-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover sucessor?</AlertDialogTitle>
              <AlertDialogDescription>
                {successor.nome ? `Tem certeza que deseja remover "${successor.nome}" como sucessor?` : 'Tem certeza que deseja remover este sucessor?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {inactive && (
        <p className="text-[9px] text-[hsl(var(--senior-pink))] font-medium">
          Não é possível salvar um sucessor inativo. Remova ou substitua esse sucessor.
        </p>
      )}

      <SuccessorAutocomplete
        allLeaders={allLeaders}
        value={successor.nome || ''}
        excludeNames={excludeNames}
        onSelect={handleSelect}
      />

      {successor.nome && (
        <>
          <div className="text-[10px] text-muted-foreground">{successor.cargo}</div>

          {/* Auto-populated indicators */}
          {nonLeader && (
            <p className="text-[9px] text-muted-foreground italic">
              CR referência do líder imediato{successor.liderImediato ? ` (${successor.liderImediato})` : ''}
            </p>
          )}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/20">
                <th className="py-1 px-2 text-left text-[10px] font-semibold text-muted-foreground uppercase">Ano</th>
                <th className="py-1 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">9Box</th>
                <th className="py-1 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">{nonLeader ? 'CR (líder)' : 'CR'}</th>
                <th className="py-1 px-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">eNPS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1 px-2 text-xs font-medium">2026</td>
                <td className="py-1 px-2 text-xs text-center">{getQuadranteShort(successor.ultimoQuadrante)}</td>
                <td className="py-1 px-2 text-xs text-center">{displayCr2026 != null ? `${Math.round(displayCr2026 * 100)}%` : '—'}</td>
                <td className="py-1 px-2 text-xs text-center">{successor.enps2026 != null ? Math.round(successor.enps2026) : '—'}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-xs font-medium">2025</td>
                <td className="py-1 px-2 text-xs text-center">{getQuadranteShort(successor.penultimoQuadrante ?? null)}</td>
                <td className="py-1 px-2 text-xs text-center">{displayCr2025 != null ? `${Math.round(displayCr2025 * 100)}%` : '—'}</td>
                <td className="py-1 px-2 text-xs text-center">{successor.enps2025 != null ? Math.round(successor.enps2025) : '—'}</td>
              </tr>
            </tbody>
          </table>

          {/* Prontidão select - disabled if inactive */}
          {!inactive && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Prontidão *</label>
              {(() => {
                const isLeaderLevel = !isNonLeaderLevel(successor.nivelCarreira);
                const autoJobRotation = isLeaderLevel && successor.nivelCarreira && leaderNivel &&
                  successor.nivelCarreira.toUpperCase() === leaderNivel.toUpperCase();
                if (autoJobRotation) {
                  return (
                    <div className="h-7 flex items-center px-2 text-xs rounded-md border border-border bg-muted/30 text-muted-foreground">
                      Job Rotation (automático — mesmo nível)
                    </div>
                  );
                }
                return (
                  <Select value={successor.prontidao || ''} onValueChange={handleProntidao}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {prontidaoOptions.map(opt => (
                        <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>
          )}

          {/* Comment field */}
          {!inactive && successor.nome && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">
                Comentário {normalizeProntidao(successor.prontidao) === 'Acompanhamento' ? '*' : ''}
              </label>
              <Textarea
                value={successor.comentario || ''}
                onChange={e => onChange({ ...successor, comentario: e.target.value })}
                placeholder={normalizeProntidao(successor.prontidao) === 'Acompanhamento'
                  ? 'Obrigatório para prontidão Acompanhamento...'
                  : 'Comentário opcional...'}
                className="min-h-[48px] text-xs resize-none"
                rows={2}
              />
              {normalizeProntidao(successor.prontidao) === 'Acompanhamento' && !successor.comentario?.trim() && (
                <p className="text-[9px] text-[hsl(var(--senior-pink))] font-medium mt-0.5">
                  Comentário obrigatório para prontidão Acompanhamento
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
