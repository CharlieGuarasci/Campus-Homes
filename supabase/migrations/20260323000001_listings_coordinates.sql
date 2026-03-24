-- Add latitude and longitude to listings
alter table public.listings
  add column if not exists latitude numeric,
  add column if not exists longitude numeric;
