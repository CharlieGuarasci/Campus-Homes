# Exchange Housing — Architecture

---

## 1. PROJECT STRUCTURE

```
exchange/
├── .env.example                         # Environment variable template
├── .env.local                           # Local secrets (git-ignored)
├── next.config.mjs                      # Next.js configuration
├── postcss.config.mjs                   # PostCSS / Tailwind pipeline
├── tailwind.config.ts                   # Tailwind theme & content paths
├── tsconfig.json                        # TypeScript compiler options
├── package.json                         # Dependencies and npm scripts
├── README.md                            # Project overview
│
├── src/
│   ├── middleware.ts                    # Route guard entry point (delegates to lib)
│   │
│   ├── app/                            # Next.js 14 App Router
│   │   ├── layout.tsx                  # Root HTML shell (Inter font, viewport meta)
│   │   ├── page.tsx                    # Root redirect: / → /marketplace or /login
│   │   ├── globals.css                 # Tailwind base + global styles
│   │   │
│   │   ├── (auth)/                     # Public auth route group (no bottom nav)
│   │   │   ├── layout.tsx              # Minimal full-screen auth shell
│   │   │   ├── login/page.tsx          # Email/password sign-in form
│   │   │   ├── signup/page.tsx         # New account form (email domain enforced)
│   │   │   └── verify/page.tsx         # Post-signup email verification prompt
│   │   │
│   │   └── (app)/                      # Protected app route group (with bottom nav)
│   │       ├── layout.tsx              # App shell: max-w-lg, bottom-nav injection
│   │       ├── bottom-nav-wrapper.tsx  # Client wrapper for server-side userId prop
│   │       ├── marketplace/page.tsx    # Listing feed with search & filter
│   │       ├── create-listing/page.tsx # Multi-step listing creation + image upload
│   │       ├── board/page.tsx          # Community bulletin board (placeholder)
│   │       ├── profile/
│   │       │   ├── page.tsx            # Profile view: my listings & saved tabs
│   │       │   └── edit/page.tsx       # Edit name, bio, program, avatar
│   │       └── messages/
│   │           ├── page.tsx            # Conversation list with unread counts
│   │           └── [id]/page.tsx       # Real-time chat thread
│   │
│   ├── components/                     # Shared UI components
│   │   ├── bottom-nav.tsx              # Fixed 4-tab navigation bar
│   │   ├── listing-card.tsx            # Feed card (image, price, meta, save button)
│   │   ├── listing-drawer.tsx          # Slide-up detail panel (vaul Drawer)
│   │   ├── image-carousel.tsx          # Embla-based photo carousel
│   │   ├── filter-sheet.tsx            # Bottom sheet filter UI (price, beds, etc.)
│   │   ├── chat-bubble.tsx             # Sent/received message bubble
│   │   ├── tag-pill.tsx                # Amenity / category tag badge
│   │   └── ui/                         # shadcn/ui primitive components
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── switch.tsx
│   │       └── textarea.tsx
│   │
│   ├── hooks/                          # React data-fetching hooks
│   │   ├── use-auth.ts                 # Current user + profile state
│   │   ├── use-listings.ts             # Listing feed + saved listing IDs
│   │   ├── use-conversations.ts        # Conversation list with Realtime
│   │   └── use-messages.ts             # Message thread with Realtime
│   │
│   ├── lib/
│   │   ├── constants.ts                # Allowed domains, tags, neighborhoods, limits
│   │   ├── utils.ts                    # cn(), formatPrice(), isAllowedEmailDomain(), etc.
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client (createBrowserClient)
│   │       ├── server.ts               # Server Supabase client (createServerClient)
│   │       └── middleware.ts           # Session refresh + route guard logic
│   │
│   └── types/
│       └── index.ts                    # TypeScript types: Profile, Listing, Message, etc.
│
└── supabase/
    └── migrations/
        └── 20240101000000_initial_schema.sql  # Full schema + RLS + seed data
```

---

