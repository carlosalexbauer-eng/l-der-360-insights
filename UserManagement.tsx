import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { Leader } from '@/data/leaders';
import { useLeadersData } from '@/hooks/useLeadersData';
import { calcSuccessionScore, calcLeadershipScore, getSuccessionStatus, normalizeProntidao } from '@/lib/scoring';

const SUGGESTIONS = [
  'Quais posições não possuem sucessores?',
  'Quais diretorias têm maior risco de sucessão?',
  'Quais sucessores estão prontos agora?',
  'Resuma a qualidade do pipeline de sucessão.',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function isValidSuccessorName(name: string | null | undefined): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  if (!trimmed || trimmed.toUpperCase() === 'SEM INDICAÇÃO' || trimmed === '**') return false;
  return true;
}

function answerQuestion(question: string, leaders: Leader[]): string {
  const q = question.toLowerCase().trim();

  // Positions without successors
  if (q.includes('não possuem sucessor') || q.includes('sem sucessor') || q.includes('gap')) {
    const noSuccessor = leaders.filter(l =>
      !l.sucessores || l.sucessores.length === 0 ||
      l.sucessores.every(s => !isValidSuccessorName(s.nome))
    );
    if (noSuccessor.length === 0) return 'Todas as posições possuem ao menos um sucessor mapeado. ✅';
    const list = noSuccessor.slice(0, 10).map(l => `• **${l.nome}** — ${l.cargo}`).join('\n');
    const extra = noSuccessor.length > 10 ? `\n\n...e mais ${noSuccessor.length - 10} posições.` : '';
    return `**${noSuccessor.length} posições** não possuem sucessores mapeados (${Math.round(noSuccessor.length / leaders.length * 100)}% do total):\n\n${list}${extra}`;
  }

  // Directors with highest succession risk
  if (q.includes('diretoria') && (q.includes('risco') || q.includes('maior'))) {
    const dirMap = new Map<string, { total: number; gap: number }>();
    leaders.forEach(l => {
      const dir = l.diretoria || 'Sem diretoria';
      const entry = dirMap.get(dir) || { total: 0, gap: 0 };
      entry.total++;
      const status = getSuccessionStatus(l);
      if (status === 'gap') entry.gap++;
      dirMap.set(dir, entry);
    });
    const sorted = [...dirMap.entries()]
      .map(([dir, v]) => ({ dir, ...v, pct: v.total > 0 ? Math.round(v.gap / v.total * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
    const list = sorted.map(d => `• **${d.dir}**: ${d.gap}/${d.total} posições em GAP (${d.pct}%)`).join('\n');
    return `**Diretorias com maior risco de sucessão:**\n\n${list}`;
  }

  // Ready successors
  if (q.includes('prontos') || q.includes('pronto agora') || q.includes('imediato')) {
    const ready = new Map<string, { cargo: string; lider: string }>();
    leaders.forEach(l => {
      (l.sucessores || []).forEach(s => {
        if (!isValidSuccessorName(s.nome)) return;
        const norm = normalizeProntidao(s.prontidao);
        if (norm === 'Imediato') {
          ready.set(s.nome.toLowerCase(), { cargo: s.cargo || '', lider: l.nome });
        }
      });
    });
    if (ready.size === 0) return 'Nenhum sucessor com prontidão imediata foi identificado.';
    const list = [...ready.entries()].slice(0, 10).map(([, v]) =>
      `• **${v.cargo}** — sucessor de ${v.lider}`
    ).join('\n');
    const extra = ready.size > 10 ? `\n\n...e mais ${ready.size - 10} sucessores.` : '';
    return `**${ready.size} sucessores** com prontidão imediata:\n\n${list}${extra}`;
  }

  // Pipeline summary
  if (q.includes('pipeline') || q.includes('resuma') || q.includes('resumo') || q.includes('qualidade')) {
    const total = leaders.length;
    const withSuccessor = leaders.filter(l =>
      l.sucessores?.some(s => isValidSuccessorName(s.nome))
    ).length;
    const gap = total - withSuccessor;
    const allSuccessors = leaders.flatMap(l => (l.sucessores || []).filter(s => isValidSuccessorName(s.nome)));
    const uniqueNames = new Set(allSuccessors.map(s => s.nome!.toLowerCase()));
    const readyCount = new Set(
      allSuccessors
        .filter(s => { const n = normalizeProntidao(s.prontidao); return n === 'Imediato' || n === '1-2 anos'; })
        .map(s => s.nome!.toLowerCase())
    ).size;

    return `📊 **Resumo do Pipeline de Sucessão**\n\n` +
      `• **${total}** posições de liderança analisadas\n` +
      `• **${withSuccessor}** posições com sucessor mapeado (${Math.round(withSuccessor / total * 100)}%)\n` +
      `• **${gap}** posições em GAP (${Math.round(gap / total * 100)}%)\n` +
      `• **${uniqueNames.size}** potenciais únicos identificados\n` +
      `• **${readyCount}** sucessores prontos em até 2 anos\n\n` +
      `${gap / total > 0.3 ? '⚠️ Atenção: mais de 30% das posições estão sem sucessor.' : '✅ A cobertura de sucessão está em nível aceitável.'}`;
  }

  // eNPS
  if (q.includes('enps')) {
    const withEnps = leaders.filter(l => l.enps2025 != null);
    const lowEnps = withEnps.filter(l => (l.enps2025 as number) < 70);
    if (withEnps.length === 0) return 'Não há dados de eNPS 2025 disponíveis.';
    return `**${lowEnps.length}** líderes com eNPS abaixo de 70 (${Math.round(lowEnps.length / withEnps.length * 100)}% dos que possuem dados).`;
  }

  // Default
  return `Desculpe, não consegui interpretar essa pergunta. Tente perguntar sobre:\n\n` +
    `• Posições sem sucessores\n` +
    `• Diretorias com maior risco\n` +
    `• Sucessores prontos agora\n` +
    `• Resumo do pipeline de sucessão\n` +
    `• eNPS dos líderes`;
}

export function LeadershipAgent() {
  const { leaders: dbLeaders } = useLeadersData();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leaders = useMemo(() => (dbLeaders as Leader[]).filter(l => l.situacao === 'Ativo'), [dbLeaders]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);

    setTimeout(() => {
      const answer = answerQuestion(msg, leaders);
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl"
        style={{ backgroundColor: '#0F9688' }}
        title="Agente de Lideranças"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[100] w-[380px] max-h-[520px] rounded-2xl shadow-2xl border border-border bg-card flex flex-col overflow-hidden"
          style={{ animation: 'agentSlideUp 0.25s ease-out' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ backgroundColor: '#0F9688' }}>
            <Bot className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">Agente de Lideranças</span>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[340px]">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: '#0F9688' }} />
                <p className="text-sm text-muted-foreground mb-3">Como posso ajudar?</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'text-white'
                      : 'bg-muted text-foreground'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: '#0F9688' } : undefined}
                >
                  {m.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-3 py-2 text-xs text-muted-foreground">
                  Analisando dados...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre lideranças..."
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-[#0F9688]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-40 transition-colors"
              style={{ backgroundColor: '#0F9688' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes agentSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
