import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:cookiePolicy'),
  };
}

async function CookiePolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t(`marketing:cookiePolicy`)}
        subtitle={
          'Transparency about how we use cookies to power your team experience.'
        }
      />

      <div className={'container mx-auto max-w-4xl py-8'}>
        <div
          className={'prose prose-slate dark:prose-invert max-w-none space-y-8'}
        >
          <section>
            <h2 className="text-2xl font-bold">1. What are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit
              a website. On Venn, we use them to remember your session, keep
              your account secure, and ensure that your actions are correctly
              attributed to your team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">2. How Venn Uses Cookies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Strictly Necessary Cookies
                </h3>
                <p>
                  These are essential for you to move around the website and use
                  its features. Because Venn relies on{' '}
                  <strong>Supabase Authentication</strong>, these cookies keep
                  you logged in and verify that you have the correct permissions
                  to post on behalf of your team.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Functionality Cookies</h3>
                <p>
                  We use these to remember choices you make, such as your
                  preferred language or the specific team dashboard you last
                  visited. This provides a more personalized experience.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Performance & Analytics
                </h3>
                <p>
                  We may use cookies to understand how teams interact with our
                  platform, which helps us improve the user interface and fix
                  technical issues.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. Managing Your Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their
              settings. However, please note that if you disable strictly
              necessary cookies, you will not be able to log in or post to your
              Venn team profiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect
              changes in technology or legal requirements. Any changes will be
              posted here with an updated &quot;Last Updated&quot; date.
            </p>
          </section>

          <p className="text-muted-foreground mt-12 border-t pt-4 text-sm">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default withI18n(CookiePolicyPage);
