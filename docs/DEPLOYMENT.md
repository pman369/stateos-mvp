# Deployment & Operations

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 20+ | Runtime |
| npm or pnpm | Latest | Package manager |
| Supabase account | — | Cloud database + auth |
| Google AI Studio API key | — | Gemini API for AI features |

---

## Environment Variables

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | No* | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | No* | Admin operations (account deletion). **Never expose to client.** |
| `GEMINI_API_KEY` | Server only | No** | Gemini API key for AI features. Set in `.env.local`. |

\* If omitted, the app runs in **offline mode** with localStorage persistence.
\** If omitted, AI features degrade to local fallbacks.

---

## Local Development

```bash
git clone https://github.com/pman369/stateos-mvp.git
cd stateos
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

App runs at `http://localhost:3000`.

### Offline Mode

If `.env.local` has no Supabase credentials, the app automatically falls back to localStorage. All features work — data is stored in the browser. This is useful for:
- Quick local testing
- Demo/offline usage
- Developing without a Supabase project

---

## Build & Production

```bash
npm run build    # Production build
npm run start    # Start production server
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Start local dev server |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Lint codebase |

---

## Supabase Setup

### Project Creation

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note your project URL and anon key from **Settings → API**

### Database Migration

Apply the schema migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually via Supabase SQL Editor:
# Paste contents of supabase/migrations/20260711000000_init_schema.sql
```

This creates 9 tables with RLS, indexes, generated columns, and the new-user trigger.

### Seed Protocols

```bash
# Using Supabase CLI
supabase db seed

# Or manually via Supabase SQL Editor:
# Paste contents of supabase/seed.sql
```

Seeds 6 protocols into the `protocols` table. The seed uses `ON CONFLICT DO UPDATE` so it's safe to re-run.

### Environment Variables in Supabase

Set `GEMINI_API_KEY` as a Supabase secret (not in `.env.local`):

```bash
supabase secrets set GEMINI_API_KEY=your-key-here
```

---

## Vercel Deployment

The `.gitignore` includes `.vercel`, indicating Vercel as the target platform.

### Setup

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `GEMINI_API_KEY` (server-only)
3. Deploy — Vercel auto-detects Next.js and builds

### Build Configuration

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

---

## Security Notes

| Concern | Mitigation |
|---------|------------|
| `GEMINI_API_KEY` exposure | Never put in `NEXT_PUBLIC_*` vars or `.env.local` if deploying with Edge Functions. Use Supabase secrets or server-only env vars. |
| `SUPABASE_SERVICE_ROLE_KEY` exposure | Server-only. Bypasses RLS — never expose to client bundle. |
| RLS enforcement | All user tables have `auth.uid() = user_id` policies. Supabase enforces at the database level. |
| API routes | Both `/api/reflect` and `/api/diagnose` read `GEMINI_API_KEY` from `process.env` on the server side only. The key is never sent to the client. |
| Account deletion | `db.clearAllData()` only works in local mode. Cloud-mode deletion requires server-side implementation (planned: Supabase Edge Function with service role key). |

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| App shows empty data | No Supabase credentials, using localStorage | Expected in offline mode. Data persists per browser. |
| AI features not working | `GEMINI_API_KEY` not set or invalid | Check `.env.local` or Supabase secrets. App gracefully falls back to local. |
| RLS errors | User not authenticated, or policy misconfigured | Verify `auth.uid()` matches `user_id` in data. Check Supabase RLS policies. |
| Build fails | TypeScript errors | Run `npm run lint` to check. All pages use `"use client"`. |
| Pacing tones not playing | Browser autoplay policy | AudioContext requires user interaction first. Tone starts after first click/tap. |
