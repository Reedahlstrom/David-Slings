# David Slings

Single-product storefront for a $30 handmade leather-and-paracord shepherd sling. The September 2026 redesign uses cream paper, dark green type, DM Serif Display, DM Sans, and small Caveat handwritten notes. Keep copy simple, personal, and short.

## Commands

- `npm run dev` — local Vite preview
- `npm run build` — TypeScript check + production Vite build
- `npm run typecheck` — TypeScript check

## Front-facing architecture

- `src/pages/LandingPage.tsx` — storefront, photo carousel, product quantity, video
- `src/pages/Checkout.tsx` — order summary and hosted Stripe Checkout
- `src/pages/CheckoutSuccess.tsx` — server-verified payment confirmation; unverified visits never claim success
- `src/pages/MediaStudio.tsx` — owner sign-in entry for the persistent site editor
- `src/lib/storefront.tsx` — shared content provider, owner editing state, save/revision handling, preview setting
- `public/storefront.json` — published media manifest; downloaded editor files can replace it
- `src/index.css` — shared storefront and checkout styling; Tailwind reset is layered

Payments are disabled by default through `PAYMENTS_MODE=off`. `worker/payments.ts` handles canonical pricing, hosted Checkout, signed webhooks, order persistence, refunds, and owner-only fulfillment endpoints. Stripe keys and signing secrets belong in Sites runtime secrets, never source. Run `npm run test:payments` for payment integrity checks. Do not collect card or banking details in the React app.

The original Supabase admin/functions are retained legacy code, not part of the current flow. The full admin UI remains deferred; use Stripe Dashboard for orders. See README for runtime configuration and launch requirements.

## Hosting

The user confirmed the production domain as david-slings.com and authorized publishing the redesigned store there. `.openai/hosting.json` identifies its Sites project. Preserve the GitHub origin and use feature branches for review.

## Site editor

`shared/content.ts` and `shared/copy.json` define editable defaults and validation. `src/components/SiteEditor.tsx` supplies inline copy editing, media controls, section order, and settings. `worker/index.ts` enforces owner identity and same-origin writes, stores content in D1 and uploads in R2. Use generated Drizzle migrations, no runtime DDL. Production owner email belongs in the Sites runtime secret EDITOR_EMAIL; never commit it. Run `npm run db:migrate` and `npm run dev:api` for local persistence. See README for the complete workflow.
