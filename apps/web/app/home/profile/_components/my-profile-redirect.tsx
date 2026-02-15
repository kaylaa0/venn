'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';

export function MyProfileRedirect() {
  const supabase = useSupabase();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user.data?.sub) return;

    const redirect = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      const { data: account } = await sb
        .from('accounts')
        .select('team_id')
        .eq('id', user.data!.sub)
        .single();

      if (account?.team_id) {
        router.replace(`/home/profile/${account.team_id}`);
      }
    };

    redirect();
  }, [supabase, user.data?.sub, router]);

  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
    </div>
  );
}
