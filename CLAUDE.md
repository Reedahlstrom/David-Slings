# David Slings

Single-product storefront for a $30 handmade leather-and-paracord shepherd sling. The September 2026 redesign uses cream paper, dark green type, DM Serif Display, DM Sans, and small Caveat handwritten notes. Keep copy simple, personal, and short.

## Commands

- `npm run dev` — local Vite preview
- `npm run build` — TypeScript check + production Vite build
- `npm run typecheck` — TypeScript check

## Front-facing architecture

- `src/pages/LandingPage.tsx` — storefront, photo carousel, product quantity, video
- `src/pages/Checkout.tsx` — shipping, review, sample payment
- `src/pages/CheckoutSuccess.tsx` — explicit preview confirmation; unverified real-payment visits never claim success
- `src/pages/MediaStudio.tsx` — in-memory media draft editor with file import/export
- `src/lib/storefront.tsx` — shared media, validation, canonical $30 price, preview setting
- `public/storefront.json` — published media manifest; downloaded editor files can replace it
- `src/index.css` — shared storefront and checkout styling; Tailwind reset is layered

Preview mode is default. `VITE_STOREFRONT_PREVIEW=false` hides preview tools; it does not enable payments. Keep payment entry disabled until Stripe is deliberately integrated and verified. Do not collect card details in the React app. Do not imply a real order exists based solely on a query parameter.

## Existing backend (future work)

Supabase auth/database and Edge Functions, Stripe payments, and the original admin routes are retained. No backend or fulfillment changes were made in this design pass. Read README.md launch notes before enabling real checkout. The webhook currently needs reliability work.

## Hosting

The existing domain is david-slings.com; the user also mentioned davidslings.com, so confirm the domain before changing DNS or canonical URLs. `.openai/hosting.json` identifies a separate private Sites preview. Preserve the GitHub origin and use feature branches for review.
