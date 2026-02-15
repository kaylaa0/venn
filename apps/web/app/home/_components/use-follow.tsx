'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

/**
 * Shared context so every FollowButton for the same team stays in sync.
 */
interface FollowContextValue {
  /** Set of team IDs the current user's team is following */
  followedTeamIds: Set<string>;
  /** Whether the initial load is done */
  ready: boolean;
  /** Toggle follow for a target team */
  toggle: (targetTeamId: string) => Promise<void>;
  /** Check if currently toggling a specific team */
  isToggling: (targetTeamId: string) => boolean;
}

const FollowContext = createContext<FollowContextValue | null>(null);

export function useFollowContext() {
  const ctx = useContext(FollowContext);
  if (!ctx) {
    throw new Error('useFollowContext must be used within FollowProvider');
  }
  return ctx;
}

interface FollowProviderProps {
  myTeamId: string | null;
  children: React.ReactNode;
}

/**
 * Provides shared follow state for all FollowButtons in the tree.
 * Loads the full set of followed team IDs once, then keeps it in sync
 * as the user follows / unfollows.
 */
export function FollowProvider({ myTeamId, children }: FollowProviderProps) {
  const supabase = useSupabase();
  const [followedTeamIds, setFollowedTeamIds] = useState<Set<string>>(
    new Set(),
  );
  const [ready, setReady] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Load all followed team IDs once
  useEffect(() => {
    if (!myTeamId) {
      setReady(true);
      return;
    }

    let cancelled = false;

    const load = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      const { data: follows } = await sb
        .from('follows')
        .select('following_team_id')
        .eq('follower_team_id', myTeamId);

      if (!cancelled) {
        const ids = new Set<string>(
          (follows ?? []).map(
            (f: { following_team_id: string }) => f.following_team_id,
          ),
        );
        setFollowedTeamIds(ids);
        setReady(true);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [supabase, myTeamId]);

  const toggle = useCallback(
    async (targetTeamId: string) => {
      if (!myTeamId || myTeamId === targetTeamId) return;

      setTogglingIds((prev) => new Set(prev).add(targetTeamId));

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb = supabase as any;
        const currentlyFollowing = followedTeamIds.has(targetTeamId);

        if (currentlyFollowing) {
          await sb
            .from('follows')
            .delete()
            .eq('follower_team_id', myTeamId)
            .eq('following_team_id', targetTeamId);

          setFollowedTeamIds((prev) => {
            const next = new Set(prev);
            next.delete(targetTeamId);
            return next;
          });
        } else {
          await sb.from('follows').insert({
            following_team_id: targetTeamId,
          });

          setFollowedTeamIds((prev) => new Set(prev).add(targetTeamId));
        }
      } catch (err) {
        console.error('Failed to toggle follow:', err);
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetTeamId);
          return next;
        });
      }
    },
    [supabase, myTeamId, followedTeamIds],
  );

  const isToggling = useCallback(
    (targetTeamId: string) => togglingIds.has(targetTeamId),
    [togglingIds],
  );

  return (
    <FollowContext.Provider
      value={{ followedTeamIds, ready, toggle, isToggling }}
    >
      {children}
    </FollowContext.Provider>
  );
}

/**
 * Hook to fetch follower / following counts for a team.
 */
export function useFollowCounts(teamId: string) {
  const supabase = useSupabase();
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      const [{ count: followerCount }, { count: followingCount }] =
        await Promise.all([
          sb
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_team_id', teamId),
          sb
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_team_id', teamId),
        ]);

      if (!cancelled) {
        setFollowers(followerCount ?? 0);
        setFollowing(followingCount ?? 0);
        setLoading(false);
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [supabase, teamId]);

  return { followers, following, loading };
}
