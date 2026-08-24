# Fargo Unisex Salon & Spa

A production-grade, fully responsive booking platform and website for a unisex
hair, beauty, and spa business. Built with **React + TypeScript + Vite + Tailwind CSS**,
backed by **Supabase** (Postgres + Auth + Edge Functions).

## Features

- **Public site** — Home, Services (with detail pages), Home Services, Gallery,
  Products, About, Contact (inquiries), FAQ, and a multi-step Booking flow.
- **Booking** — in-salon or at-home, single or multiple services, optional
  pre-payment, and email notifications to the business on every new booking.
- **Inquiries** — general, product, and service inquiries, also emailed to the business.
- **Admin dashboard** — protected staff portal to manage bookings, inquiries,
  services, products, customers, and settings.
- **Responsive & animated** — every page is mobile- and web-responsive with
  considered, non-generic editorial design and reveal-on-scroll motion.

## Tech

- React 18 + TypeScript
- Vite
- Tailwind CSS (custom `ink` / `cream` / `rose` / `olive` palette)
- React Router
- Supabase (`@supabase/supabase-js`)
- Lucide React icons

## Getting started

```bash
npm install
cp .env.example .env      # then fill in your Supabase credentials
npm run dev
```

### Environment variables

| Variable                  | Used by        | Purpose                                    |
| ------------------------- | -------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`       | Browser        | Supabase project URL                       |
| `VITE_SUPABASE_ANON_KEY`  | Browser        | Supabase anon/public key                   |

The `send-notification` Edge Function reads `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` (both provided by the runtime) and an optional
`RESEND_API_KEY` (set as a function secret) to email the business.

## Database

Schema, seed data, and security policies live in `supabase/migrations/`:

- Public tables (services, products, staff, settings, hours) are readable by
  anyone; writes are restricted to authenticated admins.
- Bookings, booking services, and inquiries accept public inserts (no login
  required) but are only readable/updatable by admins (RLS).
- Triggers auto-generate booking references, prevent staff double-bookings,
  and upsert customer records.

Deploy the migrations and the `send-notification` function from your Supabase
project, then create an admin account via `/admin/login`.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run preview` — preview the build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript type check