## 2. HIGH-LEVEL SYSTEM DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                          │
│               iOS / Android / Desktop Chrome                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Edge Network)                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js 14 App Router                       │   │
│  │                                                          │   │
│  │  src/middleware.ts ──► Route guard (auth redirects)      │   │
│  │                                                          │   │
│  │  Server Components      Client Components                │   │
│  │  ─────────────────      ──────────────────               │   │
│  │  app/layout.tsx         marketplace/page.tsx             │   │
│  │  app/(app)/layout.tsx   create-listing/page.tsx          │   │
│  │  app/page.tsx           profile/page.tsx                 │   │
│  │                         messages/[id]/page.tsx           │   │
│  │  lib/supabase/          hooks/use-auth.ts                │   │
│  │    server.ts              hooks/use-listings.ts          │   │
│  │    middleware.ts          hooks/use-conversations.ts     │   │
│  │                           hooks/use-messages.ts          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS + WSS (Realtime)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌───────────┐  │
│  │    AUTH    │  │  REALTIME  │  │ STORAGE  │  │ POSTGRES  │  │
│  │            │  │            │  │          │  │           │  │
│  │ Email/pass │  │ postgres_  │  │ listing- │  │ profiles  │  │
│  │ signUp()   │  │ changes    │  │ images   │  │ listings  │  │
│  │ signIn()   │  │ broadcast  │  │ bucket   │  │ listing_  │  │
│  │ getUser()  │  │ on messages│  │ (public) │  │   images  │  │
│  │ JWT tokens │  │ table      │  │ max 5MB  │  │ convers-  │  │
│  └────────────┘  └────────────┘  └──────────┘  │  ations   │  │
│                                                  │ messages  │  │
│                  RLS policies on all tables      │ saved_    │  │
│                                                  │ listings  │  │
│                                                  └───────────┘  │
└─────────────────────────────────────────────────────────────────┘

External CDN (Unsplash)
  └── Seed listing images served via Unsplash URLs (dev only)
