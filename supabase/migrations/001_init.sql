-- ============================================================
-- 001_init.sql  –  Superteam Nepal Ambassador Leaderboard
-- ============================================================

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

create table if not exists ambassadors (
  id          uuid        primary key default gen_random_uuid(),
  username    text        unique not null,
  avatar_url  text,
  skills      text[],
  total_xp    integer     not null default 0,
  monthly_xp  integer     not null default 0,
  weekly_xp   integer     not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists xp_transactions (
  id             uuid        primary key default gen_random_uuid(),
  ambassador_id  uuid        references ambassadors(id) on delete cascade,
  amount         integer     not null,
  reason         text,
  category       text,
  awarded_by     text,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------

create index if not exists idx_ambassadors_total_xp   on ambassadors (total_xp   desc);
create index if not exists idx_ambassadors_monthly_xp on ambassadors (monthly_xp desc);
create index if not exists idx_xp_transactions_ambassador_id on xp_transactions (ambassador_id);

-- ------------------------------------------------------------
-- Seed data – 10 Nepali ambassadors
-- ------------------------------------------------------------

insert into ambassadors (username, avatar_url, skills, total_xp, monthly_xp, weekly_xp) values
  (
    'aarav_shrestha',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=aarav',
    array['Development', 'Community'],
    2980, 420, 95
  ),
  (
    'priya_maharjan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    array['Design', 'Content', 'Marketing'],
    2640, 510, 140
  ),
  (
    'bikash_thapa',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=bikash',
    array['Development', 'Design'],
    2310, 375, 80
  ),
  (
    'sita_rai',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=sita',
    array['Marketing', 'Community', 'Content'],
    1975, 290, 60
  ),
  (
    'roshan_karki',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=roshan',
    array['Development'],
    1760, 240, 55
  ),
  (
    'anisha_gurung',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=anisha',
    array['Content', 'Community'],
    1430, 195, 40
  ),
  (
    'dipesh_limbu',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=dipesh',
    array['Development', 'Marketing'],
    1120, 160, 35
  ),
  (
    'kabita_poudel',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=kabita',
    array['Design', 'Content'],
    780, 110, 25
  ),
  (
    'nischal_bhandari',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=nischal',
    array['Community', 'Marketing', 'Development'],
    520, 75, 20
  ),
  (
    'manisha_tamang',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=manisha',
    array['Design', 'Community'],
    215, 30, 10
  );

-- ------------------------------------------------------------
-- Seed xp_transactions (a few entries per ambassador)
-- ------------------------------------------------------------

insert into xp_transactions (ambassador_id, amount, reason, category, awarded_by)
select id, 500,  'Hackathon winner – Solana Radar',  'Development', 'admin'  from ambassadors where username = 'aarav_shrestha'
union all
select id, 1200, 'Ecosystem growth contribution',    'Community',   'admin'  from ambassadors where username = 'aarav_shrestha'
union all
select id, 1280, 'Q1 bonus',                         'Development', 'admin'  from ambassadors where username = 'aarav_shrestha'
union all
select id, 800,  'Brand design sprint',              'Design',      'admin'  from ambassadors where username = 'priya_maharjan'
union all
select id, 900,  'Social media campaign – 10k reach','Marketing',   'admin'  from ambassadors where username = 'priya_maharjan'
union all
select id, 940,  'Monthly content batch',            'Content',     'admin'  from ambassadors where username = 'priya_maharjan'
union all
select id, 1100, 'dApp prototype – DeFi track',      'Development', 'admin'  from ambassadors where username = 'bikash_thapa'
union all
select id, 1210, 'UI kit open-source release',       'Design',      'admin'  from ambassadors where username = 'bikash_thapa'
union all
select id, 975,  'Kathmandu meetup organiser',       'Community',   'admin'  from ambassadors where username = 'sita_rai'
union all
select id, 1000, 'Growth campaign lead',             'Marketing',   'admin'  from ambassadors where username = 'sita_rai'
union all
select id, 1760, 'Smart-contract audit contribution','Development', 'admin'  from ambassadors where username = 'roshan_karki'
union all
select id, 1430, 'Newsletter series (8 issues)',     'Content',     'admin'  from ambassadors where username = 'anisha_gurung'
union all
select id, 620,  'Workshop: Intro to Solana',        'Development', 'admin'  from ambassadors where username = 'dipesh_limbu'
union all
select id, 500,  'Twitter space co-host',            'Marketing',   'admin'  from ambassadors where username = 'dipesh_limbu'
union all
select id, 780,  'Rebrand assets for local chapter', 'Design',      'admin'  from ambassadors where username = 'kabita_poudel'
union all
select id, 520,  'Discord community moderation',     'Community',   'admin'  from ambassadors where username = 'nischal_bhandari'
union all
select id, 215,  'Onboarding new members',           'Community',   'admin'  from ambassadors where username = 'manisha_tamang';
