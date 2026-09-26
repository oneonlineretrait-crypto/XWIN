-- Ajoute le palier 'premium' : contrairement à 'paid', le statut VIP ne le débloque jamais.
-- Seuls un achat ou une licence dédiée à cet article précis y donnent accès.
do $$
declare
  v_conname text;
begin
  select conname into v_conname
    from pg_constraint
    where conrelid = 'public.montantes'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%access_level%';
  if v_conname is not null then
    execute format('alter table public.montantes drop constraint %I', v_conname);
  end if;
end $$;

alter table public.montantes add constraint montantes_access_level_check
  check (access_level in ('free', 'paid', 'premium'));

do $$
declare
  v_conname text;
begin
  select conname into v_conname
    from pg_constraint
    where conrelid = 'public.pronostics'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%access_level%';
  if v_conname is not null then
    execute format('alter table public.pronostics drop constraint %I', v_conname);
  end if;
end $$;

alter table public.pronostics add constraint pronostics_access_level_check
  check (access_level in ('free', 'paid', 'premium'));
