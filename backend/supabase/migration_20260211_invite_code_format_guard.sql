-- Restrict invitation_code rules:
-- 1) 2305427577@qq.com must be exactly XHB-LLQ
-- 2) 1057289305@qq.com must be exactly LLQ-XHB
-- 3) all other users must use GIFT-XXXX (uppercase alnum)
-- Run in Supabase SQL Editor.

begin;

alter table public.users
  drop constraint if exists users_invitation_code_format_check;

alter table public.users
  add constraint users_invitation_code_format_check
  check (
    invitation_code is null
    or (
      email not in ('2305427577@qq.com', '1057289305@qq.com')
      and invitation_code ~ '^GIFT-[A-Z0-9]{4}$'
    )
    or (email = '2305427577@qq.com' and invitation_code = 'XHB-LLQ')
    or (email = '1057289305@qq.com' and invitation_code = 'LLQ-XHB')
  );

commit;
