'use client';

import { UserCheck, UserPlus } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { useFollowContext } from './use-follow';

interface FollowButtonProps {
  myTeamId: string | null;
  targetTeamId: string;
  size?: 'sm' | 'default';
}

export function FollowButton({
  myTeamId,
  targetTeamId,
  size = 'sm',
}: FollowButtonProps) {
  const { followedTeamIds, ready, toggle, isToggling } = useFollowContext();

  // Don't render if it's our own team or not ready yet
  if (!myTeamId || myTeamId === targetTeamId) return null;
  if (!ready) return null;

  const isFollowing = followedTeamIds.has(targetTeamId);
  const toggling = isToggling(targetTeamId);

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size={size}
      disabled={toggling}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(targetTeamId);
      }}
      className="min-w-[100px]"
    >
      {isFollowing ? (
        <>
          <UserCheck className="mr-1.5 h-3.5 w-3.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Follow
        </>
      )}
    </Button>
  );
}
