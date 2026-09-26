-- Corrige les licences "article" déjà activées avec le mauvais statut (ne débloquaient rien)
update public.purchases set payment_status = 'paid'
  where provider = 'license' and payment_status = 'completed';

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
