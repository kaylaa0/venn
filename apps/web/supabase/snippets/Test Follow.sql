set
    local role authenticated;

set
    local "request.jwt.claim.sub" = 'USER_ID_OF_TEST_ACCOUNT';

-- Attempt to Follow
insert into
    public.follows (following_team_id)
values
    ('TEAM_ID_TO_FOLLOW');

-- Check Results
select
    *
from
    public.follows
where
    follower_team_id = 'TEAM_ID_OF_TEST_ACCOUNT'
    and following_team_id = 'TEAM_ID_TO_FOLLOW';