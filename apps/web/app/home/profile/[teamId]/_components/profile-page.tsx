'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { FollowButton } from '~/home/_components/follow-button';
import { FollowProvider, useFollowCounts } from '~/home/_components/use-follow';

import { FollowList } from './follow-list';
import { ProfilePosts } from './profile-posts';

interface TeamProfile {
  id: string;
  name: string;
  picture_url: string | null;
}

export function ProfilePage({ teamId }: { teamId: string }) {
  const supabase = useSupabase();
  const user = useUser();
  const [team, setTeam] = useState<TeamProfile | null>(null);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { followers, following, loading: countsLoading } =
    useFollowCounts(teamId);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // Get profile team data
      const { data: teamData } = await sb
        .from('teams')
        .select('id, name, picture_url')
        .eq('id', teamId)
        .single();

      if (!cancelled && teamData) setTeam(teamData);

      // Get current user's team
      if (user.data?.sub) {
        const { data: account } = await sb
          .from('accounts')
          .select('team_id')
          .eq('id', user.data.sub)
          .single();

        if (!cancelled && account) setMyTeamId(account.team_id);
      }

      if (!cancelled) setLoading(false);
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [supabase, teamId, user.data?.sub]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-sm">Team not found.</p>
      </div>
    );
  }

  const isOwnProfile = myTeamId === teamId;

  return (
    <FollowProvider myTeamId={myTeamId}>
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Profile Header */}
      <div className="space-y-4 px-1 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              displayName={team.name}
              pictureUrl={team.picture_url}
              className="h-16 w-16 text-xl"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold">{team.name}</h1>
              {isOwnProfile && (
                <span className="text-muted-foreground text-xs">
                  Your team
                </span>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <FollowButton
              myTeamId={myTeamId}
              targetTeamId={teamId}
              size="default"
            />
          )}
        </div>

        {/* Follower / Following counts */}
        <div className="flex gap-6">
          <div className="text-sm">
            <span className="font-semibold">
              {countsLoading ? '–' : followers}
            </span>{' '}
            <span className="text-muted-foreground">
              {followers === 1 ? 'Follower' : 'Followers'}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">
              {countsLoading ? '–' : following}
            </span>{' '}
            <span className="text-muted-foreground">Following</span>
          </div>
        </div>
      </div>

      {/* Tabs: Posts / Followers / Following */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          <ProfilePosts teamId={teamId} myTeamId={myTeamId} />
        </TabsContent>

        <TabsContent value="followers" className="mt-4">
          <FollowList teamId={teamId} type="followers" />
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          <FollowList teamId={teamId} type="following" />
        </TabsContent>
      </Tabs>
    </div>
    </FollowProvider>
  );
}
