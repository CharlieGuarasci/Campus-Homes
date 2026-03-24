-- =============================================================================
-- Enhanced Profiles & Listings — Additive Migration
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES: new columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists home_university text,
  add column if not exists age int,
  add column if not exists sleep_habits text check (sleep_habits in ('early_bird', 'night_owl', 'flexible')),
  add column if not exists party_level text check (party_level in ('never', 'once_a_month', 'once_a_week', 'multiple_per_week')),
  add column if not exists substance_preferences text[],
  add column if not exists cleanliness text check (cleanliness in ('very_clean', 'clean', 'moderate', 'relaxed')),
  add column if not exists personality_traits text[],
  add column if not exists interests text[],
  add column if not exists budget_min numeric,
  add column if not exists budget_max numeric,
  add column if not exists move_in_date date,
  add column if not exists move_out_date date;

-- ---------------------------------------------------------------------------
-- LISTINGS: new columns
-- ---------------------------------------------------------------------------
alter table public.listings
  add column if not exists room_size_sqft numeric,
  add column if not exists room_furnishings text[],
  add column if not exists has_ac boolean default false,
  add column if not exists has_heating boolean default true,
  add column if not exists has_laundry boolean default false,
  add column if not exists laundry_type text check (laundry_type in ('in_unit', 'in_building', 'none')),
  add column if not exists has_dishwasher boolean default false,
  add column if not exists has_parking boolean default false,
  add column if not exists kitchen_arrangement text check (kitchen_arrangement in ('split_food', 'buy_your_own', 'flexible')),
  add column if not exists guest_policy text check (guest_policy in ('anytime', 'with_notice', 'rarely', 'no_overnight')),
  add column if not exists house_cleanliness text check (house_cleanliness in ('very_clean', 'clean', 'moderate', 'relaxed'));

-- ---------------------------------------------------------------------------
-- LISTING_HOUSEMATES: new table
-- ---------------------------------------------------------------------------
create table if not exists public.listing_housemates (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  name text not null,
  program text,
  year_of_study int,
  sleep_habits text check (sleep_habits in ('early_bird', 'night_owl', 'flexible')),
  party_level text check (party_level in ('never', 'once_a_month', 'once_a_week', 'multiple_per_week')),
  personality_traits text[],
  interests text[],
  substance_preferences text[],
  display_order int default 0,
  created_at timestamptz default now() not null
);

create index if not exists listing_housemates_listing_id_idx on public.listing_housemates (listing_id);

alter table public.listing_housemates enable row level security;

-- Anyone can read housemates for active listings
create policy "housemates_select_public" on public.listing_housemates
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.status = 'active' or auth.uid() = l.user_id)
    )
  );

-- Only listing owner can manage housemates
create policy "housemates_insert_owner" on public.listing_housemates
  for insert with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

create policy "housemates_update_owner" on public.listing_housemates
  for update using (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

create policy "housemates_delete_owner" on public.listing_housemates
  for delete using (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );
