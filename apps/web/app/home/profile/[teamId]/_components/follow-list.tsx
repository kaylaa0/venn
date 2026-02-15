'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Loader2 } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { ProfileAvatar } from '@kit/ui/profile-avatar';

interface TeamListItem {
  id: string;
  name: string;
  picture_url: string | null;
}

interface FollowListProps {
  teamId: string;
  type: 'followers' | 'following';
}

export function FollowList({ teamId, type }: FollowListProps) {
  const supabase = useSupabase();
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      try {
        if (type === 'followers') {
          // Teams that follow this team
          const { data: follows } = await sb
            .from('follows')
            .select('follower_team_id')
            .eq('following_team_id', teamId);

          if (!follows || follows.length === 0) {
            if (!cancelled) {
              setTeams([]);
              setLoading(false);
            }
            return;
          }

          const ids = follows.map(
            (f: { follower_team_id: string }) => f.follower_team_id,
          );

          const { data: teamData } = await sb
            .from('teams')
            .select('id, name, picture_url')
            .in('id', ids);

          if (!cancelled) setTeams(teamData ?? []);
        } else {
          // Teams this team follows
          const { data: follows } = await sb
            .from('follows')
            .select('following_team_id')
            .eq('follower_team_id', teamId);

          if (!follows || follows.length === 0) {
            if (!cancelled) {
              setTeams([]);
              setLoading(false);
            }
            return;
          }

          const ids = follows.map(
            (f: { following_team_id: string }) => f.following_team_id,
          );

          const { data: teamData } = await sb
            .from('teams')
            .select('id, name, picture_url')
            .in('id', ids);

          if (!cancelled) setTeams(teamData ?? []);
        }
      } catch (err) {
        console.error(`Failed to load ${type}:`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [supabase, teamId, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        {type === 'followers' ? 'No followers yet.' : 'Not following anyone.'}
      </div>
    );
  }

  return (
    <div className="divide-y">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/home/profile/${team.id}`}
          className="hover:bg-muted/50 flex items-center gap-3 px-2 py-3 transition-colors"
        >
          <div>
            <ProfileAvatar
              displayName={team.name}
              pictureUrl={team.picture_url}
            />
          </div>
          <span className="min-w-0 truncate text-sm font-medium">{team.name}</span>
        </Link>
      ))}
    </div>
  );
}
