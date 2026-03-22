-- =============================================================================
-- Exchange Housing MVP — Initial Schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  university text default 'Queen''s University',
  program text,
  year_of_study int,
  bio text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Trigger: auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- LISTINGS
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  price_per_month numeric not null,
  currency text default 'CAD',
  address text,
  neighborhood text,
  bedrooms int,
  bathrooms int,
  is_furnished boolean default false,
  utilities_included boolean default false,
  available_from date not null,
  available_to date not null,
  tags text[],
  status text default 'active' check (status in ('active', 'rented', 'expired')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index listings_user_id_idx on public.listings (user_id);
create index listings_status_idx on public.listings (status);
create index listings_created_at_idx on public.listings (created_at desc);

alter table public.listings enable row level security;

create policy "listings_select_active" on public.listings
  for select using (status = 'active' or auth.uid() = user_id);

create policy "listings_insert_own" on public.listings
  for insert with check (auth.uid() = user_id);

create policy "listings_update_own" on public.listings
  for update using (auth.uid() = user_id);

create policy "listings_delete_own" on public.listings
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- LISTING IMAGES
-- ---------------------------------------------------------------------------
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  image_url text not null,
  display_order int default 0,
  created_at timestamptz default now() not null
);

create index listing_images_listing_id_idx on public.listing_images (listing_id, display_order);

alter table public.listing_images enable row level security;

create policy "listing_images_select_all" on public.listing_images
  for select using (true);

create policy "listing_images_insert_own" on public.listing_images
  for insert with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

create policy "listing_images_delete_own" on public.listing_images
  for delete using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- CONVERSATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  participant_1 uuid not null references public.profiles (id) on delete cascade,
  participant_2 uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  -- Normalize ordering: participant_1 always < participant_2 (UUID comparison)
  constraint participant_order check (participant_1 < participant_2),
  constraint conversations_unique unique (listing_id, participant_1, participant_2)
);

create index conversations_participant_1_idx on public.conversations (participant_1);
create index conversations_participant_2_idx on public.conversations (participant_2);
create index conversations_updated_at_idx on public.conversations (updated_at desc);

alter table public.conversations enable row level security;

create policy "conversations_select_participant" on public.conversations
  for select using (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

create policy "conversations_insert_participant" on public.conversations
  for insert with check (
    auth.uid() = participant_1 or auth.uid() = participant_2
  );

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now() not null
);

create index messages_conversation_id_idx on public.messages (conversation_id, created_at asc);
create index messages_sender_id_idx on public.messages (sender_id);

alter table public.messages enable row level security;

create policy "messages_select_participant" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "messages_insert_participant" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

-- Bump conversation.updated_at when a message is sent
create or replace function public.handle_new_message()
returns trigger language plpgsql security definer as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.handle_new_message();

-- ---------------------------------------------------------------------------
-- SAVED LISTINGS
-- ---------------------------------------------------------------------------
create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, listing_id)
);

create index saved_listings_user_id_idx on public.saved_listings (user_id);

alter table public.saved_listings enable row level security;

create policy "saved_listings_select_own" on public.saved_listings
  for select using (auth.uid() = user_id);

create policy "saved_listings_insert_own" on public.saved_listings
  for insert with check (auth.uid() = user_id);

create policy "saved_listings_delete_own" on public.saved_listings
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- STORAGE: listing-images bucket
-- (Run this in the Supabase dashboard Storage section or via management API)
-- insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
-- ---------------------------------------------------------------------------

-- Storage policies (apply after creating the bucket)
-- create policy "listing_images_public_read" on storage.objects
--   for select using (bucket_id = 'listing-images');
-- create policy "listing_images_auth_upload" on storage.objects
--   for insert with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');
-- create policy "listing_images_owner_delete" on storage.objects
--   for delete using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================================================
-- SEED DATA — 10 realistic Kingston listings
-- =============================================================================

-- We'll insert seed data using a do block so we can reference a fake user ID.
-- In production, replace this with real user IDs after creating test accounts.

do $$
declare
  seed_user_id uuid := '00000000-0000-0000-0000-000000000001';
  l1 uuid; l2 uuid; l3 uuid; l4 uuid; l5 uuid;
  l6 uuid; l7 uuid; l8 uuid; l9 uuid; l10 uuid;
