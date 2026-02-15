'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { PostCard, type PostData } from '~/home/_components/post-card';

const PAGE_SIZE = 15;

interface GlobalFeedProps {
  initialPosts: PostData[];
}

export function GlobalFeed({ initialPosts }: GlobalFeedProps) {
  const supabase = useSupabase();
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  // Use a ref for the cursor so loadMore doesn't depend on posts state
  const cursorRef = useRef<string | null>(
    initialPosts.length > 0
      ? initialPosts[initialPosts.length - 1]!.created_at
      : null,
  );

  // Keep cursor in sync when posts change
  useEffect(() => {
    if (posts.length > 0) {
      cursorRef.current = posts[posts.length - 1]!.created_at;
    }
  }, [posts]);

  // --- Infinite scroll: load older posts ---
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !cursorRef.current) return;
    loadingRef.current = true;
    setLoading(true);

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

      const teamIds = [
        ...new Set(
          olderPosts.map((p: { team_id: string }) => p.team_id),
        ),
      ];

      const { data: teams } = await sb
        .from('teams')
        .select('id, name, picture_url')
        .in('id', teamIds);

      const teamMap = new Map(
        (teams ?? []).map(
          (t: { id: string; name: string; picture_url: string | null }) => [
            t.id,
            t,
          ],
        ),
      );

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
          team: teamMap.get(p.team_id) ?? {
            id: p.team_id,
            name: 'Unknown Team',
            picture_url: null,
          },
        }),
      );

      setPosts((prev) => [...prev, ...enriched]);

      if (olderPosts.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [supabase]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // --- Realtime: subscribe to new posts ---
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    const channel = sb
      .channel('global-feed-realtime')
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

          const { data: team } = await sb
            .from('teams')
            .select('id, name, picture_url')
            .eq('id', newRow.team_id)
            .single();

          const newPost: PostData = {
            id: newRow.id,
            content: newRow.content,
            created_at: newRow.created_at,
            team: team ?? {
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
  }, [supabase]);

  if (posts.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        No posts yet. Teams haven&apos;t posted anything yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-4 text-center">
        {loading && (
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
