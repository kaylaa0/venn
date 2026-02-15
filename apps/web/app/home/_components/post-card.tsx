'use client';

import { formatDistanceToNow } from 'date-fns';

import { ProfileAvatar } from '@kit/ui/profile-avatar';

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

export function PostCard({ post }: { post: PostData }) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  return (
    <div className="border-b pb-4">
      {/* Header - avatar + name */}
      <div className="mb-3 flex items-start gap-3 px-1 py-3">
        <div>
          <ProfileAvatar
            displayName={post.team.name}
            pictureUrl={post.team.picture_url}
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{post.team.name}</span>
          <span className="text-muted-foreground text-xs">{timeAgo}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-1">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>
    </div>
  );
}
