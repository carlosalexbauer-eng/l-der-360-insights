import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Leader } from '@/data/leaders';
import { useCallback } from 'react';

interface LeadersDataResult {
  leaders: Leader[];
  baseId: string | null;
}

async function fetchActiveLeaders(): Promise<LeadersDataResult> {
  const { data, error } = await supabase
    .from('leaders_data')
    .select('id, data')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (data?.data && Array.isArray(data.data)) {
    return {
      leaders: data.data as unknown as Leader[],
      baseId: data.id,
    };
  }

  // Fallback to static data if no DB data
  const staticData = await import('@/data/leaders-static.json');
  return {
    leaders: (staticData.default || staticData) as unknown as Leader[],
    baseId: null,
  };
}

export function useLeadersData() {
  const queryClient = useQueryClient();

  const query = useQuery<LeadersDataResult>({
    queryKey: ['leaders-data'],
    queryFn: fetchActiveLeaders,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['leaders-data'] });
  }, [queryClient]);

  return {
    leaders: query.data?.leaders ?? [],
    baseId: query.data?.baseId ?? null,
    isLoading: query.isLoading,
    error: query.error,
    invalidate,
  };
}
