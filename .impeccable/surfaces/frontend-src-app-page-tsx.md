---
version: 1
slug: "frontend-src-app-page-tsx"
primary_target: "frontend/src/app/page.tsx"
related_targets: ["frontend/src/components/home/hero.tsx","frontend/src/components/home/featured-panel.tsx","frontend/src/components/home/product-rail.tsx","frontend/src/components/home/goods-board.tsx","frontend/src/components/home/product-card.tsx","frontend/src/components/home/promise-strip.tsx","frontend/src/components/site-header.tsx","frontend/src/components/site-footer.tsx","frontend/src/components/retry-button.tsx","frontend/src/app/cart/page.tsx","frontend/src/lib/home-data.ts","frontend/src/app/globals.css"]
---

Scope: homepage `/` plus shared header/footer and the `/cart` placeholder. Mode: Persuade.

Audience: a first-time browser deciding whether a live catalog and cash-on-delivery checkout are trustworthy. Job: see real goods and take one working next step. Proof: live products, prices, stock, categories and the $7.99 delivery fee. Constraints: keep API reads and designed fallback states, keep `#C2410C` as the primary action color, keep `/cart` honest about being unfinished, invent no testimonials or delivery dates, leave all work uncommitted.

Chosen direction: Lantern Bazaar — a night-market stall built from painted signboards, hanging paper price tags and one strand of warm bulbs. The old COD Waybill world is replaced, not polished. Memorable moment: a hanging CASH ON DELIVERY signboard above a live shelf of goods, with a bulb strand connecting it to the stall counter.

Unresolved: delivery timing and returns terms are not supplied, so they stay absent. The cart remains an honest placeholder. Product photography stays API-supplied; no local raster ships.

## Direction contract

THESIS: The storefront is a stall at dusk — goods hung on a board, prices painted on tags, cash collected at the door. It refuses both the waybill/delivery-slip form it replaces and the generic hero-over-card-row storefront.

OWN-WORLD: Warm ivory canvas and aubergine ink in light mode, deep aubergine night ground and ivory ink in dark; one burnt-orange `#C2410C` action color (lighter `#FFB27A` only for dark-surface text); Bungee painted-sign display, Karla body, Roboto Mono for live figures; heavy 2px sign borders, square paper tags with a single punched hole, a bulb strand drawn in CSS, no shadows, gradients, grain, rubber stamps, or waybill field numbers. Raised by DRAWCORD STATE VOCABULARY (explicit named states) and ARCADE PALETTE LAW (accent reserved for action and live signals).

STORY: The visitor walks up to a live stall, reads real goods and prices on hanging tags, sees the CASH ON DELIVERY board with the fixed delivery fee, and follows one action into the full live goods board.

FIRST VIEWPORT: A compact stall masthead with a live-read bulb; a one-line offer in Bungee; a shelf of five real product tags with price and stock; a hanging COD signboard with a bulb strand and the $7.99 fee; one orange painted-sign action reaching the goods board. No eyebrow above the main statement.

FORM: Lantern Bazaar, assigned candidate 4 of the grounded direction list; seed:e7b66a13273a9ecb.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
