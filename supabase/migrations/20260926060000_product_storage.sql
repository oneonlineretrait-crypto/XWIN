-- Bucket privé pour les fichiers de stratégies/formations (jamais accessible directement, seulement via URL signée)
insert into storage.buckets (id, name, public)
values ('product-content', 'product-content', false)
on conflict (id) do nothing;

drop policy if exists "admin manage product content" on storage.objects;
create policy "admin manage product content" on storage.objects
  for all using (bucket_id = 'product-content' and is_admin())
  with check (bucket_id = 'product-content' and is_admin());

-- Colonnes pour référencer le fichier stocké (plutôt qu'un lien externe)
alter table public.products add column if not exists content_path text;
alter table public.products add column if not exists content_type text check (content_type in ('pdf', 'video'));

-- La vue publique masque aussi content_path tant que l'achat n'est pas confirmé (même règle que content_url)
-- Les nouvelles colonnes sont ajoutées à la fin (Postgres l'exige pour un CREATE OR REPLACE VIEW)
create or replace view public.products_public as
 SELECT id,
    type,
    title,
    price,
    created_at,
        CASE
            WHEN is_admin() OR has_purchased('product'::text, id) THEN description
            ELSE NULL::text
        END AS description,
        CASE
            WHEN is_admin() OR has_purchased('product'::text, id) THEN content_url
            ELSE NULL::text
        END AS content_url,
    content_type,
        CASE
            WHEN is_admin() OR has_purchased('product'::text, id) THEN content_path
            ELSE NULL::text
        END AS content_path
   FROM products p;
