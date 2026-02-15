'use client';

import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';

interface TeamData {
  id: string;
  name: string;
  picture_url: string | null;
}

export function useTeamData() {
  const supabase = useSupabase();
  const user = useUser();
  const userId = user.data?.id;

  return useQuery({
    queryKey: ['team:data', userId],
    queryFn: async () => {
      if (!userId) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // Get account → team_id
      const { data: account, error: accountError } = await sb
        .from('accounts')
        .select('team_id')
        .eq('id', userId)
        .single();

      if (accountError || !account?.team_id) {
        throw new Error('Could not find team for this account');
      }

      // Get team data
      const { data: team, error: teamError } = await sb
        .from('teams')
        .select('id, name, picture_url')
        .eq('id', account.team_id)
        .single();

      if (teamError) throw teamError;

      return team as TeamData;
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function useRevalidateTeamData() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useCallback(() => {
    if (user.data?.id) {
      queryClient.invalidateQueries({
        queryKey: ['team:data', user.data.id],
      });
    }
  }, [queryClient, user.data?.id]);
}
