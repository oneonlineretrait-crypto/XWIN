-- Abonnements aux notifications push
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "own subscriptions select" on public.push_subscriptions;
create policy "own subscriptions select" on public.push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "own subscriptions insert" on public.push_subscriptions;
create policy "own subscriptions insert" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "own subscriptions update" on public.push_subscriptions;
create policy "own subscriptions update" on public.push_subscriptions
  for update using (auth.uid() = user_id);

drop policy if exists "own subscriptions delete" on public.push_subscriptions;
create policy "own subscriptions delete" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- Licences VIP : chaque code n'est valable que sur le compte pour lequel il a été créé
create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  days integer not null check (days > 0),
  redeemed boolean not null default false,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.licenses enable row level security;

drop policy if exists "admin manage licenses" on public.licenses;
create policy "admin manage licenses" on public.licenses
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Active un code de licence sur le compte connecté (et uniquement celui-ci)
create or replace function public.redeem_license(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_license public.licenses%rowtype;
  v_base timestamptz;
begin
  select * into v_license from public.licenses
    where code = upper(trim(p_code))
    for update;

  if not found then
    return 'Code invalide.';
  end if;

  if v_license.user_id <> auth.uid() then
    return 'Ce code n''est pas valable sur ce compte.';
  end if;

  if v_license.redeemed then
    return 'Ce code a déjà été utilisé.';
  end if;

  select greatest(coalesce(subscription_expires_at, now()), now()) into v_base
    from public.profiles where id = auth.uid();

  update public.profiles
    set subscription_status = 'vip',
        subscription_expires_at = v_base + make_interval(days => v_license.days)
    where id = auth.uid();

  update public.licenses
    set redeemed = true, redeemed_at = now()
    where id = v_license.id;

  return 'ok';
end;
$$;

grant execute on function public.redeem_license(text) to authenticated;