```

---

## 3. CORE COMPONENTS

### App Router Pages

| File | Purpose |
|------|---------|
| `app/page.tsx` | Server component that reads session and redirects to `/marketplace` (authenticated) or `/login` (unauthenticated). Zero UI rendered. |
| `app/(auth)/login/page.tsx` | Client component. Email + password form. Calls `supabase.auth.signInWithPassword()`. Includes forgot-password reset email trigger. Uses `useRef(createClient()).current` to prevent client recreation on render. |
| `app/(auth)/signup/page.tsx` | Client component. Collects name, email, password, optional program/year. Validates email domain against `ALLOWED_EMAIL_DOMAINS` before calling `supabase.auth.signUp()`. Redirects to `/verify` on success. |
| `app/(auth)/verify/page.tsx` | Static confirmation screen prompting the user to click the email link. |
| `app/(app)/marketplace/page.tsx` | Main listing feed. Client component. Combines `useListings(filters)` + `useSavedListings(userId)` and merges `is_saved` flag onto each listing. Renders `ListingCard` list, floating action button to create a listing, and `ListingDrawer` for detail view. |
| `app/(app)/create-listing/page.tsx` | Multi-step listing form. Handles image selection, upload to Supabase Storage (`listing-images` bucket), and insertion of `listings` + `listing_images` rows. Also handles edit mode via `?edit=<id>` query param. |
| `app/(app)/profile/page.tsx` | Shows current user's avatar, bio, and two tabs: "My listings" (with edit/delete actions) and "Saved" (heart-bookmarked listings). |
| `app/(app)/profile/edit/page.tsx` | Form to update `profiles` row: full name, university, program, year, bio, and avatar image upload. |
| `app/(app)/messages/page.tsx` | Conversation list. Uses `useConversations()` hook with Realtime updates. Shows other participant name, listing title snippet, last message preview, and unread count badge. |
| `app/(app)/messages/[id]/page.tsx` | Real-time chat thread. Uses `useMessages(conversationId)` hook with `postgres_changes` subscription. Renders `ChatBubble` per message, auto-scrolls to bottom on new messages. |
| `app/(app)/board/page.tsx` | Bulletin board placeholder for Phase 2 community features. |

### Layout Components

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root HTML shell. Applies Inter font, sets mobile viewport meta (`viewportFit: 'cover'`, no user-scale), provides `<body>` background. |
| `app/(auth)/layout.tsx` | Minimal full-height flex container for auth screens. No navigation. |
| `app/(app)/layout.tsx` | Server component. Fetches session to pass `userId` to `BottomNavWrapper`. Wraps content in `max-w-lg` with `pb-20` clearance for bottom nav. |
| `app/(app)/bottom-nav-wrapper.tsx` | Thin client wrapper that accepts `userId` prop from the server layout and renders `BottomNav`. Needed because `BottomNav` uses `usePathname()` (client-only). |

### Shared Components

| File | Purpose | Key Libraries |
|------|---------|---------------|
| `bottom-nav.tsx` | Fixed-position 4-tab bar (Marketplace, Board, Messages, Profile). Highlights active tab via `usePathname()`. Shows unread message badge. | `lucide-react`, `next/navigation` |
| `listing-card.tsx` | Facebook Marketplace-style card. Shows first image, price badge, bedroom/bathroom/neighborhood meta, furnished/utilities tags, and a heart save button. Calls `onTap` prop to open drawer. | `lucide-react` |
| `listing-drawer.tsx` | Full-detail slide-up panel using vaul `Drawer.Root`. Shows image carousel, all listing metadata, poster profile card, related listings horizontal scroll, and sticky action bar (Message / Save / Share). Handles save toggle and conversation creation. | `vaul`, `embla-carousel-react` |
| `image-carousel.tsx` | Embla carousel wrapper. Accepts `string[]` of image URLs. Supports `aspect-ratio` prop (`video` = 16:9, `square`). Shows dot indicators. | `embla-carousel-react` |
| `filter-sheet.tsx` | Bottom sheet triggered by a filter icon button. Contains price range inputs, bedrooms selector, furnished/utilities toggles, and available-from date input. Calls `onApply(filters)` callback. | `vaul` or radix Sheet |
| `chat-bubble.tsx` | Single message bubble. Right-aligned (blue) for sent, left-aligned (gray) for received. Shows timestamp via `formatRelativeTime()`. |  |
| `tag-pill.tsx` | Small rounded badge for listing amenity tags (e.g. "Furnished", "Pet-friendly"). |  |

### Hooks

| File | Purpose |
|------|---------|
| `use-auth.ts` | Returns `{ user, profile, loading }`. Calls `getUser()` on mount to hydrate from existing session cookie, then subscribes to `onAuthStateChange` for future changes. Fetches the `profiles` row after resolving the user. |
| `use-listings.ts` | `useListings(filters)` — fetches active listings with full profile + image embeds. Rebuilds query when any filter value changes. `useSavedListings(userId)` — loads the user's saved listing IDs as a `Set<string>` and exposes a `toggle(id, save)` function. |
| `use-conversations.ts` | Fetches conversation list for current user. Subscribes to `postgres_changes` on `messages` table to re-fetch when new messages arrive (for real-time unread counts and last-message preview). |
| `use-messages.ts` | Fetches all messages for a given `conversationId`. Subscribes to `postgres_changes INSERT` filtered by `conversation_id` for live message delivery. Marks messages as read. |

### Lib Utilities

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Exports `createClient()` using `createBrowserClient`. **Not memoized** — callers must use `useRef(createClient()).current` to avoid re-creating the client on every render. |
| `lib/supabase/server.ts` | Exports async `createClient()` using `createServerClient` with Next.js cookie store. Used in Server Components and the root page redirect. |
| `lib/supabase/middleware.ts` | `updateSession()` refreshes the Supabase session token on every request and enforces route guards: unauthenticated users are redirected to `/login` for app routes; authenticated users are redirected from `/login`/`/signup` to `/marketplace`. |
| `lib/constants.ts` | Single source of truth for `ALLOWED_EMAIL_DOMAINS`, `UNIVERSITIES` map, `LISTING_TAGS`, `NEIGHBORHOODS`, `MAX_IMAGES` (6), `MAX_IMAGE_SIZE_MB` (5), and `LISTING_IMAGE_BUCKET`. |
| `lib/utils.ts` | `cn()` (Tailwind class merge), `formatPrice()` (Intl CAD), `isAllowedEmailDomain()`, `getUniversityFromEmail()`, `getAvatarInitials()`, `truncate()`, `formatRelativeTime()`. |

---

## 4. DATA STORES

### PostgreSQL (Supabase)

All tables have Row Level Security enabled. The `auth.uid()` Postgres function is used in all policies.

---

#### `public.profiles`

Mirrors `auth.users` with additional student metadata. Auto-created via the `on_auth_user_created` trigger when a user signs up.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `email` | `text` | Copied from auth |
| `full_name` | `text` | From `raw_user_meta_data` at signup |
| `university` | `text` | Defaults to `'Queen's University'` |
| `program` | `text` | Optional (e.g. "Commerce") |
| `year_of_study` | `int` | Optional (1–5 or graduate) |
| `bio` | `text` | Optional short bio |
| `avatar_url` | `text` | Storage URL of uploaded avatar |
| `created_at` | `timestamptz` | Auto-set |

