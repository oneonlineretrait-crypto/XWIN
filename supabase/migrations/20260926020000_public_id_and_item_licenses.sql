-- Identifiant public de compte : à donner à l'admin à la place du mail pour générer une licence
create or replace function public.gen_public_id()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return result;
end;
$$;

alter table public.profiles add column if not exists public_id text;

update public.profiles set public_id = public.gen_public_id() where public_id is null;

alter table public.profiles alter column public_id set default public.gen_public_id();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_public_id_unique'
  ) then
    alter table public.profiles add constraint profiles_public_id_unique unique (public_id);
  end if;
end $$;

alter table public.profiles alter column public_id set not null;

-- Les licences peuvent maintenant aussi débloquer un article précis (produit, montante, pronostic),
-- pas seulement le statut VIP — toujours lié à un seul compte, comme avant.
alter table public.licenses add column if not exists kind text not null default 'vip' check (kind in ('vip', 'item'));
alter table public.licenses add column if not exists item_type text check (item_type in ('product', 'montante', 'pronostic'));
alter table public.licenses add column if not exists item_id uuid;
alter table public.licenses alter column days drop not null;

alter table public.licenses drop constraint if exists licenses_kind_shape;
alter table public.licenses add constraint licenses_kind_shape check (
  (kind = 'vip' and days is not null and item_type is null and item_id is null)
  or (kind = 'item' and item_type is not null and item_id is not null and days is null)
);

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

  if v_license.kind = 'vip' then
    select greatest(coalesce(subscription_expires_at, now()), now()) into v_base
      from public.profiles where id = auth.uid();

    update public.profiles
      set subscription_status = 'vip',
          subscription_expires_at = v_base + make_interval(days => v_license.days)
      where id = auth.uid();
  else
    insert into public.purchases (user_id, item_type, item_id, amount, payment_status, provider, paid_at)
    values (auth.uid(), v_license.item_type, v_license.item_id, 0, 'paid', 'license', now());
  end if;

  update public.licenses
    set redeemed = true, redeemed_at = now()
    where id = v_license.id;

  return 'ok';
end;
$$;

grant execute on function public.redeem_license(text) to authenticated;
