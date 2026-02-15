/*
 * -------------------------------------------------------
 * Migration: Post-OAuth Team Assignment RPC
 *
 * After OAuth sign-up, the on_auth_user_created trigger creates a default
 * team (from the Google profile name). This RPC lets the frontend fix the
 * team assignment once the user lands in the app.
 *
 * - p_team_id:   join an existing team (moves the account, deletes the
 *                auto-created team if it has no other members)
 * - p_team_name: rename the auto-created team
 * -------------------------------------------------------
 */
create or replace function public.handle_post_oauth_team_assignment(
  p_team_id uuid default null,
  p_team_name text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_team_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get the user's current (auto-created) team
  select team_id into v_current_team_id
    from public.accounts
   where id = v_user_id;

  if v_current_team_id is null then
    raise exception 'Account not found';
  end if;

  if p_team_id is not null then
    -- JOIN EXISTING TEAM
    if not exists (select 1 from public.teams where id = p_team_id) then
      raise exception 'Team not found';
    end if;

    -- Point the account to the chosen team
    update public.accounts
       set team_id = p_team_id
     where id = v_user_id;

    -- Delete the orphaned auto-created team (only if empty)
    delete from public.teams
     where id = v_current_team_id
       and not exists (
         select 1 from public.accounts
          where team_id = v_current_team_id
       );

  elsif p_team_name is not null and trim(p_team_name) <> '' then
    -- RENAME the auto-created team
    update public.teams
       set name = trim(p_team_name)
     where id = v_current_team_id;
  end if;
end;
$$;

-- Allow authenticated users to call this function
grant execute on function public.handle_post_oauth_team_assignment(uuid, text)
  to authenticated;
