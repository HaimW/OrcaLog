# OrcaLog — Spearfishing & Diving Logbook

Bilingual (Hebrew/English) diving logbook — log dives, catches, weather, equipment, photos, and stats.

---

## Deploy (3 steps, ~5 minutes)

### Step 1 — Create a Vercel project

1. Go to **[vercel.com/new](https://vercel.com/new)** and sign in (free account is enough)
2. Click **"Import Git Repository"** → select **OrcaLog**
3. Don't click Deploy yet

### Step 2 — Add a database

1. In the Vercel dashboard, go to **Storage** → **Create Database**
2. Choose **Prisma Postgres** → click through the defaults → **Connect to project**

Vercel injects `POSTGRES_URL` into your project automatically.

### Step 3 — Add a secret key for login

1. In Vercel → **Settings → Environment Variables**
2. Add one variable:

| Name | Value |
|---|---|
| `NEXTAUTH_SECRET` | any long random string — e.g. `my-super-secret-orcalog-key-2026` |

3. Click **Deploy**

That's it. Every step after this (database migrations, initial setup) runs automatically during the build.

---

## After deploy

- The site URL appears in the Vercel dashboard
- Register at `/register` to create your account
- The first account whose email matches the admin list gets admin access (default: `admin@orcalog.com`)

---

## Local development

```bash
git clone https://github.com/HaimW/OrcaLog.git
cd OrcaLog
npm install

# Get your env vars from the Vercel project (requires Vercel CLI)
npm i -g vercel
vercel link      # connect this folder to the Vercel project
vercel env pull  # downloads .env.local with all the right values

npm run dev      # http://localhost:3000
```

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Prisma |
| Auth | NextAuth.js (email + password) |
| File storage | Vercel Blob |
| Styling | Tailwind CSS |
| Hosting | Vercel |
