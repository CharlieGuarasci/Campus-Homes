# Exchange Housing

A mobile-first housing marketplace for university exchange students, built with Next.js 14, Supabase, and Tailwind CSS.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| UI | Tailwind CSS + custom shadcn-style components |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Deployment | Vercel |

## Features

- **Listings feed** — browse all active sublets with search and filters
- **Listing drawer** — tap any card for full details, image carousel, tags, poster info, and related listings
- **Create listing** — multi-step form with photo upload (up to 6 images) to Supabase Storage
- **Real-time messaging** — start a conversation from any listing; messages update live via Supabase Realtime
- **Auth** — email/password sign-up restricted to `@queensu.ca` addresses; email verification required to post or message
- **Profile** — view your listings, saved listings, and edit your profile
- **Save listings** — heart any listing to save it for later

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd exchange
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The values for this project are already in `.env.local` for development.

### 3. Set up Supabase

Run the migration in the Supabase SQL editor:

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Paste and run the contents of `supabase/migrations/20240101000000_initial_schema.sql`

This creates all tables, RLS policies, triggers, and seeds 10 demo listings.

### 4. Create Storage bucket

In the Supabase dashboard → **Storage**:

1. Create a new bucket named `listing-images`
2. Set it to **Public**
3. Add these storage policies in the SQL editor:

```sql
-- Public read
create policy "listing_images_public_read" on storage.objects
  for select using (bucket_id = 'listing-images');

-- Authenticated upload
create policy "listing_images_auth_upload" on storage.objects
  for insert with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

-- Owner delete
create policy "listing_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Redirects to /marketplace or /login
│   ├── (auth)/                     # Unauthenticated pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify/page.tsx
│   └── (app)/                      # Authenticated pages with bottom nav
│       ├── marketplace/page.tsx    # Listings feed
│       ├── messages/
│       │   ├── page.tsx            # Conversation list
│       │   └── [id]/page.tsx       # Chat view
│       ├── board/page.tsx          # Placeholder
│       ├── profile/
│       │   ├── page.tsx
│       │   └── edit/page.tsx
│       └── create-listing/page.tsx
├── components/
│   ├── ui/                         # Base UI components
│   ├── bottom-nav.tsx
│   ├── listing-card.tsx
│   ├── listing-drawer.tsx          # Vaul drawer for listing detail
│   ├── image-carousel.tsx          # Embla carousel
│   ├── filter-sheet.tsx
│   ├── chat-bubble.tsx
│   └── tag-pill.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-listings.ts
│   ├── use-messages.ts
│   └── use-conversations.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client
│   │   └── middleware.ts           # Auth session refresh
│   ├── constants.ts
│   └── utils.ts
└── types/
    └── index.ts
```

## Expanding to other universities

Add domains to `src/lib/constants.ts`:

```ts
export const ALLOWED_EMAIL_DOMAINS = ['queensu.ca', 'utoronto.ca'] as const;

export const UNIVERSITIES: Record<string, string> = {
  'queensu.ca': "Queen's University",
  'utoronto.ca': 'University of Toronto',
};
```

## Deployment

Deploy to Vercel with one command:

```bash
npx vercel
```

Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the Vercel project settings.
