/*
 * -------------------------------------------------------
 * Venn Social Platform
 * This is an edited version of the original schema.sql file from Makerkit. 
 * It includes a team based profile instead of a user based profile.
 * -------------------------------------------------------
 */
/*
 * -------------------------------------------------------
 * Section: Revoke default privileges from public schema
 * We will revoke all default privileges from public schema on functions to prevent public access to them
 * -------------------------------------------------------
 */
-- Create a private Makerkit schema
create schema if not exists kit;

create extension if not exists "unaccent" schema kit;

-- We remove all default privileges from public schema on functions to
--   prevent public access to them
alter default privileges
revoke
execute on functions
from
    public;

revoke all on schema public
from
    public;

revoke all PRIVILEGES on database "postgres"
from
    "anon";

revoke all PRIVILEGES on schema "public"
from
    "anon";

revoke all PRIVILEGES on schema "storage"
from
    "anon";

revoke all PRIVILEGES on all SEQUENCES in schema "public"
from
    "anon";

revoke all PRIVILEGES on all SEQUENCES in schema "storage"
from
    "anon";

revoke all PRIVILEGES on all FUNCTIONS in schema "public"
from
    "anon";

revoke all PRIVILEGES on all FUNCTIONS in schema "storage"
from
    "anon";

revoke all PRIVILEGES on all TABLES in schema "public"
from
    "anon";

revoke all PRIVILEGES on all TABLES in schema "storage"
from
    "anon";

-- We remove all default privileges from public schema on functions to
--   prevent public access to them by default
alter default privileges in schema public
revoke
execute on functions
from
    anon,
    authenticated;

-- we allow the authenticated role to execute functions in the public schema
grant usage on schema public to authenticated;

-- we allow the service_role role to execute functions in the public schema
grant usage on schema public to service_role;

/*
 * -------------------------------------------------------
 * Section: Teams
 * We create the schema for the teams.
 * -------------------------------------------------------
 */
-- Teams table
create table if not exists
    public.teams (
        id uuid unique not null default gen_random_uuid (),
        name varchar(255) not null,
        picture_url varchar(1000),
        updated_at timestamp with time zone default now(),
        created_at timestamp with time zone default now(),
        created_by uuid references auth.users,
        updated_by uuid references auth.users,
        public_data jsonb default '{}'::jsonb not null,
        primary key (id)
    );

comment on table public.teams is 'The teams that users can belong to. A user must belong to one team only.';

comment on column public.teams.name is 'The name of the team';

comment on column public.teams.picture_url is 'The picture url of the team';

comment on column public.teams.updated_at is 'The timestamp when the team was last updated';

comment on column public.teams.created_at is 'The timestamp when the team was created';

comment on column public.teams.created_by is 'The user who created the team';

comment on column public.teams.updated_by is 'The user who last updated the team';

comment on column public.teams.public_data is 'The public data of the team. Use this to store any additional data that you want to store for the team';

-- Enable RLS on the teams table
alter table public.teams enable row level security;

/*
 * -------------------------------------------------------
 * Section: Accounts
 * We create the schema for the accounts.
 * -------------------------------------------------------
 */
-- Accounts table
create table if not exists
    public.accounts (
        id uuid unique not null default extensions.uuid_generate_v4 (),
        email varchar(320) unique,
        team_id uuid not null references public.teams (id),
        created_at timestamp with time zone default now(),
        primary key (id),
        constraint unique_account_membership unique (team_id, id)
    );

comment on table public.accounts is 'Accounts are the top level entity in the Supabase MakerKit';

comment on column public.accounts.email is 'The email of the account. For teams, this is the email of the team (if any)';

comment on column public.accounts.team_id is 'The team that the account belongs to';

comment on column public.accounts.created_at is 'The timestamp when the account was created';

-- Enable RLS on the accounts table
alter table "public"."accounts" enable row level security;

/*
 * -------------------------------------------------------
 * Section: Policies and triggers for Teams 
 * -------------------------------------------------------
 */
-- SELECT(teams):
-- Everyone can read teams
grant usage on schema public to anon;

grant
select
    on table public.teams to anon;

create policy teams_read on public.teams for
select
    to public using (true);

-- UPDATE(teams):
-- Users can update their own teams
create policy teams_update on public.teams for
update to authenticated using (
    id in (
        select
            team_id
        from
            public.accounts
        where
            id = auth.uid ()
    )
)
with
    check (
        id in (
            select
                team_id
            from
                public.accounts
            where
                id = auth.uid ()
        )
    );

-- Revoke all on accounts table from authenticated and service_role
revoke all on public.teams
from
    authenticated,
    service_role;

-- Open up access to teams
grant
select
,
    insert,
update,
delete on table public.teams to authenticated,
service_role;

-- Function "kit.protect_team_fields"
-- Function to protect team fields from being updated by anyone
create
or replace function kit.protect_team_fields () returns trigger as $$
begin
    if current_user in ('authenticated', 'anon') then
        if new.id <> old.id then
            raise exception 'You do not have permission to update this field';

        end if;

    end if;

    return NEW;

end $$ language plpgsql
set
    search_path = '';

-- trigger to protect team fields
create trigger protect_team_fields before
update on public.teams for each row
execute function kit.protect_team_fields ();

