'use client';

import { useState } from 'react';

import { SendHorizonal } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
} from '@kit/ui/card';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Textarea } from '@kit/ui/textarea';

interface PostComposerProps {
  team: {
    name: string;
    picture_url: string | null;
  };
  onPostCreated?: () => void;
}

export function PostComposer({ team, onPostCreated }: PostComposerProps) {
  const supabase = useSupabase();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const canPost = content.trim().length > 0;

  const handleSubmit = async () => {
    if (!canPost || loading) return;

    setLoading(true);

    try {
      // team_id and created_by are auto-assigned by the trigger
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('posts').insert({
        content: content.trim(),
      });

      if (error) throw error;

      setContent('');
      onPostCreated?.();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <ProfileAvatar
            displayName={team.name}
            pictureUrl={team.picture_url}
          />

          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={`What's on ${team.name}'s mind?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              disabled={loading}
            />

            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!canPost || loading}
                onClick={handleSubmit}
              >
                <SendHorizonal className="mr-2 h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
