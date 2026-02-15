'use client';

import { useUser } from '@kit/supabase/hooks/use-user';
import { Alert } from '@kit/ui/alert';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';

import { UpdatePasswordForm } from './update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>,
) {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user) {
    return null;
  }

  // Check if the user signed up with email/password.
  // We check app_metadata.providers (which lists all linked identity providers)
  // rather than the session AMR, because after email confirmation the session
  // method becomes 'otp' even though the user has a password.
  const userMeta = (user as Record<string, unknown>)?.app_metadata as
    | { provider?: string; providers?: string[] }
    | undefined;

  const canUpdatePassword =
    userMeta?.providers?.includes('email') ||
    userMeta?.provider === 'email' ||
    user.amr?.some(
      (item: { method: string }) => item.method === 'password',
    );

  if (!canUpdatePassword) {
    return <WarnCannotUpdatePasswordAlert />;
  }

  return (
    <UpdatePasswordForm
      callbackPath={props.callbackPath}
      userEmail={user.email}
    />
  );
}

function WarnCannotUpdatePasswordAlert() {
  return (
    <Alert variant={'warning'}>
      <Trans i18nKey={'account:cannotUpdatePassword'} />
    </Alert>
  );
}