**RLS Policies:**
- `SELECT` — anyone (public profiles)
- `INSERT` — only `auth.uid() = id` (enforced by trigger)
- `UPDATE` — only `auth.uid() = id`

---

#### `public.listings`

Core housing listing record.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE |
| `title` | `text` | Required |
| `description` | `text` | Optional long-form text |
| `price_per_month` | `numeric` | CAD by default |
| `currency` | `text` | Default `'CAD'` |
| `address` | `text` | Full street address |
| `neighborhood` | `text` | One of `NEIGHBORHOODS` enum values |
| `bedrooms` | `int` | `0` = studio |
| `bathrooms` | `int` | |
| `is_furnished` | `boolean` | Default `false` |
| `utilities_included` | `boolean` | Default `false` |
| `available_from` | `date` | Sublet start date |
| `available_to` | `date` | Sublet end date |
| `tags` | `text[]` | Array from `LISTING_TAGS` constant |
| `status` | `text` | `'active'` \| `'rented'` \| `'expired'` |
| `created_at` | `timestamptz` | Auto-set |
| `updated_at` | `timestamptz` | Auto-updated by trigger |

**Indexes:** `user_id`, `status`, `created_at DESC`

**RLS Policies:**
- `SELECT` — active listings (anyone) OR own listings regardless of status
- `INSERT` — only `auth.uid() = user_id`
- `UPDATE` — only owner
- `DELETE` — only owner

---

#### `public.listing_images`

Photos attached to a listing, ordered for carousel display.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `listing_id` | `uuid` | FK → `listings(id)` ON DELETE CASCADE |
| `image_url` | `text` | Full public URL (Storage or external) |
| `display_order` | `int` | Sort order in carousel (0-indexed) |
| `created_at` | `timestamptz` | |

**Index:** `(listing_id, display_order)`

**RLS Policies:**
- `SELECT` — anyone
- `INSERT` — only if `auth.uid()` is the owner of the related listing (subquery check)
- `DELETE` — same ownership check via subquery

---

#### `public.conversations`

A unique conversation between two participants about a listing. Participant UUIDs are stored in normalized order (`participant_1 < participant_2`) enforced by a DB check constraint to prevent duplicate threads.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `listing_id` | `uuid` | FK → `listings(id)` ON DELETE SET NULL |
| `participant_1` | `uuid` | FK → `profiles(id)`; always the lesser UUID |
| `participant_2` | `uuid` | FK → `profiles(id)`; always the greater UUID |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | Bumped by `on_message_created` trigger |

**Constraints:** `participant_order CHECK (participant_1 < participant_2)`, `UNIQUE (listing_id, participant_1, participant_2)`

**Indexes:** `participant_1`, `participant_2`, `updated_at DESC`

**RLS Policies:**
- `SELECT` — only if `auth.uid()` is `participant_1` or `participant_2`
- `INSERT` — only if `auth.uid()` is one of the participants

---

#### `public.messages`

