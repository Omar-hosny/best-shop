# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

First-time browsers: people arriving at the homepage to discover what this shop sells and decide whether to trust it enough to browse or buy. Returning customers can reach their account from the header, but this surface optimizes for discovery.

## Product Purpose

A storefront homepage that turns a live product catalog into a credible first impression and a working next step. Success means a visitor understands what is sold, sees real goods and prices, and can act without encountering a broken path.

## Positioning

A live API-backed catalog with graceful fallback and cash-on-delivery checkout. The catalog, categories, stock, and prices come from the running API; when it fails, the page says so honestly instead of inventing inventory. Card payments are not built.

## Operating Context

Web storefront with a Next.js frontend and Node/Express API. The homepage reads `/api/v1/categories` and two pages of `/api/v1/products?limit=50&sort=newest` so every department is filterable. Authentication is cookie-based JWT. Orders are cash on delivery with a server-calculated shipping fee (default 7.99 USD). Demo admin and user accounts exist in the seed data.

## Capabilities and Constraints

- Home page is the storefront surface. The `/products` listing route remains intentionally unbuilt; `/products/:id` shows live item details, and `/cart` holds the signed-in shopper's live items with quantity, remove, and clear actions.
- `/checkout` takes a delivery address and places a cash-on-delivery order through the live API. The API snapshots prices, calculates delivery, decrements stock, and clears the cart in one transaction; the shopper lands on a refresh-safe `/orders/:id` confirmation.
- `/orders` lists the signed-in shopper's live orders, and `/orders/:id` supports customer cancellation while an order is still pending or confirmed. Cancellation restocks through the same API transaction and shows an honest unavailable state once shipping is under way.
- `/admin` is an admin-only live overview of order counts, open order value, recent orders, and stock watch. `/admin/orders` filters the live queue by status and walks orders from pending to confirmed to shipped to delivered, or cancels before shipping. Every mutation is checked server-side and the backend remains the authority.
- The header shows a session-aware Account or Login link, a Dashboard link for admins, and a Cart link that leads into the working checkout.
- Product and category content must come from the live API with designed loading and failure states.
- Burnt orange `#C2410C` is the binding primary color for both themes; dark-surface text may need a lighter tint of the same hue for contrast.
- No invented testimonials, customer counts, benchmarks, or commercial claims.
- No card payments, image uploads, server-side token revocation, or password-reset flow.
- All work stays uncommitted in the working tree.

## Brand Commitments

Name: Best Shop. Primary UI color: `#C2410C`. The storefront must not fabricate inventory, pricing, or social proof. Live data and honest fallback states are part of the brand, not just implementation details.

## Evidence on Hand

- `AGENTS.md` and `docs/ARCHITECTURE.md` document the API, routes, data model, and known constraints.
- `seeds/data.js` holds 8 categories and 60 products plus demo users.
- Live API at `http://localhost:5000/api/v1`; frontend dev server at `http://localhost:3000`.
- Impeccable critique snapshot: `.impeccable/critique/2026-11-18T21-15-54Z__frontend-src-app-page-tsx.md`.
- Screenshots: `C:\Users\pc\AppData\Local\Temp\opencode\impeccable-home-desktop.png` and `...\impeccable-home-mobile.png`.
- Absent: real customer testimonials, returns policy copy, shipping-time guarantees, and original product photography assets. Do not fabricate them.

## Product Principles

1. Show real merchandise, prices, and stock before making abstract promises.
2. Every visible call to action must have a working destination or an honest disabled state.
3. Trust comes from live data, clear costs, and truthful failure states — not from decorative copy.
4. Cash on delivery is the checkout story until card payments exist.
5. Accessibility and responsiveness are baseline, not a later pass.

## Accessibility & Inclusion

Meet WCAG AA contrast, use at least 44px touch targets on mobile, label icon-only controls, preserve visible keyboard focus, and honor `prefers-reduced-motion`.
