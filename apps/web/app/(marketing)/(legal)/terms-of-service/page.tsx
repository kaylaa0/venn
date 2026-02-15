import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:termsOfService'),
  };
}

async function TermsOfServicePage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t(`marketing:termsOfService`)}
        subtitle={'The rules for collective voices on Venn.'}
      />

      <div className={'container mx-auto max-w-4xl py-8'}>
        <div
          className={'prose prose-slate dark:prose-invert max-w-none space-y-8'}
        >
          <section>
            <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Venn, you agree to be bound by these Terms
              of Service. If you are using Venn on behalf of a team,
              organization, or entity, you represent that you have the authority
              to bind that entity to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              2. Individual Accountability & Team Identity
            </h2>
            <p>
              Venn is unique in that while you log in as an individual, your
              public actions are attributed to your Team.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Security:</strong> You are responsible for maintaining
                the security of your individual credentials.
              </li>
              <li>
                <strong>Attribution:</strong> Any content posted through a Team
                profile is the legal responsibility of the Team owners and the
                individual contributor.
              </li>
              <li>
                <strong>Authorization:</strong> You may only post on behalf of
                Teams that have explicitly granted you access through our
                internal invitation system.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. Content & Conduct</h2>
            <p>
              Your team is solely responsible for the content it publishes. You
              agree not to use Venn to distribute hate speech, illegal material,
              or perform unauthorized automated actions (spamming). We reserve
              the right to suspend any team that violates these community
              standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Data and Privacy</h2>
            <p>
              We use Supabase to manage your data securely. While your public
              identity is your Team, Venn stores individual logs of actions for
              security auditing and internal team management purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">5. Termination</h2>
            <p>
              We reserve the right to terminate your access to Venn at any time,
              without notice, for conduct that we believe violates these Terms
              or is harmful to other collective entities on the platform.
            </p>
          </section>

          <p className="text-muted-foreground mt-12 text-sm">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default withI18n(TermsOfServicePage);