Individual chat messages within a conversation.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `conversation_id` | `uuid` | FK → `conversations(id)` ON DELETE CASCADE |
| `sender_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE |
| `content` | `text` | Message body |
| `is_read` | `boolean` | Default `false` |
| `created_at` | `timestamptz` | |

**Index:** `(conversation_id, created_at ASC)` for ordered thread reads

**RLS Policies:**
- `SELECT` — only conversation participants (subquery to `conversations`)
- `INSERT` — only if `auth.uid() = sender_id` AND is a participant

**Trigger:** `on_message_created` — after each INSERT, bumps `conversations.updated_at` to float this conversation to the top of the inbox list.

---

#### `public.saved_listings`

Bookmarked listings per user. Composite primary key prevents duplicate saves.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | `uuid` | FK → `profiles(id)` ON DELETE CASCADE |
| `listing_id` | `uuid` | FK → `listings(id)` ON DELETE CASCADE |
| `created_at` | `timestamptz` | |

**PK:** `(user_id, listing_id)`

**RLS Policies:**
- `SELECT`, `INSERT`, `DELETE` — only `auth.uid() = user_id`

---

### Database Functions & Triggers

| Name | Event | Purpose |
|------|-------|---------|
| `handle_new_user()` | `AFTER INSERT ON auth.users` | Auto-creates a `profiles` row from `raw_user_meta_data` |
| `set_updated_at()` | `BEFORE UPDATE ON listings` | Keeps `updated_at` current |
| `handle_new_message()` | `AFTER INSERT ON messages` | Bumps `conversations.updated_at` |

---

### Supabase Storage

**Bucket:** `listing-images`
- Visibility: **public** (image URLs are served directly without auth)
- Max file size: 5 MB per image
- Max images per listing: 6
- Upload path convention: `{user_id}/{listing_id}/{filename}` (enables owner-based delete policy)
- Storage RLS policies (applied via dashboard or SQL):
  - `SELECT` — anyone (`bucket_id = 'listing-images'`)
  - `INSERT` — authenticated users only
  - `DELETE` — only if `auth.uid()::text = (storage.foldername(name))[1]` (owner-prefixed path)

---

## 5. EXTERNAL INTEGRATIONS

### Supabase

The sole backend service. Provides four capabilities:

| Capability | How used |
|------------|----------|
| **Auth** | `signUp()` with `emailRedirectTo`, `signInWithPassword()`, `getUser()`, `onAuthStateChange()`, `resetPasswordForEmail()`. Session stored in HTTP-only cookies managed by `@supabase/ssr`. |
| **PostgreSQL** | All data reads/writes via the Supabase JS client's typed query builder (PostgREST). No raw SQL from the frontend. FK disambiguation uses the `!fk_name` PostgREST syntax (e.g. `profiles!listings_user_id_fkey(*)`). |
| **Realtime** | `postgres_changes` channel subscriptions on `messages` (filtered by `conversation_id`) and `conversations` tables for live inbox updates. |
| **Storage** | `listing-images` public bucket for user photo uploads. Files are uploaded via `supabase.storage.from('listing-images').upload()`. |

### Third-party Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `@supabase/ssr` | `^0.9.0` | SSR-compatible Supabase client factory (`createBrowserClient`, `createServerClient`) |
| `@supabase/supabase-js` | `^2.78.0` | Core Supabase JS SDK |
| `next` | `14.2.35` | React framework (App Router, Server Components, middleware) |
| `vaul` | `^1.1.2` | Accessible bottom-drawer (listing detail panel, filter sheet) |
| `embla-carousel-react` | `^8.6.0` | Touch-friendly image carousel in listing drawer |
| `lucide-react` | `^0.577.0` | Icon set (all UI icons) |
| `@radix-ui/*` | various | Headless UI primitives: Avatar, Dialog, Label, Select, Separator, Slider, Switch |
| `class-variance-authority` | `^0.7.1` | Type-safe variant API for shadcn components |
| `clsx` + `tailwind-merge` | latest | Conditional class names with Tailwind conflict resolution (`cn()` utility) |
| `date-fns` | `^4.1.0` | Date formatting utilities |
| `tailwindcss` | `^3.4.1` | Utility-first CSS (JIT, custom navy color tokens, mobile-first breakpoints) |

---

## 6. DEPLOYMENT & INFRASTRUCTURE

### Vercel (Frontend)

- **Framework preset:** Next.js (auto-detected)
- **Build command:** `next build`
- **Output directory:** `.next` (managed by Vercel)
- **Node.js runtime:** 20.x
- **Edge middleware:** `src/middleware.ts` runs at Vercel Edge for route guards (no cold start)
- **Regions:** Deploy to the region nearest your Supabase instance (e.g. `iad1` for `us-east-1`)

### Supabase (Backend)

- Hosted on Supabase Cloud (managed Postgres 15, Auth, Realtime, Storage)
- Migrations applied via Supabase CLI: `supabase db push` or run SQL directly in the dashboard SQL editor
- Realtime must have `messages` and `conversations` tables added to the Realtime publication

### Environment Variables

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Supabase project REST/Realtime endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Public anon key (safe to expose; RLS enforces access) |

Both variables are `NEXT_PUBLIC_` prefixed and therefore bundled into the client-side JavaScript. The service role key is **never** used in this application.

### Build & Deploy Flow

```
git push → Vercel CI → next build → Edge deployment
                    ↑
              Env vars injected from Vercel project settings
```

---

## 7. SECURITY CONSIDERATIONS

### Authentication

- **Provider:** Supabase Auth (email/password)
- **Domain restriction:** Enforced client-side in `isAllowedEmailDomain()` before calling `signUp()`. Currently restricted to `@queensu.ca`. The `ALLOWED_EMAIL_DOMAINS` constant in `lib/constants.ts` is the single place to add new universities. Note: client-side validation alone is not sufficient for a production trust boundary — a server-side Postgres function or edge function check should be added before launch.
- **Email verification:** Supabase sends a confirmation email; the user must click the link before the session is fully active. The `/verify` page prompts them to do so.
- **Password reset:** Available via `resetPasswordForEmail()` with a redirect back to the app.
- **Session management:** Sessions are stored in HTTP-only cookies via `@supabase/ssr`. The middleware calls `updateSession()` on every non-static request to refresh expiring JWTs transparently.

### Row Level Security

Every table has RLS enabled. No table is accessible without an explicit policy match. Key principles:

- **Profiles:** Publicly readable (needed for poster info on listing cards), but only the owner can update their own row.
- **Listings:** Active listings are publicly readable; draft/rented/expired listings are visible only to their owner. All write operations are owner-gated.
- **Messages & Conversations:** Strictly participant-only. No user can read or write into a conversation they are not part of. The `messages INSERT` policy requires both that `sender_id = auth.uid()` and that the sender is a participant.
- **Saved listings:** Completely private — users can only see, add, or remove their own saves.
- **Storage:** Images are publicly readable (public bucket) but upload requires `authenticated` role; deletes require the file path to start with the uploader's user ID.

### API Key Distinction

| Key | Used by | Capabilities |
|-----|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + middleware | Respects RLS; cannot bypass policies |
| Service role key | Never used | Would bypass RLS entirely — not present in this codebase |

### Middleware Route Guards

`src/lib/supabase/middleware.ts` runs on every non-static request and enforces:
1. Unauthenticated users visiting any `/marketplace`, `/messages`, `/board`, `/profile`, or `/create-listing` route are redirected to `/login`.
2. Authenticated users visiting `/login` or `/signup` are redirected to `/marketplace`.
3. `/` always redirects to the appropriate destination.

---

## 8. DEVELOPMENT & TESTING

### Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd exchange

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and set:
#   NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# 4. Start the development server
npm run dev
# → http://localhost:3000
```

### Supabase Setup

**Option A — Supabase Cloud (recommended for dev)**
1. Create a project at supabase.com
2. Copy the project URL and anon key into `.env.local`
3. In the Supabase dashboard SQL editor, run `supabase/migrations/20240101000000_initial_schema.sql`
4. In Storage, create a bucket named `listing-images` and set it to **public**
5. Apply the storage RLS policies (commented at the bottom of the migration file)
6. In Realtime settings, enable `messages` and `conversations` tables

**Option B — Supabase CLI (local Docker)**
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local stack (requires Docker)
supabase start

# Apply migrations
supabase db push

# Stop when done
supabase stop
```

### Applying Migrations

```bash
# Via Supabase CLI (linked to cloud project)
supabase db push

# Or paste migration SQL directly in Supabase dashboard → SQL Editor
```

### Linting & Type Checking

```bash
# ESLint (Next.js config)
npm run lint

# TypeScript type check (no emit)
npx tsc --noEmit

# Build (catches type errors + lint in one pass)
npm run build
```

**ESLint config:** `eslint-config-next` (extends `next/core-web-vitals`). No Prettier config present; formatting is ad hoc.

### No Automated Tests

There are no unit, integration, or end-to-end tests in the current codebase. This is a known gap. Before adding payment flows (Phase 2), the following should be added:
- Vitest unit tests for `lib/utils.ts` functions
- Playwright E2E tests for the auth flow and listing creation

---

## 9. FUTURE CONSIDERATIONS

### Phase 2 — Payments & Bookings

- **Stripe or Wise integration** for collecting a booking deposit from prospective tenants
- **Escrow flow:** Funds held until the tenant confirms move-in; released to the lister after a dispute window
- **Booking table** in Postgres to track deposit status, move-in confirmation, and payout state
- **Webhooks** from Stripe to update booking status
- This will require a backend API route (Next.js Route Handler) using the Supabase service role key — not the anon key

### Phase 3 — Trust & Discovery

- **Reviews and ratings** after a completed sublet (both directions: lister rates tenant, tenant rates lister)
- **Video tours** via embedded links or self-hosted via Supabase Storage (large file considerations)
- **Push notifications** using Web Push API or a third-party service (e.g. OneSignal) for new messages and booking updates
- **Map view** on the marketplace using Mapbox or Google Maps with neighborhood polygon overlays

### Longer-term

- **React Native mobile app** sharing the same Supabase backend; the existing hook architecture (`use-listings`, `use-messages`, etc.) is designed to be portable
- **Landlord accounts** — a separate `account_type` on `profiles` with a different onboarding flow, bypassing the student email restriction
- **Multi-university expansion** — adding domains to `ALLOWED_EMAIL_DOMAINS` and updating `UNIVERSITIES` map in `lib/constants.ts`; per-university listing feeds via a `university` filter

### Known Technical Debt

| Area | Issue |
|------|-------|
| Email domain validation | Only enforced client-side; a determined user could bypass it. Needs a Postgres trigger or Edge Function check on `auth.users` insert. |
| `@supabase/ssr` client memoization | `createBrowserClient` is not internally memoized in v0.9. Every component that needs Supabase must use `useRef(createClient()).current` — easy to forget. Consider a React Context provider wrapping the app. |
| No optimistic UI | Save/unsave and message send are not optimistic; the UI waits for the server round-trip. |
| Related listings in drawer | Related listings are fetched on every drawer open, not cached. |
| No pagination | The listing feed fetches all active listings in one query. Will degrade at scale. |
| Board page | Currently a placeholder with no functionality. |
| No test coverage | Zero automated tests. |

---

## 10. GLOSSARY

| Term | Definition |
|------|-----------|
| **Exchange student** | A university student studying at Queen's University for one or two semesters as part of an exchange agreement with their home institution. They typically need short-term (4–8 month) furnished accommodation. |
| **Lister** | A user who posts a housing listing on Exchange Housing. Typically a Queen's student subletting their apartment while abroad or during the summer. |
| **Sublet** | A short-term rental arrangement where a primary tenant re-rents their unit (or a room in it) to another person for a fixed period, usually while the primary tenant is away. |
| **Listing** | A single housing unit or room posted for rent on the platform. Corresponds to a row in `public.listings`. |
| **Listing card** | The summary card shown in the marketplace feed. Shows one photo, price, bedroom count, neighborhood, and key tags. |
| **Listing drawer** | The slide-up detail panel (built with vaul) that shows the full listing information when a card is tapped. |
| **Conversation** | A one-to-one messaging thread between a prospective renter and a lister, tied to a specific listing. Corresponds to a row in `public.conversations`. |
| **Booking deposit** | A planned Phase 2 feature: a small upfront payment made by a prospective tenant to reserve a listing, held in escrow until move-in is confirmed. |
| **University domain allowlist** | The list of email domains that are permitted to sign up for Exchange Housing. Currently `['queensu.ca']`, defined in `src/lib/constants.ts`. |
| **Anon key** | The Supabase `NEXT_PUBLIC_SUPABASE_ANON_KEY` — a public API key that identifies the project but carries no elevated privileges. RLS policies restrict what data this key can access. |
| **Service role key** | A Supabase key that bypasses RLS entirely. It is **not used** in this codebase and should never be exposed to the client. |
| **PostgREST FK hint** | The `!fk_name` syntax appended to a join in Supabase select strings (e.g. `profiles!listings_user_id_fkey(*)`) to disambiguate when multiple foreign key relationships exist between two tables. |
| **RLS (Row Level Security)** | A Postgres feature that enforces access control at the row level. Every table in this project has RLS enabled with policies that use `auth.uid()` to gate access. |

---

## 11. PROJECT IDENTIFICATION

| Field | Value |
|-------|-------|
| **Project name** | Exchange Housing (working title) |
| **Repository** | `/Users/charlieguarasci/Code/exchange` (local; no remote URL recorded) |
| **Tech stack** | Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, Supabase (Auth + Postgres + Realtime + Storage) |
| **Target institution** | Queen's University, Kingston, Ontario, Canada |
| **Primary contributor** | Charlie Guarasci |
| **Document last updated** | 2026-03-22 |
