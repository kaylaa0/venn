'use client';

import { useEffect, useRef } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

const PENDING_TEAM_KEY = 'pending_team_selection';

/**
 * After an OAuth sign-up, the user's team selection is stored in localStorage
 * (because OAuth redirects can't carry custom metadata).
 *
 * This hook reads the pending selection once the user is authenticated and
 * calls the `handle_post_oauth_team_assignment` RPC to fix the team.
 */
export function usePostOAuthTeamSetup() {
  const supabase = useSupabase();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    async function run() {
      try {
        const raw = localStorage.getItem(PENDING_TEAM_KEY);
        if (!raw) return;

        processed.current = true;
        localStorage.removeItem(PENDING_TEAM_KEY);

        const metadata: Record<string, string> = JSON.parse(raw);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc('handle_post_oauth_team_assignment', {
          p_team_id: metadata.team_id ?? null,
          p_team_name: metadata.team_name ?? null,
        });
      } catch (err) {
        console.error('[post-oauth-team-setup]', err);
      }
    }

    run();
  }, [supabase]);
}
