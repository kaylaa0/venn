'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

import { PostCard, type PostData } from './post-card';
import { PostComposer } from './post-composer';
import { FollowProvider } from './use-follow';

const PAGE_SIZE = 20;

interface TeamInfo {
  id: string;
  name: string;
  picture_url: string | null;
}

export function HomeFeed() {
  const supabase = useSupabase();
  const user = useUser();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const cursorRef = useRef<string | null>(null);

  // --- Initial load ---
  const loadInitial = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // Get current user's team
      const { data: account } = await sb
        .from('accounts')
        .select('team_id')
        .eq('id', user.data?.sub)
        .single();

      if (!account) return;

      const { data: teamData } = await sb
        .from('teams')
        .select('id, name, picture_url')
        .eq('id', account.team_id)
        .single();

      if (teamData) setTeam(teamData);

      // Fetch first page — ALL posts (global feed)
      const { data: postsData } = await sb
        .from('posts')
        .select('id, content, created_at, team_id')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setHasMore(false);
        return;
      }

      const enriched = await enrichPosts(sb, postsData);
      setPosts(enriched);
      cursorRef.current = enriched[enriched.length - 1]!.created_at;

      if (postsData.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, user.data?.sub]);

  useEffect(() => {
    if (user.data?.sub) {
      loadInitial();
    }
  }, [user.data?.sub, loadInitial]);

  // --- Infinite scroll: load older posts ---
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !cursorRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      const { data: olderPosts } = await sb
        .from('posts')
        .select('id, content, created_at, team_id')
        .lt('created_at', cursorRef.current)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (!olderPosts || olderPosts.length === 0) {
        setHasMore(false);
        return;
      }

      const enriched = await enrichPosts(sb, olderPosts);
      setPosts((prev) => [...prev, ...enriched]);
      cursorRef.current = enriched[enriched.length - 1]!.created_at;

      if (olderPosts.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [supabase]);

  // Intersection observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  // --- Realtime: subscribe to ALL new posts ---
  useEffect(() => {
    if (!team) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    const channel = sb
      .channel('home-feed-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload: {
          new: {
            id: string;
            content: string;
            created_at: string;
            team_id: string;
          };
        }) => {
          const newRow = payload.new;

          const { data: postTeam } = await sb
            .from('teams')
            .select('id, name, picture_url')
            .eq('id', newRow.team_id)
            .single();

          const newPost: PostData = {
            id: newRow.id,
            content: newRow.content,
            created_at: newRow.created_at,
            team: postTeam ?? {
              id: newRow.team_id,
              name: 'Unknown Team',
              picture_url: null,
            },
          };

          setPosts((prev) => {
            if (prev.some((p) => p.id === newPost.id)) return prev;
            return [newPost, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [supabase, team]);

  // --- After composing a post, reload fresh ---
  const handlePostCreated = useCallback(() => {
    setLoading(true);
    setHasMore(true);
    cursorRef.current = null;
    loadInitial();
  }, [loadInitial]);

  if (loading) {
    return <LoadingOverlay fullPage={false}>Loading feed…</LoadingOverlay>;
  }

  return (
    <FollowProvider myTeamId={team?.id ?? null}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {team && <PostComposer team={team} onPostCreated={handlePostCreated} />}

        {posts.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            No posts yet. Be the first to post something!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} myTeamId={team?.id ?? null} />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="py-4 text-center">
          {loadingMore && (
            <Loader2 className="text-muted-foreground mx-auto h-5 w-5 animate-spin" />
          )}

          {!hasMore && posts.length > 0 && (
            <span className="text-muted-foreground text-xs">
              You&apos;ve reached the end
            </span>
          )}
        </div>
      </div>
    </FollowProvider>
  );
}

/** Enrich raw post rows with team info */
async function enrichPosts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  postsData: Array<{
    id: string;
    content: string;
    created_at: string;
    team_id: string;
  }>,
): Promise<PostData[]> {
  const uniqueTeamIds = [
    ...new Set(postsData.map((p) => p.team_id)),
  ];

  const { data: teams } = await sb
    .from('teams')
    .select('id, name, picture_url')
    .in('id', uniqueTeamIds);

  const teamMap = new Map<string, TeamInfo>(
    (teams ?? []).map((t: TeamInfo) => [t.id, t]),
  );

  return postsData.map((p): PostData => ({
    id: p.id,
    content: p.content,
    created_at: p.created_at,
    team: teamMap.get(p.team_id) ?? {
      id: p.team_id,
      name: 'Unknown Team',
      picture_url: null,
    },
  }));
}
