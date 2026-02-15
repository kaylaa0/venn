'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import {
  TeamSelector,
  type TeamSelection,
} from '~/components/auth/team-selector';

const paths = {
  callback: pathsConfig.auth.callback,
  appHome: pathsConfig.app.home,
};

function SignUpPage() {
  const [teamSelection, setTeamSelection] = useState<TeamSelection | null>(
    null,
  );
  const [signUpComplete, setSignUpComplete] = useState(false);

  // Derive metadata for the auth call from the team selection
  const metadata = useMemo(() => {
    if (!teamSelection) return undefined;

    if (teamSelection.mode === 'join') {
      return { team_id: teamSelection.team_id };
    }

    return { team_name: teamSelection.name };
  }, [teamSelection]);

  return (
    <>
      <Heading level={5} className={'tracking-tight'}>
        <Trans i18nKey={'auth:signUpHeading'} />
      </Heading>

      <div className="space-y-6">
        {/* Team selection - hidden after successful signup */}
        {!signUpComplete && (
          <TeamSelector value={teamSelection} onChange={setTeamSelection} />
        )}

        {/* Auth form - disabled until a team is chosen */}
        <div
          className={
            !metadata && !signUpComplete
              ? 'pointer-events-none select-none opacity-50'
              : undefined
          }
        >
          <SignUpMethodsContainer
            providers={authConfig.providers}
            displayTermsCheckbox={authConfig.displayTermsCheckbox}
            paths={paths}
            metadata={metadata}
            onSignUp={() => setSignUpComplete(true)}
          />
        </div>
      </div>

      <div className={'mt-4 flex justify-center'}>
        <Button asChild variant={'link'} size={'sm'}>
          <Link href={pathsConfig.auth.signIn}>
            <Trans i18nKey={'auth:alreadyHaveAnAccount'} />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default SignUpPage;
