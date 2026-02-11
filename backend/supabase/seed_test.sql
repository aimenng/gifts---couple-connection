-- Gifts app test seed data (idempotent)
-- Test login accounts (all password: Passw0rd!)
--   lili@example.com   (bound with tom@example.com)
--   tom@example.com    (bound with lili@example.com)
--   alice@example.com  (unbound)
--   bob@example.com    (unbound)
--   coco@example.com   (unbound)
--   dylan@example.com  (unbound)
-- Invite codes:
--   GIFT-LILI, GIFT-TOM1, GIFT-ALC1, GIFT-BOB1, GIFT-COC1, GIFT-DYL1

begin;

-- Remove conflicting rows that may already use these emails with different ids.
delete from public.users
where email in (
  'lili@example.com',
  'tom@example.com',
  'alice@example.com',
  'bob@example.com',
  'coco@example.com',
  'dylan@example.com'
)
  and id not in (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-1111-4333-8333-333333333334',
    '44444444-1111-4444-8444-444444444445',
    '55555555-1111-4555-8555-555555555556',
    '66666666-1111-4666-8666-666666666667'
  );

insert into public.users (
  id,
  email,
  password_hash,
  invitation_code,
  bound_invitation_code,
  email_verified,
  created_at,
  name,
  avatar,
  gender,
  partner_id
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'lili@example.com',
    '$2b$10$r5Lk8ZGWA7lkf0ftS.ZuYON94bdoRtMA3B1maqJrnJG/6mVIxa/ne',
    'GIFT-LILI',
    'GIFT-TOM1',
    true,
    timezone('utc', now()),
    'Lili',
    null,
    'female',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'tom@example.com',
    '$2b$10$r5Lk8ZGWA7lkf0ftS.ZuYON94bdoRtMA3B1maqJrnJG/6mVIxa/ne',
    'GIFT-TOM1',
    'GIFT-LILI',
    true,
    timezone('utc', now()),
    'Tom',
    null,
    'male',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '33333333-1111-4333-8333-333333333334',
    'alice@example.com',
    '$2b$10$r5Lk8ZGWA7lkf0ftS.ZuYON94bdoRtMA3B1maqJrnJG/6mVIxa/ne',
    'GIFT-ALC1',
    null,
    true,
    timezone('utc', now()),
    'Alice',
    null,
    'female',
    null
  ),
  (
    '44444444-1111-4444-8444-444444444445',
    'bob@example.com',
    '$2b$10$r5Lk8ZGWA7lkf0ftS.ZuYON94bdoRtMA3B1maqJrnJG/6mVIxa/ne',
    'GIFT-BOB1',
    null,
    true,
    timezone('utc', now()),
    'Bob',
    null,
    'male',
    null
  ),
  (
    '55555555-1111-4555-8555-555555555556',
    'coco@example.com',
    '$2b$10$r5Lk8ZGWA7lkf0ftS.ZuYON94bdoRtMA3B1maqJrnJG/6mVIxa/ne',
    'GIFT-COC1',
    null,
    true,
    timezone('utc', now()),
    'Coco',
    null,
    'female',
    null
  ),
  (
    '66666666-1111-4666-8666-666666666667',
    'dylan@example.com',
    '$2b$10$r5Lk8ZGWA7lkf0ftS.ZuYON94bdoRtMA3B1maqJrnJG/6mVIxa/ne',
    'GIFT-DYL1',
    null,
    true,
    timezone('utc', now()),
    'Dylan',
    null,
    'male',
    null
  )
on conflict (id) do update set
  email = excluded.email,
  password_hash = excluded.password_hash,
  invitation_code = excluded.invitation_code,
  bound_invitation_code = excluded.bound_invitation_code,
  email_verified = excluded.email_verified,
  name = excluded.name,
  avatar = excluded.avatar,
  gender = excluded.gender,
  partner_id = excluded.partner_id;

insert into public.user_settings (
  user_id,
  together_date,
  is_connected,
  updated_at
)
values
  ('11111111-1111-4111-8111-111111111111', '2022-02-14', true, timezone('utc', now())),
  ('22222222-2222-4222-8222-222222222222', '2022-02-14', true, timezone('utc', now())),
  ('33333333-1111-4333-8333-333333333334', '2023-05-20', false, timezone('utc', now())),
  ('44444444-1111-4444-8444-444444444445', '2023-06-18', false, timezone('utc', now())),
  ('55555555-1111-4555-8555-555555555556', '2023-09-12', false, timezone('utc', now())),
  ('66666666-1111-4666-8666-666666666667', '2024-01-06', false, timezone('utc', now()))
on conflict (user_id) do update set
  together_date = excluded.together_date,
  is_connected = excluded.is_connected,
  updated_at = excluded.updated_at;

insert into public.memories (
  id,
  user_id,
  title,
  date,
  image,
  rotation,
  created_at,
  updated_at
)
values
  (
    '33333333-3333-4333-8333-333333333331',
    '11111111-1111-4111-8111-111111111111',
    'First Date',
    '2022-02-14',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2',
    '-rotate-1',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    '11111111-1111-4111-8111-111111111111',
    'Beach Walk',
    '2023-08-10',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    'rotate-1',
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    'Cooked Dinner',
    '2024-01-20',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    '-rotate-1',
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  image = excluded.image,
  rotation = excluded.rotation,
  updated_at = excluded.updated_at;

insert into public.events (
  id,
  user_id,
  title,
  subtitle,
  date,
  type,
  image,
  created_at,
  updated_at
)
values
  (
    '44444444-4444-4444-8444-444444444441',
    '11111111-1111-4111-8111-111111111111',
    'Anniversary',
    'Our special day',
    '2022-02-14',
    'Anniversary',
    null,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '44444444-4444-4444-8444-444444444442',
    '11111111-1111-4111-8111-111111111111',
    'Birthday',
    'Remember the cake',
    '2026-09-28',
    'Birthday',
    null,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '44444444-4444-4444-8444-444444444443',
    '22222222-2222-4222-8222-222222222222',
    'Summer Trip',
    'Plan a sea-view trip',
    '2026-07-01',
    'Trip',
    null,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  date = excluded.date,
  type = excluded.type,
  image = excluded.image,
  updated_at = excluded.updated_at;

insert into public.notifications (
  id,
  user_id,
  title,
  message,
  type,
  read,
  created_at
)
values
  (
    '55555555-5555-4555-8555-555555555551',
    '11111111-1111-4111-8111-111111111111',
    'Welcome back',
    'Test data is ready. You can start app verification now.',
    'system',
    false,
    timezone('utc', now())
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    '11111111-1111-4111-8111-111111111111',
    'Connection synced',
    'You and Tom are successfully linked.',
    'interaction',
    false,
    timezone('utc', now())
  ),
  (
    '55555555-5555-4555-8555-555555555553',
    '22222222-2222-4222-8222-222222222222',
    'Connection synced',
    'You and Lili are successfully linked.',
    'interaction',
    false,
    timezone('utc', now())
  ),
  (
    '55555555-5555-4555-8555-555555555554',
    '33333333-1111-4333-8333-333333333334',
    'Invite Ready',
    'Use your invite code to test binding flow.',
    'system',
    false,
    timezone('utc', now())
  )
on conflict (id) do update set
  title = excluded.title,
  message = excluded.message,
  type = excluded.type,
  read = excluded.read,
  created_at = excluded.created_at;

commit;
