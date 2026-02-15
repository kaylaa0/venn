'use client';

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

/**
 * Fetches the team data for the current user's account.
 * Returns team id, name, and picture_url so it can be used
 * in place of account data in the dropdown.
 */
export function useTeamAccountData(userId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['team:dropdown', userId],
    queryFn: async () => {
      if (!userId) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // Get account → team_id + email
      const { data: account, error: accountError } = await sb
        .from('accounts')
        .select('team_id, email')
        .eq('id', userId)
        .single();

      if (accountError || !account?.team_id) return null;

      // Get team data
      const { data: team, error: teamError } = await sb
        .from('teams')
        .select('id, name, picture_url')
        .eq('id', account.team_id)
        .single();

      if (teamError) return null;

      return {
        id: team.id as string,
        name: team.name as string,
        picture_url: team.picture_url as string | null,
        email: (account.email as string) ?? null,
      };
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
