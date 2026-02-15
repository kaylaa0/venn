set
    local role authenticated;

set
    local "request.jwt.claim.sub" = 'USER_ID_OF_TEST_ACCOUNT';

-- INSERT POST
insert into
    public.posts (content)
values
    ('Hello from the SQL Editor!');

select
    *
from
    public.posts
where
    team_id = (
        select
            team_id
        from
            public.accounts
        where
            id = 'USER_ID_OF_TEST_ACCOUNT'
    )
order by
    created_at desc
limit
    5;