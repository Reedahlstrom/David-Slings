# David Slings

Cream-and-green storefront for a $30 handmade shepherd sling. React 19, TypeScript, Vite 8, and Tailwind 4, with a small Cloudflare Worker for site editing. Checkout is a **design preview**: no charges, orders, or addresses are stored.

## Editing the site (no terminal)

Open `/studio`, or click **Edit site** while signed in as the owner.

- Click any page text to edit it in the side panel. The Text tab also lists copy for the home page, navigation, footer, checkout, and confirmation.
- Use Photos to replace the hero, product/checkout image, video cover, and up to 12 carousel images. JPG, PNG, and WebP files up to 8 MB are supported. Move photos with the arrows, adjust cropping, and edit captions and image descriptions.
- Paste a YouTube link to set the how-to video.
- Use Layout to reorder or hide the four sections below the hero.
- Use Settings for the sling price, contact email, and Instagram profile.
- **Save changes** publishes the draft immediately on this Site. **Undo changes** returns to the last save. Closing the editor keeps the current draft; reloading discards unsaved work after a browser warning.

Text is plain text. Payment preview/system notices remain fixed until real checkout is implemented. The Instagram URL is a placeholder. Default images are samples; see `ASSETS.md` for provenance.

## Storage and authorization

`GET /api/content` returns the saved document from D1. If the database is empty it returns `shared/content.ts` defaults. Writes use optimistic revision checks so an old tab cannot overwrite a newer save. A failed save leaves the draft intact. Future releases merge newly introduced default copy into saved documents.

Owner editing requires both a Sites-authenticated user ID and an authenticated email matching the runtime `EDITOR_EMAIL` secret configured in Sites. The dispatch service supplies trusted authentication headers; never host this Worker directly on a public endpoint without equivalent header stripping/authentication. Writes require a matching Origin and validated content. Images are stored in R2 with random keys and served under `/media/`; uploads are size-limited and signature-checked. Removing a picture from the page does not delete its stored file, so existing saved versions remain usable.

Schema lives in `db/schema.ts`; generated schema-only migrations live in `drizzle/`. There is no runtime table creation. `.openai/hosting.json` declares logical D1/R2 bindings and identifies the separate private Sites preview. The existing GitHub/domain deployment has not been replaced.

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
```

Build output is `dist/client` plus `dist/server/index.js`; the Sites Vite plugin packages hosting metadata and Drizzle migrations. The Worker uses `ASSETS`, `DB`, and `FILES` bindings. `wrangler.jsonc` is for local development, not production provisioning; use Sites for deployment and environment values.

## Real orders (future work)

`VITE_STOREFRONT_PREVIEW=false` disables sample checkout completion; it does **not** enable payments. Checkout keeps address data only in memory. The original Supabase admin pages/functions remain for future integration and need `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Before accepting orders, connect a server-validated Stripe price, verify webhook signature/payment status and duplicate handling, confirm address storage and shipping/tax rules, and implement verified order confirmation, tracking emails, and fulfillment controls. Site editor price changes currently affect only the storefront and sample checkout.
