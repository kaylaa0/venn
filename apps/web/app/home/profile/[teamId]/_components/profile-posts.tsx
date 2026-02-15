'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { PostCard, type PostData } from '~/home/_components/post-card';

const PAGE_SIZE = 20;

interface ProfilePostsProps {
  teamId: string;
  myTeamId: string | null;
}

export function ProfilePosts({ teamId, myTeamId }: ProfilePostsProps) {
  const supabase = useSupabase();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const cursorRef = useRef<string | null>(null);
  const [teamInfo, setTeamInfo] = useState<{
    id: string;
    name: string;
    picture_url: string | null;
  } | null>(null);

  const loadInitial = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // Get team info
      const { data: team } = await sb
        .from('teams')
        .select('id, name, picture_url')
        .eq('id', teamId)
        .single();

      if (team) setTeamInfo(team);

      // Fetch posts
      const { data: postsData } = await sb
        .from('posts')
        .select('id, content, created_at, team_id')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setHasMore(false);
        return;
      }

      const enriched: PostData[] = postsData.map(
        (p: {
          id: string;
          content: string;
          created_at: string;
          team_id: string;
        }) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          team: team ?? {
            id: p.team_id,
            name: 'Unknown Team',
            picture_url: null,
          },
        }),
      );

      setPosts(enriched);
      cursorRef.current = enriched[enriched.length - 1]!.created_at;

      if (postsData.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error('Failed to load profile posts:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, teamId]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

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
        .eq('team_id', teamId)
        .lt('created_at', cursorRef.current)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (!olderPosts || olderPosts.length === 0) {
        setHasMore(false);
        return;
      }

      const enriched: PostData[] = olderPosts.map(
        (p: {
          id: string;
          content: string;
          created_at: string;
          team_id: string;
        }) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          team: teamInfo ?? {
            id: p.team_id,
            name: 'Unknown Team',
            picture_url: null,
          },
        }),
      );

      setPosts((prev) => [...prev, ...enriched]);
      cursorRef.current = enriched[enriched.length - 1]!.created_at;

      if (olderPosts.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error('Failed to load more profile posts:', err);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [supabase, teamId, teamInfo]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} myTeamId={myTeamId} />
      ))}

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
  );
}