/*
 * -------------------------------------------------------
 * Section: Policies and triggers for Accounts 
 * -------------------------------------------------------
 */
-- SELECT(accounts):
-- Users can read their own accounts
create policy accounts_read on public.accounts for
select
    to authenticated using (
        (
            select
                auth.uid ()
        ) = id
    );

-- UPDATE(accounts):
-- Users can update their own accounts
create policy accounts_update on public.accounts for
update to authenticated using (
    (
        select
            auth.uid ()
    ) = id
)
with
    check (
        (
            select
                auth.uid ()
        ) = id
    );

-- Revoke all on accounts table from authenticated and service_role
revoke all on public.accounts
from
    authenticated,
    service_role;

-- Open up access to accounts
grant
select
,
    insert,
update,
delete on table public.accounts to authenticated,
service_role;

-- Function "kit.protect_account_fields"
-- Function to protect account fields from being updated by anyone
create
or replace function kit.protect_account_fields () returns trigger as $$
begin
    if current_user in ('authenticated', 'anon') then
        if new.id <> old.id or new.email <> old.email then
            raise exception 'You do not have permission to update this field';

        end if;

    end if;

    return NEW;

end
$$ language plpgsql
set
    search_path = '';

-- trigger to protect account fields
create trigger protect_account_fields before
update on public.accounts for each row
execute function kit.protect_account_fields ();

-- create a trigger to update the account email when the primary owner email is updated
create
or replace function kit.handle_update_user_email () returns trigger language plpgsql security definer
set
    search_path = '' as $$
begin
    update
        public.accounts
    set email = new.email
    where id = new.id;

    return new;

end;

$$;

-- trigger the function every time a user email is updated only if the user is the primary owner of the account and
-- the account is personal account
create trigger "on_auth_user_updated"
after
update of email on auth.users for each row
execute procedure kit.handle_update_user_email ();

-- Function "kit.new_user_created_setup"
-- Setup a new user account after user creation
create
or replace function kit.new_user_created_setup () returns trigger language plpgsql security definer as $$
declare
    team_name_val text;
    user_picture  text;
    provided_team_id uuid;
    target_team_id   uuid;
begin
    -- Read the custom team name from dedicated key "team_name".
    -- Falls back to "name" (legacy) then to "<local-part>'s Team".
    team_name_val := coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'team_name'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
        split_part(new.email, '@', 1) || '''s Team'
    );

    user_picture := new.raw_user_meta_data ->> 'avatar_url';

    -- Did the user choose an existing team?
    begin
        provided_team_id := (new.raw_user_meta_data ->> 'team_id')::uuid;
    exception when others then
        provided_team_id := null;
    end;

    if provided_team_id is not null then
        -- PATH A: JOIN EXISTING
        -- We strictly check if it exists.
        if exists (select 1 from public.teams where id = provided_team_id) then
            target_team_id := provided_team_id;
        else
            -- STOP! The user tried to join a team that doesn't exist.
            -- We raise an error so the frontend knows something is wrong.
            raise exception 'Team not found. Cannot join non-existent team.';
        end if;
    else
        -- PATH B: CREATE NEW
        insert into public.teams (name, picture_url, created_by)
        values (team_name_val, user_picture, new.id)
        returning id into target_team_id;
    end if;

    -- FINAL STEP: Create Account
    insert into public.accounts (id, email, team_id)
    values (new.id, new.email, target_team_id);

    return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure kit.new_user_created_setup ();

/*
 * -------------------------------------------------------
 * Section: Storage
 * -------------------------------------------------------
 */
-- Team Image
insert into
    storage.buckets (id, name, PUBLIC)
values
    ('team_image', 'team_image', true);

-- Function: get the storage filename as a UUID.
-- Useful if you want to name files with UUIDs related to an account
create
or replace function kit.get_storage_filename_as_uuid (name text) returns uuid
set
    search_path = '' as $$
begin
    return replace(storage.filename(name), concat('.',
                                                  storage.extension(name)), '')::uuid;

end;

$$ language plpgsql;

grant
execute on function kit.get_storage_filename_as_uuid (text) to authenticated,
service_role;

-- RLS policies for storage bucket team_image
create policy "Allow read access to team images" on storage.objects for
select
    using (bucket_id = 'team_image');

create policy "Allow insert access to team images" on storage.objects for insert
with
    check (
        bucket_id = 'team_image'
        and auth.role () = 'authenticated'
        and (storage.foldername (name)) [1]::uuid in (
            select
                team_id
            from
                public.accounts
            where
                id = auth.uid ()
        )
    );

create policy "Allow update access to team images" on storage.objects for
update using (
    bucket_id = 'team_image'
    and auth.role () = 'authenticated'
    and (storage.foldername (name)) [1]::uuid in (
        select
            team_id
        from
            public.accounts
        where
            id = auth.uid ()
    )
);

create policy "Allow delete access to team images" on storage.objects for delete using (
    bucket_id = 'team_image'
    and auth.role () = 'authenticated'
    and (storage.foldername (name)) [1]::uuid in (
        select
            team_id
        from
            public.accounts
        where
            id = auth.uid ()
    )
);