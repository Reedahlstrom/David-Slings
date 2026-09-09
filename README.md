# David Slings

Cream-and-green storefront for a $30 handmade shepherd sling. React 19, TypeScript, Vite 7, and Tailwind 4. The September redesign is a **front-facing design preview**; it does not charge customers or create orders.

## Development

```sh
npm ci
npm run dev
npm run build
```

The preview is enabled by default. `/checkout` walks through shipping, review, a sample payment screen, and a clearly labeled sample confirmation. Shipping information stays in React memory and is never submitted or stored. Refreshing checkout clears those details. Quantities are limited to 1–10; prices come from `PRICE` in `src/lib/storefront.tsx`.

## Photos and video

Open `/studio`, or click **Add your photos** in the storefront preview.

- Replace the cover and upload up to eight carousel photos (JPG, PNG, WebP, 5 MB per image).
- Reorder images, edit captions and screen-reader descriptions, and paste a YouTube link.
- Preview changes without leaving the app. Drafts stay in memory until the page reloads.
- Click **Download changes** to save `storefront.json`. **Import saved changes** restores that file.
- To publish approved media, replace `public/storefront.json` with the downloaded file and rebuild. Uploaded photos are embedded in the file; keep it out of chat messages and use normal file transfer.

The default illustration is conceptual, not a photograph of the actual product. The two landscape photographs are sample imagery. See `ASSETS.md` for provenance. A video is not supplied; the video area honestly says the how-to is coming soon until a URL is added.

## Preview and production

`.openai/hosting.json` identifies the private Sites design preview. The existing GitHub/Cloudflare domain deployment has not been replaced.

`VITE_STOREFRONT_PREVIEW=false` hides photo-editing tools and sample checkout completion. **It does not enable payments.** Payment integration and launch verification are a separate step.

The original Supabase admin pages, database migration, checkout function, and webhook remain in the repository for that step. Existing admin pages require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. No admin or fulfillment features were added.

Before accepting real orders:

1. Confirm actual product photos, materials, shipping/returns terms, and the correct domain (`david-slings.com` vs. `davidslings.com`).
2. Configure a $30 USD Stripe price and connect the reviewed checkout to hosted Stripe payment collection. Validate prices on the server; never trust the browser total. Confirm shipping countries and applicable tax behavior.
3. Repair webhook error handling, duplicate-event handling, signature freshness checks, and payment-status checks. Confirm the Stripe response shape used for shipping addresses.
4. Verify a Stripe test payment produces exactly one complete order with the correct address and quantity; test a declined/canceled payment and a retried webhook.
5. Replace the unverified success fallback with server-verified order status. Implement the promised order/tracking emails.
6. Verify admin access and fulfillment updates, then run a production smoke test before switching traffic.

## Validation performed

- Production TypeScript/Vite build.
- Browser walkthrough: quantity 2 → $60, required fields, shipping review, sample payment, correct sample confirmation.
- Media reordering, invalid video rejection, and downloading a media draft.
- Responsive storefront and checkout review.
- Automated file upload was blocked by the browser extension's file-access setting; the upload code needs a manual file-picker smoke test.

No live transaction, database mutation, or fulfillment test was performed in this front-end pass.
