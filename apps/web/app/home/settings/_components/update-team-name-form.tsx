'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';

import { useRevalidateTeamData } from './use-team-data';

const TeamNameSchema = z.object({
  teamName: z.string().min(2, 'Team name must be at least 2 characters').max(100),
});

export function UpdateTeamNameForm({
  teamId,
  currentName,
}: {
  teamId: string;
  currentName: string;
}) {
  const supabase = useSupabase();
  const revalidateTeam = useRevalidateTeamData();

  const form = useForm({
    resolver: zodResolver(TeamNameSchema),
    defaultValues: {
      teamName: currentName,
    },
  });

  const onSubmit = async ({ teamName }: { teamName: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    const promise = sb
      .from('teams')
      .update({ name: teamName })
      .eq('id', teamId)
      .throwOnError()
      .then(() => {
        revalidateTeam();
      });

    return toast.promise(() => promise, {
      success: 'Team name updated',
      error: 'Failed to update team name',
      loading: 'Updating team name…',
    });
  };

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name={'teamName'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>

              <FormControl>
                <Input
                  minLength={2}
                  maxLength={100}
                  placeholder="Enter your team name"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button type="submit">Update Team Name</Button>
        </div>
      </form>
    </Form>
  );
}
