import { PageHeader } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      <PageHeader
        description={'Manage your team profile and account settings'}
      />

      {props.children}
    </>
  );
}

export default withI18n(UserSettingsLayout);
