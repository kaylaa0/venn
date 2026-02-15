import { PageBody, PageHeader } from '@kit/ui/page';

import { MyProfileRedirect } from './_components/my-profile-redirect';

export default function MyProfilePage() {
  return (
    <>
      <PageHeader description={'View team profile, posts, and connections'} />

      <PageBody>
        <MyProfileRedirect />
      </PageBody>
    </>
  );
}
