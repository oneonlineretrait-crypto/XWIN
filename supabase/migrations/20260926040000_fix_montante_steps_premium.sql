create or replace view public.montante_steps_public as
 SELECT s.id,
    s.montante_id,
    s.step_number,
    s.result,
    s.created_at,
        CASE
            WHEN m.access_level = 'free'::text OR is_admin() OR (m.access_level = 'paid'::text AND is_vip()) OR has_purchased('montante'::text, s.montante_id) THEN s.stake
            ELSE NULL::numeric
        END AS stake,
        CASE
            WHEN m.access_level = 'free'::text OR is_admin() OR (m.access_level = 'paid'::text AND is_vip()) OR has_purchased('montante'::text, s.montante_id) THEN s.odds
            ELSE NULL::numeric
        END AS odds,
        CASE
            WHEN m.access_level = 'free'::text OR is_admin() OR (m.access_level = 'paid'::text AND is_vip()) OR has_purchased('montante'::text, s.montante_id) THEN s.pick
            ELSE NULL::text
        END AS pick,
        CASE
            WHEN m.access_level = 'free'::text OR is_admin() OR (m.access_level = 'paid'::text AND is_vip()) OR has_purchased('montante'::text, s.montante_id) THEN s.bankroll_after
            ELSE NULL::numeric
        END AS bankroll_after
   FROM montante_steps s
     JOIN montantes m ON m.id = s.montante_id;
