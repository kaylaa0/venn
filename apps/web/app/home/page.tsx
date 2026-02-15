import { PageBody, PageHeader } from '@kit/ui/page';

import { HomeFeed } from './_components/home-feed';

export default function HomePage() {
  return (
    <>
      <PageHeader description={'See what your team and others are posting'} />

      <PageBody>
        <HomeFeed />
      </PageBody>
    </>
  );
}
