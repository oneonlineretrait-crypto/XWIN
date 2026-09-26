create or replace view public.pronostics_public as
 SELECT p.id,
    p.match_id,
    m.sport,
    m.competition,
    m.match_teams,
    m.match_date,
    p.access_level,
    p.price,
    p.status,
    p.created_at,
        CASE
            WHEN p.access_level = 'free'::text OR is_admin() OR (p.access_level = 'paid'::text AND is_vip()) OR has_purchased('pronostic'::text, p.id) THEN p.pick
            ELSE NULL::text
        END AS pick,
        CASE
            WHEN p.access_level = 'free'::text OR is_admin() OR (p.access_level = 'paid'::text AND is_vip()) OR has_purchased('pronostic'::text, p.id) THEN p.odds
            ELSE NULL::numeric
        END AS odds,
        CASE
            WHEN p.access_level = 'free'::text OR is_admin() OR (p.access_level = 'paid'::text AND is_vip()) OR has_purchased('pronostic'::text, p.id) THEN p.analysis
            ELSE NULL::text
        END AS analysis
   FROM pronostics p
     JOIN matches m ON m.id = p.match_id;
