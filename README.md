# OrcaLog — Spearfishing & Diving Logbook

A full-featured bilingual (Hebrew/English) diving logbook web application with admin/member system.

## Tech Stack

- **Next.js 14** (App Router) — Full-stack React framework
- **SQLite + Prisma** — Database with type-safe ORM
- **NextAuth.js** — Authentication (email/password credentials)
- **Tailwind CSS** — Styling with RTL support

## Features

- **Auth**: Email/password registration & login, admin/user roles, auto-admin detection
- **Dive Entries CRUD**: Multi-section form (basic info, weather, equipment, catches, photos, notes/rating)
- **Search & Filters**: Free-text search, date range, location, fishing type, depth, rating
- **Stats Dashboard**: 10+ metrics — total dives, fish caught, hours, avg depth, top species, method breakdown
- **Admin Panel**: View all users, cross-user entry access, config management
- **Bilingual**: Hebrew (RTL) ↔ English (LTR) toggle, persisted in localStorage
- **Photo Upload**: Multi-photo upload with lightbox gallery
- **WhatsApp Share**: Formatted dive summary shared via wa.me
- **Import/Export**: JSON export/import for data portability
- **Mobile Responsive**: Bottom navigation, touch-friendly forms

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev --name init

# Seed default config
npx tsx prisma/seed.ts

# Create .env file
echo 'NEXTAUTH_SECRET=your-secret-here' > .env
echo 'NEXTAUTH_URL=http://localhost:3000' >> .env

# Run dev server
npm run dev
```

Open http://localhost:3000. Register a new account to get started.

## Admin Setup

By default, `admin@orcalog.com` is configured as an admin email. To add admins:

1. Register with the admin email, or
2. Log in as admin → Admin panel → Edit admin emails list

Users whose email matches the admin list get `admin` role on their next login.

## Project Structure

```
src/
├── app/              # Next.js pages & API routes
│   ├── (auth)/       # Login & register pages
│   ├── entries/      # Entry list, detail, add/edit pages
│   ├── stats/        # Statistics dashboard
│   ├── admin/        # Admin panel
│   └── api/          # REST API routes
├── components/       # React components
│   ├── layout/       # Header, BottomNav, AppShell
│   ├── entries/      # EntryCard, EntryForm, FilterBar, PhotoUpload
│   ├── stats/        # StatCard, BarChart
│   └── ui/           # StarRating, Modal
├── shared/           # Pure logic (constants, validators, formatters, stats, share)
├── i18n/             # Bilingual dictionaries (he, en) + LanguageProvider
└── lib/              # Prisma client, auth config, entry serialization
```

## License

Proprietary — All rights reserved.
