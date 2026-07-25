# Draveta Furniture

Draveta Furniture is a solid-wood furniture brand site. It is a storefront that never takes payment: retail (B2C) buyers browse the catalog and are routed out to **Amazon.in** and **Etsy** to purchase. Approved wholesale (B2B) buyers get tiered wholesale pricing and submit **Order Requests** instead of checking out. Affiliates are admin-managed and promote the brand with promo codes tracked by the team.

> The app lives in the [`draveta-app/`](.) subfolder of the repository.

## Tech stack

- **Next.js 16** — App Router, Turbopack
- **React 19**
- **Prisma 7** — driver adapter via `@prisma/adapter-pg`
- **Supabase Postgres** — database
- **NextAuth v5** — credentials provider, JWT sessions
- **Tailwind CSS v4** + **shadcn/ui** — styling and components
- **Resend** — transactional email
- **Vercel** — deployment

## Getting started

The application code is in the `draveta-app/` subfolder, so start there.

```bash
cd draveta-app
npm install
cp .env.example .env       # then fill in the values (see .env.example for notes)
npx prisma generate        # generate the Prisma Client
npm run db:seed            # seed demo data (products, users, B2B/affiliate demo)
npm run dev                # start the dev server on http://localhost:3000
```

### Demo logins

Seeded by `npm run db:seed`:

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | `admin@draveta.com` | `admin123` |
| B2B | `b2b@draveta.com` | `b2bdemo123` |

## Scripts

| Script | Command | Description |
| ------ | ------- | ----------- |
| `dev` | `next dev` | Start the development server |
| `build` | `next build` | Build for production |
| `start` | `next start` | Run the production build |
| `lint` | `eslint` | Lint the codebase |
| `test` | `vitest run` | Run the unit test suite |
| `db:seed` | `npx tsx prisma/seed.ts` | Seed the database with demo data |
| `db:generate` | `prisma generate` | Generate the Prisma Client |
| `db:push` | `prisma db push` | Push the schema to the database |
| `db:studio` | `prisma studio` | Open Prisma Studio |

## Deployment (Vercel)

- Set the project **Root Directory** to `draveta-app` (the app is not at the repo root).
- Set **`DATABASE_URL`** to the Supabase **transaction pooler** URL (port **6543**). Do **not** use the direct `db.<ref>.supabase.co` host — it is IPv6-only and unreachable from Vercel.
- Set **`AUTH_SECRET`** (generate with `openssl rand -base64 32`).
- A `postinstall` hook runs `prisma generate` automatically on install, so the Prisma Client is available at build time.

See [`.env.example`](.env.example) for the full list of environment variables and notes.
