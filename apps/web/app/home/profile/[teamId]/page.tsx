import { PageBody, PageHeader } from '@kit/ui/page';

import { ProfilePage } from './_components/profile-page';

interface ProfileRouteProps {
  params: Promise<{ teamId: string }>;
}

export default async function ProfileRoute({ params }: ProfileRouteProps) {
  const { teamId } = await params;

  return (
    <>
      <PageHeader description={'View team profile, posts, and connections'} />

      <PageBody>
        <ProfilePage teamId={teamId} />
      </PageBody>
    </>
  );
}
