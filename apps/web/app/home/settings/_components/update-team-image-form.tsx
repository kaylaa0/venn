'use client';

import { useCallback } from 'react';

import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { ImageUploader } from '@kit/ui/image-uploader';

import { useRevalidateTeamData } from './use-team-data';

const TEAM_AVATARS_BUCKET = 'team_image';

export function UpdateTeamImageForm({
  teamId,
  pictureUrl,
}: {
  teamId: string;
  pictureUrl: string | null;
}) {
  const client = useSupabase();
  const revalidateTeam = useRevalidateTeamData();

  const createToaster = useCallback(
    (promise: () => Promise<unknown>) => {
      return toast.promise(promise, {
        success: 'Team avatar updated',
        error: 'Failed to update team avatar',
        loading: 'Updating team avatar…',
      });
    },
    [],
  );

  const onValueChange = useCallback(
    (file: File | null) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = client as any;

      const removeExistingFile = () => {
        if (pictureUrl) {
          const bucket = client.storage.from(TEAM_AVATARS_BUCKET);
          // Extract the path after the bucket name from the public URL
          const parts = pictureUrl.split(`/${TEAM_AVATARS_BUCKET}/`);
          const filePath = parts[1]?.split('?')[0];

          if (filePath) {
            return bucket.remove([filePath]);
          }
        }

        return Promise.resolve();
      };

      if (file) {
        const promise = () =>
          removeExistingFile().then(async () => {
            const bytes = await file.arrayBuffer();
            const bucket = client.storage.from(TEAM_AVATARS_BUCKET);
            const extension = file.name.split('.').pop();
            const uniqueId = crypto.randomUUID().slice(0, 16);
            const filePath = `${teamId}/${uniqueId}.${extension}`;

            const result = await bucket.upload(filePath, bytes);

            if (result.error) throw result.error;

            const publicUrl = bucket.getPublicUrl(filePath).data.publicUrl;

            await sb
              .from('teams')
              .update({ picture_url: publicUrl })
              .eq('id', teamId)
              .throwOnError();

            revalidateTeam();
          });

        createToaster(promise);
      } else {
        const promise = () =>
          removeExistingFile().then(async () => {
            await sb
              .from('teams')
              .update({ picture_url: null })
              .eq('id', teamId)
              .throwOnError();

            revalidateTeam();
          });

        createToaster(promise);
      }
    },
    [client, createToaster, pictureUrl, teamId, revalidateTeam],
  );

  return (
    <ImageUploader value={pictureUrl} onValueChange={onValueChange}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm'}>Team Avatar</span>

        <span className={'text-xs'}>
          Upload an image to represent your team
        </span>
      </div>
    </ImageUploader>
  );
}
