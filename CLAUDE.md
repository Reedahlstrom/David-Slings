# CLAUDE.md

## Project Overview

David Slings is a single-product ecommerce site selling handcrafted slings. Dark, dramatic aesthetic inspired by David and Goliath.

**Stack:** Vite 7 + React 19 + TypeScript, Supabase (auth + DB), Stripe (payments), Cloudflare Pages (hosting).

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run preview      # Preview production build
npm run typecheck    # Type check only
```

## Architecture

- **Frontend:** `src/` — React SPA with Tailwind CSS v4, Framer Motion
- **Pages:** LandingPage (customer-facing), CheckoutSuccess, AdminLogin, AdminDashboard
- **Lib:** `src/lib/supabase.ts` (client), `src/lib/stripe.ts` (checkout redirect), `src/lib/cn.ts` (classnames)
- **Backend:** Supabase Edge Functions in `supabase/functions/`
  - `create-checkout-session` — creates Stripe Checkout Session
  - `stripe-webhook` — handles payment completion, writes orders
- **Database:** Supabase Postgres — `customers`, `orders`, `admin_users` tables with RLS
- **Path alias:** `@` maps to `src/`

## Patterns

- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Custom theme tokens in `src/index.css` (gold, stone, cream palette)
- Fonts: Cinzel (headings), Inter (body)
- `lucide-react` for icons, `framer-motion` for animations
- No cart — single product, "Buy Now" → Stripe Checkout redirect
- No customer accounts — only admin auth via Supabase
- Admin dashboard at `/admin` (protected), login at `/admin/login`

## Hosting

- **Cloudflare Pages** for frontend (static build from `dist/`)
- **Supabase Edge Functions** for backend API
- **Domain:** david-slings.com (GoDaddy DNS → Cloudflare)
