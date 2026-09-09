# David Slings

Cream-and-green storefront for a $30 handmade shepherd sling. React 19, TypeScript, Vite 8, and Tailwind 4, with a Cloudflare Worker for site editing and Stripe Checkout. Real payments stay disabled until the production payment, shipping, and tax settings are configured.

## Editing the site (no terminal)

Open `/studio`, or click **Edit site** while signed in as the owner.

- Click any page text to edit it in the side panel. The Text tab also lists copy for the home page, navigation, footer, checkout, and confirmation.
- Use Photos to replace the hero, product/checkout image, video cover, and up to 12 carousel images. JPG, PNG, and WebP files up to 8 MB are supported. Move photos with the arrows, adjust cropping, and edit captions and image descriptions.
- Paste a YouTube link to set the how-to video.
- Use Layout to reorder or hide the four sections below the hero.
- Use Settings for the sling price, contact email, and Instagram profile.
- **Save changes** publishes the draft immediately on this Site. **Undo changes** returns to the last save. Closing the editor keeps the current draft; reloading discards unsaved work after a browser warning.

Text is plain text. Payment status notices reflect the server-verified Stripe result. The Instagram URL is a placeholder. Default images are samples; see `ASSETS.md` for provenance.

## Storage and authorization

`GET /api/content` returns the saved document from D1. If the database is empty it returns `shared/content.ts` defaults. Writes use optimistic revision checks so an old tab cannot overwrite a newer save. A failed save leaves the draft intact. Future releases merge newly introduced default copy into saved documents.

Owner editing requires both a Sites-authenticated user ID and an authenticated email matching the runtime `EDITOR_EMAIL` secret configured in Sites. The dispatch service supplies trusted authentication headers; never host this Worker directly on a public endpoint without equivalent header stripping/authentication. Writes require a matching Origin and validated content. Images are stored in R2 with random keys and served under `/media/`; uploads are size-limited and signature-checked. Removing a picture from the page does not delete its stored file, so existing saved versions remain usable.

Schema lives in `db/schema.ts`; generated schema-only migrations live in `drizzle/`. There is no runtime table creation. `.openai/hosting.json` declares logical D1/R2 bindings and identifies the Sites deployment. Preserve its saved content when publishing new code.

## Development

```sh
npm ci
npm run build
npm run db:migrate
npm run dev:api
# In another terminal:
npm run dev
```

The loopback-only Vite dev proxy supplies a simulated local editor identity to the local Worker. Production uses Sites authentication and the managed owner email. Do not expose either local dev server publicly. Local data stays under ignored `.wrangler/`.

```sh
npm run typecheck
node scripts/check-editor.mjs  # local API server must be running
npm run test:payments
```

Build output is `dist/client` plus `dist/server/index.js`; the Sites Vite plugin packages hosting metadata and Drizzle migrations. The Worker uses `ASSETS`, `DB`, and `FILES` bindings. `wrangler.jsonc` is for local development, not production provisioning; use Sites for deployment and environment values.

## Payments and orders

`POST /api/checkout` creates hosted Stripe Checkout using the saved D1 price, quantity 1–10, a configured Stripe product, shipping countries, and shipping charge. The browser supplies the expected price only to detect stale pages; it cannot choose the actual amount. Stripe collects card and shipping details. Repeated requests use the same Stripe idempotency key. Existing Stripe sessions retain the price quoted when created.

`POST /api/stripe/webhook` verifies Stripe's signature and timestamp, retrieves the authoritative session, validates payment status/product/amounts, and stores the order and event together in D1. Duplicate notifications cannot duplicate orders or revert fulfillment/refund status. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `charge.refunded`. Refund reconciliation also handles refunds arriving before payment notifications.

`GET /api/order-status?session_id=…` verifies the session with Stripe and recovers paid orders if a webhook is delayed. It returns only status, reference, quantity, amount, currency, and test-mode flag. It never returns an email or address. Visiting `/success` alone never claims a payment succeeded.

Orders and addresses are visible in the Stripe Dashboard. A full in-app admin interface is deferred. Owner-only `/api/orders` and `/api/orders/fulfill` provide the storage groundwork; marking shipped does not send an email. Original Supabase admin pages/functions are legacy and are not connected to this payment flow. Do not deploy the old Supabase checkout/webhook functions.

Configure these runtime values through Sites (use an ignored `.dev.vars` file locally):

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` (secret) | Existing Stripe server key for the selected mode |
| `STRIPE_WEBHOOK_SECRET` (secret) | Signing secret for this endpoint |
| `STRIPE_PRODUCT_ID` | The David Sling product in the same mode |
| `PAYMENTS_MODE` | `off`, `test`, or `live`; defaults to off |
| `SHIPPING_COUNTRIES` | Confirmed destinations, currently supports `US,CA` |
| `SHIPPING_AMOUNT_CENTS` | Confirmed per-order shipping fee; `0` means free |
| `STRIPE_AUTOMATIC_TAX` | Explicit `true` or `false`; configure required registrations in Stripe before enabling automatic tax |
| `SITE_URL` | Canonical storefront origin for return URLs |
| `DISPATCH_NOTE`, `RETURNS_POLICY` | Owner-confirmed customer-facing policies |

Missing payment/shipping/tax configuration keeps the payment button disabled. Never enter bank details in this repository: payout accounts are managed directly in Stripe. Do not commit credentials, customer records, or test checkout URLs.

Payment verification includes canonical pricing, cross-origin rejection, invalid/stale webhook signatures, duplicate events, unpaid sessions, order privacy, fulfillment authorization, refund ordering, and database-failure retries. The September 2026 integration also passed a hosted Stripe sandbox checkout with a declined card, successful payment, real signed webhook delivery to the local Worker, confirmation, and full test refund. No live charge was made.
