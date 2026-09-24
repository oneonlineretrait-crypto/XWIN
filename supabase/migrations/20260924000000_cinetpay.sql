-- Colonnes nécessaires au suivi des paiements CinetPay
alter table public.purchases add column if not exists provider text not null default 'cinetpay';
alter table public.purchases add column if not exists transaction_id text unique;
alter table public.purchases add column if not exists plan text;
alter table public.purchases add column if not exists paid_at timestamptz;
