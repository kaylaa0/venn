/*
 * -------------------------------------------------------
 * Section: Posts
 * Description: Table to store social posts created by teams. 
 * Each post is associated with a team and can be viewed by all users.
 * Only team members can create posts.
 * -------------------------------------------------------
 */
create table if not exists
    public.posts (
        id uuid primary key default gen_random_uuid (),
        team_id uuid not null references public.teams (id),
        content text not null,
        created_by uuid not null references auth.users (id),
        created_at timestamp with time zone default now(),
        -- Add a foreign key constraint to ensure the creator is a member of the team
        foreign key (team_id) references public.teams (id),
        foreign key (created_by) references auth.users (id),
        constraint fk_poster_must_be_on_team foreign key (team_id, created_by) references public.accounts (team_id, id)
    );

-- RLS: Posts
alter table public.posts enable row level security;

-- Feed is public
create policy "Global Feed is public" on public.posts for
select
    using (true);

-- Only team members can post
create policy "Team members can create posts" on public.posts for insert
with
    check (
        team_id in (
            select
                team_id
            from
                public.accounts
            where
                id = auth.uid ()
        )
    );

/*
 * -------------------------------------------------------
 * Section: Follows
 * Description: Table to manage follow relationships between teams.
 * Teams can follow other teams to see their posts in a personalized feed.
 * -------------------------------------------------------
 */
create table if not exists
    public.follows (
        follower_team_id uuid not null references public.teams (id),
        following_team_id uuid not null references public.teams (id),
        created_at timestamp with time zone default now(),
        primary key (follower_team_id, following_team_id),
        -- Constraint: Team cannot follow itself 
        constraint check_not_self_follow check (follower_team_id != following_team_id)
    );

-- RLS: Follows
alter table public.follows enable row level security;

create policy "Follows are public" on public.follows for
select
    using (true);

-- Only team members can follow others 
create policy "Team members can follow" on public.follows for insert
with
    check (
        follower_team_id in (
            select
                team_id
            from
                public.accounts
            where
                id = auth.uid ()
        )
    );

create policy "Team members can unfollow" on public.follows for delete using (
    follower_team_id in (
        select
            team_id
        from
            public.accounts
        where
            id = auth.uid ()
    )
);

/*
 * -------------------------------------------------------
 * Section: Triggers
 * Description: Triggers to automatically set the team_id for posts and follows based on the user's team.
 * This ensures that users can only create posts and follows associated with their own team.
 * -------------------------------------------------------
 */
-- Function for POSTS
create
or replace function kit.auto_assign_post_team () returns trigger language plpgsql security definer as $$
begin
  select team_id into new.team_id
  from public.accounts where id = auth.uid();
  new.created_by := auth.uid();
  return new;
end;
$$;

create trigger tr_auto_assign_post_team before insert on public.posts for each row
execute function kit.auto_assign_post_team ();

-- Function for FOLLOWS (Assigns 'follower_team_id')
create
or replace function kit.auto_assign_follower_team () returns trigger language plpgsql security definer as $$
begin
  select team_id into new.follower_team_id
  from public.accounts where id = auth.uid();
  return new;
end;
$$;

create trigger tr_auto_assign_follower_team before insert on public.follows for each row
execute function kit.auto_assign_follower_team ();

/*
 * -------------------------------------------------------
 * Section: Indexes
 * Description: Indexes to optimize query performance for posts and follows.
 * -------------------------------------------------------
 */
create index posts_team_id_idx on public.posts (team_id);

create index posts_created_at_idx on public.posts (created_at desc);

-- For Feed ordering
create index follows_follower_idx on public.follows (follower_team_id);