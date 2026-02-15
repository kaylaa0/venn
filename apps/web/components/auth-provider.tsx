'use client';

import { useAuthChangeListener } from '@kit/supabase/hooks/use-auth-change-listener';

import pathsConfig from '~/config/paths.config';
import { usePostOAuthTeamSetup } from '~/components/auth/use-post-oauth-team-setup';

export function AuthProvider(props: React.PropsWithChildren) {
  useAuthChangeListener({
    appHomePath: pathsConfig.app.home,
  });

  // Handle pending team assignment after OAuth sign-up
  usePostOAuthTeamSetup();

  return props.children;
}