begin

  -- Insert a seed auth user so the FK from profiles → auth.users is satisfied.
  -- The on_auth_user_created trigger will auto-create the profiles row.
  insert into auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, is_sso_user, deleted_at
  ) values (
    seed_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'seed@queensu.ca',
    crypt('SeedPassword1!', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name":"Alex Taylor"}'::jsonb,
    false, null
  ) on conflict (id) do nothing;

  -- Upsert the profile with extra fields the trigger doesn't set
  insert into public.profiles (id, email, full_name, university, program, year_of_study, bio)
  values (
    seed_user_id,
    'seed@queensu.ca',
    'Alex Taylor',
    'Queen''s University',
    'Commerce',
    3,
    'Exchange student from UBC. Happy to chat about the area!'
  ) on conflict (id) do update
    set university    = excluded.university,
        program       = excluded.program,
        year_of_study = excluded.year_of_study,
        bio           = excluded.bio;

  -- Listing 1
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Cozy 1-BR near Queen''s Campus',
    'Bright and spacious one-bedroom apartment just a 5-minute walk to the ARC and main campus. Hardwood floors, updated kitchen, in-suite laundry. Perfect for a single student or couple.',
    1350, '234 University Ave, Kingston, ON', 'University District', 1, 1, true, true,
    '2025-05-01', '2025-08-31',
    array['Near campus','Laundry','Internet included','No smoking'],
    'active'
  ) returning id into l1;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l1, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 0),
    (l1, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 1);

  -- Listing 2
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Furnished Studio — Sydenham Ward',
    'Modern studio in the heart of Sydenham Ward. Steps from the waterfront, cafés, and city transit. All-inclusive rent with high-speed WiFi. Ideal for exchange students.',
    1100, '89 King St E, Kingston, ON', 'Sydenham Ward', 0, 1, true, true,
    '2025-05-01', '2025-08-31',
    array['Utilities included','Internet included','Near campus','No smoking'],
    'active'
  ) returning id into l2;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l2, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0),
    (l2, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800', 1);

  -- Listing 3
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    '2-Bedroom Sublet — Williamsville',
    'Spacious two-bedroom unit available for the summer semester. Quiet neighbourhood, 15-min bike ride to campus. Shared bathroom, fully equipped kitchen. Looking for two exchange students.',
    800, '415 Frontenac St, Kingston, ON', 'Williamsville', 2, 1, false, false,
    '2025-05-01', '2025-08-31',
    array['Parking','Pet-friendly','Laundry'],
    'active'
  ) returning id into l3;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l3, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 0);

  -- Listing 4
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Private Room — Portsmouth Village Home',
    'Private furnished room in a shared house. Two other quiet graduate students. Large backyard, off-street parking, close to waterfront trail. Utilities split equally.',
    750, '76 Mowat Ave, Kingston, ON', 'Portsmouth Village', 1, 2, true, false,
    '2025-05-01', '2025-08-31',
    array['Parking','Laundry','Private bathroom','Balcony'],
    'active'
  ) returning id into l4;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l4, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800', 0),
    (l4, 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800', 1);

  -- Listing 5
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'All-Inclusive 1BR — Inner Harbour View',
    'Beautiful one-bedroom with a partial harbour view. Fully furnished, all utilities included (hydro, water, heat, internet). Building gym and rooftop patio. Non-smoking building.',
    1600, '1 Cataraqui St, Kingston, ON', 'Inner Harbour', 1, 1, true, true,
    '2025-05-01', '2025-08-31',
    array['Gym access','Internet included','Utilities included','No smoking','Balcony'],
    'active'
  ) returning id into l5;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l5, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (l5, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (l5, 'https://images.unsplash.com/photo-1551361415-69c87624334f?w=800', 2);

  -- Listing 6
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Kingscourt 2BR — Students Only',
    'Clean two-bedroom apartment in Kingscourt. Looking for two exchange students (any gender). Shared laundry in building, street parking available. 10-min walk to campus.',
    700, '202 Princess St, Kingston, ON', 'Kingscourt', 2, 1, false, false,
    '2025-05-01', '2025-08-31',
    array['Near campus','Laundry','No smoking'],
    'active'
  ) returning id into l6;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l6, 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800', 0);

  -- Listing 7
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Furnished Room — Female Students Preferred',
    'Private furnished room in a 3-bedroom house shared with two other female students. Updated bathroom, good natural light. Close to bus route 6 and 7.',
    720, '38 Earl St, Kingston, ON', 'University District', 1, 1, true, false,
    '2025-05-01', '2025-08-31',
    array['Near campus','Female-only','Laundry','Internet included'],
    'active'
  ) returning id into l7;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l7, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 0);

  -- Listing 8
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Budget Studio — Williamsville',
    'Affordable furnished studio for one person. No frills but clean and safe. Walking distance to grocery stores and campus bus routes. Utilities included.',
    950, '321 Brock St, Kingston, ON', 'Williamsville', 0, 1, true, true,
    '2025-05-01', '2025-08-31',
    array['Utilities included','Internet included'],
    'active'
  ) returning id into l8;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l8, 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 0),
    (l8, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 1);

  -- Listing 9
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Modern 1BR — Steps from ARC',
    'Newly renovated one-bedroom apartment, literally across the street from the Athletic and Recreation Centre. In-suite washer/dryer, stainless appliances, AC. Very popular — won''t last.',
    1450, '99 Union St, Kingston, ON', 'University District', 1, 1, true, false,
    '2025-05-01', '2025-08-31',
    array['Near campus','Laundry','Air conditioning','No smoking'],
    'active'
  ) returning id into l9;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l9, 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800', 0),
    (l9, 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800', 1);

  -- Listing 10
  insert into public.listings (id, user_id, title, description, price_per_month, address, neighborhood, bedrooms, bathrooms, is_furnished, utilities_included, available_from, available_to, tags, status)
  values (
    gen_random_uuid(), seed_user_id,
    'Pet-Friendly 2BR — Portsmouth Village',
    'Spacious two-bedroom house available for summer. Small pets welcome (dogs/cats). Large fenced backyard, two parking spots, basement storage. Quiet residential street near the waterfront.',
    1200, '142 Beverley St, Kingston, ON', 'Portsmouth Village', 2, 1, false, false,
    '2025-05-01', '2025-08-31',
    array['Pet-friendly','Parking','Laundry','Balcony'],
    'active'
  ) returning id into l10;

  insert into public.listing_images (listing_id, image_url, display_order) values
    (l10, 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800', 0),
    (l10, 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800', 1);

end $$;
