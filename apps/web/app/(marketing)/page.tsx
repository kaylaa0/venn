import Image from 'next/image';
import Link from 'next/link';

import { ArrowRightIcon, Users } from 'lucide-react';

import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Hero,
  Pill,
} from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'mt-4 flex flex-col space-y-24 py-14'}>
      <div className={'container mx-auto'}>
        <Hero
          pill={
            <Pill label={'Venn 0.3'}>
              <span>The social platform reimagined for collaboration</span>
            </Pill>
          }
          title={
            <>
              <span>Don&apos;t post as a user.</span>
              <span className="text-primary">Post as a Powerhouse.</span>
            </>
          }
          subtitle={
            <span>
              Venn replaces individual egos with team identity. Log in with your
              own credentials, but speak with one unified voice. The first
              social network where the group is the profile.
            </span>
          }
          cta={<MainCallToActionButton />}
          image={
            <Image
              priority
              className={
                'dark:border-primary/10 rounded-2xl border border-gray-200'
              }
              width={3558}
              height={2222}
              src={`/images/dashboard.webp`}
              alt={`Venn Team Dashboard Interface`}
            />
          }
        />
      </div>

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-col space-y-16 xl:space-y-32 2xl:space-y-36'}
        >
          <FeatureShowcase
            heading={
              <>
                <b className="font-semibold dark:text-white">
                  A social engine built for collectives
                </b>
                .{' '}
                <span className="text-muted-foreground font-normal">
                  Bridges the gap between individual contribution and group
                  identity.
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <Users className="h-5" />
                <span>Group-First Architecture</span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'The Team Command Center'}
                description={`Manage your team's public presence from a centralized dashboard.`}
              />

              <FeatureCard
                className={
                  'relative col-span-2 w-full overflow-hidden lg:col-span-1'
                }
                label={'Secure Individual Access'}
                description={`Say goodbye to shared passwords. Users log in with their own secure accounts, but every action they take is attributed to the team.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:col-span-1'}
                label={'Unified Identity'}
                description={`No more fragmented personal accounts. Venn ensures your group presents a single, professional, and consistent voice to the world.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'Collaborative Publishing'}
                description={`Powered by Supabase RLS, Venn ensures that only authorized members can post on behalf of the team, creating a seamless and secure workflow for creative squads.`}
              />
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-4'}>
      <CtaButton>
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>
              <Trans i18nKey={'common:getStarted'} />
            </span>

            <ArrowRightIcon
              className={
                'animate-in fade-in slide-in-from-left-8 h-4' +
                ' zoom-in fill-mode-both delay-1000 duration-1000'
              }
            />
          </span>
        </Link>
      </CtaButton>
      {/*
      <CtaButton variant={'link'}>
        <Link href={'/contact'}>
          <Trans i18nKey={'common:contactUs'} />
        </Link>
      </CtaButton>
      */}
    </div>
  );
}
