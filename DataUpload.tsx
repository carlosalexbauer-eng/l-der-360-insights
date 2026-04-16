import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock } from 'lucide-react';

export function LastUpdateBadge() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

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

  if (!lastUpdate) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="w-3 h-3" />
      <span>Última atualização: {lastUpdate}</span>
    </div>
  );
}
