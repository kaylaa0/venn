insert into
    auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data
    )
values
    (
        gen_random_uuid (),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'test@test.com',
        'fake_password_hash',
        now(),
        '{"team_id": "INSERT_TEAM_ID"}'::jsonb
    );

select
    *
from
    public.accounts
order by
    created_at desc
limit
    5;