import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:privacyPolicy'),
  };
}

async function PrivacyPolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t('marketing:privacyPolicy')}
        subtitle={'How we protect your collective and individual data.'}
      />

      <div className={'container mx-auto max-w-4xl py-8'}>
        <div
          className={'prose prose-slate dark:prose-invert max-w-none space-y-8'}
        >
          <section>
            <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            <p>
              Venn collects information to provide a secure environment for
              team-based social interaction. This includes:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Account Information:</strong> Individual email addresses
                and authentication data required for secure login.
              </li>
              <li>
                <strong>Team Metadata:</strong> Profile names, logos, and
                descriptions associated with the collective entity.
              </li>
              <li>
                <strong>Usage Data:</strong> Internal logs of which individual
                user performed an action (post, delete, edit) on behalf of a
                team for accountability purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">2. How We Use Your Data</h2>
            <p>
              Your individual data is never shared publicly. While you post as a
              Team, we use your individual identity to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Ensure Row Level Security (RLS) so only authorized members can
                post.
              </li>
              <li>
                Provide &quot;Internal Audit Trails&quot; for team admins to see who
                contributed what content.
              </li>
              <li>Maintain the security and integrity of the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. Data Storage and Security</h2>
            <p>
              We leverage <strong>Supabase</strong> and{' '}
              <strong>PostgreSQL</strong> to store your data. All data is
              protected by industry-standard encryption and strict access
              controls. Since Venn does not require shared passwords, your
              individual account security is never compromised by your team
              membership.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Third-Party Services</h2>
            <p>
              We do not sell your personal or team data. We only share
              information with essential third-party services (like Supabase for
              auth/database and Stripe for billing) necessary to operate the
              Venn platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your individual
              account at any time. Team owners have the right to manage and
              delete collective data associated with their team profile.
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

export default withI18n(PrivacyPolicyPage);
