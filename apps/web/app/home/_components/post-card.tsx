'use client';

import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';

import { ProfileAvatar } from '@kit/ui/profile-avatar';

import { FollowButton } from './follow-button';

export interface PostData {
  id: string;
  content: string;
  created_at: string;
  team: {
    id: string;
    name: string;
    picture_url: string | null;
  };
}

interface PostCardProps {
  post: PostData;
  /** Current user's team ID — used to show/hide the follow button */
  myTeamId?: string | null;
}

export function PostCard({ post, myTeamId }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  return (
    <div className="border-b pb-4">
      {/* Header - avatar + name + follow button */}
      <div className="mb-3 flex items-start justify-between gap-3 px-1 py-3">
        <div className="flex items-start gap-3">
          <Link href={`/home/profile/${post.team.id}`}>
            <ProfileAvatar
              displayName={post.team.name}
              pictureUrl={post.team.picture_url}
            />
          </Link>
          <div className="min-w-0 flex-1 flex flex-col leading-tight">
            <Link
              href={`/home/profile/${post.team.id}`}
              className="truncate text-sm font-semibold hover:underline"
            >
              {post.team.name}
            </Link>
            <span className="text-muted-foreground text-xs">{timeAgo}</span>
          </div>
        </div>

        {/* Follow button — hidden for own team */}
        <FollowButton
          myTeamId={myTeamId ?? null}
          targetTeamId={post.team.id}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 px-1">
        <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>
    </div>
  );
}
