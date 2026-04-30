# Fogel CFO Platform

Multi-tenant financial management platform. Built on React + Vite + Tailwind + Supabase.

## Setup

### 1. Frontend env (`.env`)

Public, build-time, browser-visible (anon key is RLS-gated):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See `.env.example`.

### 2. Local-only secrets (`.env.local`)

Used **only** by the seed script on your laptop. **Never** add these to Lovable's secret store. `.env.local` is gitignored via the existing `*.local` rule.

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...   # bypasses RLS — keep off the frontend
DATABASE_URL=postgres://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

See `.env.local.example`.

### 3. Run the dev server

```
npm run dev
```

### 4. Seed test data

```
npm run seed
```

This:
1. Runs `supabase/seed.ts` to create 6 auth users via the Supabase admin API.
2. Runs `supabase/seed.sql` to create 2 clients, 2 entities, 5 client_members, 2 client_managers, fx_rates, sample vendors/customers/donors/projects.

Dev password for every seeded user: `fogel-dev-2026`.

| Email | Role | Client |
| --- | --- | --- |
| `admin@fogelcfo.com` | Super admin (hardcoded) | All |
| `local_admin@kge.test` | Local admin | KGE Nonprofit (HE/RTL, ILS) |
| `member@kge.test` | Member | KGE Nonprofit |
| `reporter@kge.test` | Income reporter | KGE Nonprofit |
| `local_admin@profit.test` | Local admin | Acme For-Profit (EN/LTR, USD) |
| `member@profit.test` | Member | Acme For-Profit |

Re-running `npm run seed` is safe — both scripts are idempotent.

## Auth providers

Magic-link and Google OAuth must be enabled in your Supabase dashboard. Google needs an OAuth client ID/secret configured at **Authentication → Providers → Google** with redirect URL set to your app origin.
