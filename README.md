# OrcaLog — Spearfishing & Diving Logbook

A full-featured bilingual (Hebrew/English) diving logbook web app with multi-user support and admin panel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHaimW%2FOrcaLog&env=NEXTAUTH_SECRET,DATABASE_URL&envDescription=See%20.env.example%20for%20details&project-name=orcalog&repository-name=OrcaLog)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (credentials) |
| File Storage | Vercel Blob (local disk in dev) |
| Styling | Tailwind CSS (RTL support) |
| Deployment | Vercel (auto-deploy on push) |

## Features

- **Auth** — Email/password login & registration, admin/user roles
- **Dive Entries** — Rich CRUD form: date, location, depth, weather, equipment, catches, photos, notes, star rating
- **Search & Filters** — Free-text search, date range, location, rating
- **Stats Dashboard** — Total dives, fish caught, hours in water, avg/max depth, visibility, top species, method breakdown
- **Admin Panel** — User management, cross-user entry access, WhatsApp group config
- **Bilingual** — Hebrew (RTL) ↔ English (LTR) with localStorage persistence
- **Photo Upload** — Multi-photo with lightbox gallery (Vercel Blob in prod, local disk in dev)
- **WhatsApp Share** — Formatted dive summary via wa.me
- **Import / Export** — JSON backup and restore

---

## Deploy to Vercel (one-time setup)

### 1. Fork & connect

Click **Deploy with Vercel** above, or:

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import the `OrcaLog` repository

### 2. Add a Postgres database

In the Vercel dashboard → **Storage** → **Create Database** → choose **Postgres (Neon)**.  
Link it to your project — Vercel injects `DATABASE_URL` automatically.

> Alternatively use a free external Postgres from [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) and paste the connection string manually.

### 3. Add Blob storage (for photos)

In the Vercel dashboard → **Storage** → **Create Store** → choose **Blob**.  
Link it to your project — Vercel injects `BLOB_READ_WRITE_TOKEN` automatically.

### 4. Set environment variables

In Vercel → **Settings** → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `DATABASE_URL` | Auto-set if you used Vercel Postgres |
| `BLOB_READ_WRITE_TOKEN` | Auto-set if you used Vercel Blob |

`NEXTAUTH_URL` is set automatically by Vercel to your deployment URL.

### 5. Run migrations

After first deploy, open a terminal and run:

```bash
# Point at your production DB
DATABASE_URL="your-prod-connection-string" npx prisma migrate deploy

# Seed default config (admin emails, whatsapp link)
DATABASE_URL="your-prod-connection-string" npx tsx prisma/seed.ts
```

Or use the [Vercel CLI](https://vercel.com/docs/cli): `vercel env pull` to get env vars locally, then run migrations normally.

---

## Local Development

```bash
# 1. Clone & install
git clone https://github.com/HaimW/OrcaLog.git
cd OrcaLog
npm install

# 2. Create .env (copy and fill in the template)
cp .env.example .env
# Edit .env — set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Migrate & seed the database
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — register an account to get started.

> **Photos in dev**: without `BLOB_READ_WRITE_TOKEN`, photos are saved to `public/uploads/` automatically.

---

## Admin Setup

The default admin email is `admin@orcalog.com` (set in `prisma/seed.ts`).

To grant admin to any email:
1. Log in as an existing admin
2. Go to **Admin panel** → update the admin emails list

Any user whose email appears in the list gets promoted to admin on their next login.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/         # /login  /register
│   ├── entries/        # Entry list, detail, add/edit
│   ├── stats/          # Statistics dashboard
│   ├── admin/          # Admin panel
│   └── api/            # REST API routes (entries, upload, auth, users, config)
├── components/
│   ├── layout/         # Header, BottomNav, AppShell
│   ├── entries/        # EntryCard, EntryForm, FilterBar, PhotoUpload
│   ├── stats/          # StatCard, BarChart
│   └── ui/             # StarRating, Modal
├── shared/             # Pure logic — constants, validators, formatters, stats, share
├── i18n/               # Hebrew & English dictionaries + LanguageProvider
└── lib/                # Prisma client, NextAuth config, entry serialization
prisma/
├── schema.prisma       # DB schema
├── migrations/         # Migration history
└── seed.ts             # Default config seed
```

---

## License

Proprietary — All rights reserved.
