import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { withI18n } from '~/lib/i18n/with-i18n';

import { GlobalFeed } from './_components/global-feed';

export const generateMetadata = async () => {
  return {
    title: 'Global Feed — Venn',
    description: 'See what teams are posting on Venn',
  };
};

async function GlobalFeedPage() {
  const client = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = client as any;

  const { data: posts } = await sb
    .from('posts')
    .select('id, content, created_at, team_id')
    .order('created_at', { ascending: false })
    .limit(15);

  // Get team info for all posts
  const teamIds = [
    ...new Set((posts ?? []).map((p: { team_id: string }) => p.team_id)),
  ];

  const { data: teams } = teamIds.length
    ? await sb.from('teams').select('id, name, picture_url').in('id', teamIds)
    : { data: [] };

  const teamMap = new Map(
    (teams ?? []).map(
      (t: { id: string; name: string; picture_url: string | null }) => [
        t.id,
        t,
      ],
    ),
  );

  const enrichedPosts = (posts ?? []).map(
    (p: {
      id: string;
      content: string;
      created_at: string;
      team_id: string;
    }) => ({
      id: p.id,
      content: p.content,
      created_at: p.created_at,
      team: teamMap.get(p.team_id) ?? {
        id: p.team_id,
        name: 'Unknown Team',
        picture_url: null,
      },
    }),
  );

  return (
    <div className={'container mx-auto py-8'}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Global Feed</h1>
          <p className="text-muted-foreground text-sm">
            See what teams are posting on Venn
          </p>
        </div>

        <GlobalFeed initialPosts={enrichedPosts} />
      </div>
    </div>
  );
}

export default withI18n(GlobalFeedPage);
