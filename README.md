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

### Production setup

1. **Clone and install**

```bash
git clone <repo-url>
cd exchange
npm install
```

2. **Run**

```bash
npm run dev
```

---

## Local development (recommended)

Use a local Supabase instance so you never touch production data.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [Supabase CLI](https://supabase.com/docs/guides/cli) — installed automatically via `npm install` as a dev dependency

### 1. Start local Supabase

```bash
npm run supabase:start
```

This spins up a full Supabase stack locally (Postgres, Auth, Studio, Realtime). Credentials are pre-filled in `.env.development` — no manual copy needed.

> **Supabase Studio** (local DB browser) runs at http://127.0.0.1:54323

### 2. Apply migrations

```bash
npm run db:reset
```

Runs all migration files in `supabase/migrations/` against the local database, creating all tables, triggers, and RLS policies.

### 3. Generate the Prisma client

```bash
npx prisma generate
```

> **Optional:** if you've added new migrations, re-introspect the schema first: `npm run prisma:pull`

### 4. Seed the local database

```bash
npm run seed
```

Creates 10 test users, 8 listings with housemates and images, 3 conversations with messages, and saved listings.

**Test accounts** (password: `password123`):

| Email | Name | Role |
|---|---|---|
| emma.chen@queensu.ca | Emma Chen | Exchange (UBC) |
| liam.obrien@queensu.ca | Liam O'Brien | Exchange (Trinity Dublin) |
| sofia.martinez@queensu.ca | Sofia Martinez | Exchange (UBA) |
| james.wilson@queensu.ca | James Wilson | Lister |
| priya.patel@queensu.ca | Priya Patel | Lister |
| marcus.johnson@queensu.ca | Marcus Johnson | Lister |
| aisha.rahman@queensu.ca | Aisha Rahman | Exchange (Edinburgh) |
| tom.anderson@queensu.ca | Tom Anderson | Exchange (Sydney) |
| sarah.kim@queensu.ca | Sarah Kim | Lister |
| alex.dubois@queensu.ca | Alex Dubois | Exchange (McGill) |

### 5. Run the app

```bash
npm run dev
```

### Re-seeding

To wipe and re-seed from scratch:

```bash
npm run db:reset && npm run seed
```

### Connecting to production

To temporarily point your local app at the production database, add the production credentials to `.env.local` (this file is gitignored and overrides `.env.development`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production anon key>
```

Remove those lines from `.env.local` to go back to local.

---

### Prisma

Prisma is used exclusively for seeding. The app queries Supabase directly via the JS SDK — do not use Prisma in application code.

| Command | Purpose |
|---|---|
| `npm run seed` | Run `prisma/seed.ts` against local DB |
| `npm run prisma:pull` | Re-introspect schema from local DB into `prisma/schema.prisma` |
| `npm run prisma:generate` | Regenerate the typed Prisma client |

> **Schema source of truth:** `supabase/migrations/` — never run `prisma migrate`.

---

### Storage bucket (production only)

In the Supabase dashboard → **Storage**:

1. Create a bucket named `listing-images`, set to **Public**
2. Add storage policies via the SQL editor:

```sql
create policy "listing_images_public_read" on storage.objects
  for select using (bucket_id = 'listing-images');

create policy "listing_images_auth_upload" on storage.objects
  for insert with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "listing_images_owner_delete" on storage.objects
  for delete using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
```

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
