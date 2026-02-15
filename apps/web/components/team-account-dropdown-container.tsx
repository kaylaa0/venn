'use client';

import Link from 'next/link';

import type { JwtPayload } from '@supabase/supabase-js';

import { ChevronsUpDown, Home, LogOut } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
import { SubMenuModeToggle } from '@kit/ui/mode-toggle';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { useTeamAccountData } from '~/components/use-team-account-data';
import featuresFlagConfig from '~/config/feature-flags.config';

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function TeamAccountDropdownContainer(props: {
  user?: JwtPayload;
  showProfileName?: boolean;
  className?: string;

  paths?: {
    home?: string;
  };

  account?: {
    id: string | null;
  };
}) {
  const signOut = useSignOut();
  const user = useUser(props.user);
  const userData = user.data;
  const teamData = useTeamAccountData(userData?.sub);

  const signedInAsLabel = teamData?.data?.email ?? userData?.email ?? undefined;

  if (!userData) {
    return null;
  }

  // Prefer team data for display; fall back to account data
  const displayName = teamData?.data?.name ?? userData?.email ?? '';

  const pictureUrl = teamData?.data?.picture_url ?? null;

  const teamLabel = teamData?.data?.name;

  const showProfileName = props.showProfileName ?? true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open your profile menu"
        data-test={'account-dropdown-trigger'}
        className={cn(
          'animate-in fade-in focus:outline-primary flex cursor-pointer items-center duration-500 group-data-[minimized=true]:px-0',
          props.className ?? '',
          {
            ['active:bg-secondary/50 items-center gap-x-4 rounded-md' +
            ' hover:bg-secondary p-2 transition-colors']: showProfileName,
          },
        )}
      >
        <ProfileAvatar
          className={'rounded-md'}
          fallbackClassName={'rounded-md border'}
          displayName={displayName}
          pictureUrl={pictureUrl}
        />

        <If condition={showProfileName}>
          <div
            className={
              'fade-in animate-in flex w-full flex-col truncate text-left group-data-[minimized=true]:hidden'
            }
          >
            <span
              data-test={'account-dropdown-display-name'}
              className={'truncate text-sm font-medium'}
            >
              {displayName}
            </span>

            <span
              data-test={'account-dropdown-email'}
              className={'text-muted-foreground truncate text-xs'}
            >
              {signedInAsLabel}
            </span>
          </div>

          <ChevronsUpDown
            className={
              'text-muted-foreground mr-1 h-8 group-data-[minimized=true]:hidden'
            }
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={'xl:!min-w-[12rem]'}>
        <DropdownMenuItem className={'!h-10 rounded-none'}>
          <div
            className={'flex flex-col justify-start truncate text-left text-xs'}
          >
            {teamLabel ? (
              <>
                <div className={'font-medium'}>{teamLabel}</div>
                <div className={'text-muted-foreground'}>{signedInAsLabel}</div>
              </>
            ) : (
              <>
                <div className={'text-muted-foreground'}>
                  <Trans i18nKey={'common:signedInAs'} />
                </div>
                <div>
                  <span className={'block truncate'}>{signedInAsLabel}</span>
                </div>
              </>
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <If condition={!!props.paths?.home}>
          <DropdownMenuItem asChild>
            <Link
              className={'flex w-full cursor-pointer items-center space-x-2'}
              href={props.paths?.home ?? '/'}
            >
              <Home className={'h-5'} />

              <span>
                <Trans i18nKey={'common:routes.home'} />
              </span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
        </If>

        <If condition={features.enableThemeToggle}>
          <SubMenuModeToggle />
        </If>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          data-test={'account-dropdown-sign-out'}
          role={'button'}
          className={'cursor-pointer'}
          onClick={() => signOut.mutateAsync()}
        >
          <span className={'flex w-full items-center space-x-2'}>
            <LogOut className={'h-5'} />

            <span>
              <Trans i18nKey={'auth:signOut'} />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
