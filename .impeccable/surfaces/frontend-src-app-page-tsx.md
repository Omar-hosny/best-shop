---
version: 1
slug: "frontend-src-app-page-tsx"
primary_target: "frontend/src/app/page.tsx"
related_targets: ["frontend/src/components/home/hero.tsx","frontend/src/components/home/featured-panel.tsx","frontend/src/components/home/product-rail.tsx","frontend/src/components/home/goods-board.tsx","frontend/src/components/home/product-card.tsx","frontend/src/components/home/promise-strip.tsx","frontend/src/components/site-header.tsx","frontend/src/components/site-footer.tsx","frontend/src/components/retry-button.tsx","frontend/src/app/cart/page.tsx","frontend/src/lib/home-data.ts","frontend/src/app/globals.css"]
---

Scope: homepage `/` plus its shared header and a `/cart` placeholder. Mode: Persuade.

Audience: first-time browser deciding whether the live catalog and cash-on-delivery checkout are trustworthy. Job: see what is sold and take one working next step. Proof: real products, prices, stock, categories, and the $7.99 shipping fee from the live API and server config. Constraints: keep API reads and designed fallback states, keep `#C2410C` as the primary color, keep `/products` and `/products/:id` unbuilt, keep `/cart` honest about being unfinished, do not fabricate testimonials or delivery dates, leave all work uncommitted.

Chosen direction: COD Waybill (IMPECCABLE'S PICK). Memorable moment: a rubber-stamped CASH ON DELIVERY panel beside a live grid of waybill goods cards.

Unresolved: exact delivery timing and returns terms are not supplied — omit them rather than inventing them. `/products` remains out of scope, so the hero's action stays in-page until that route exists. The header exposes a session-aware Account/Login link and a Cart link to a placeholder page; neither pretends checkout or a full cart is built.

## Direction contract

THESIS: The storefront is the delivery slip: goods, costs, and cash due printed with authority. It refuses the mood-first editorial poster that hid merchandise behind metaphor.

OWN-WORLD: Kraft waybill paper #F3EAD8, ink navy #1B2A52, burnt-orange #C2410C as the only action/stamp color, tabular IBM Plex Mono, 1px muted rules, 24px rounded panels with 16px nested media, numbered waybill fields, and a double-rule rubber stamp. No italic display, section numbers, grain ornaments, or gradient stripes.

STORY: A first-time visitor reads live goods cards, sees honest prices and stock, understands that payment happens on delivery, and clicks one in-page action that goes to the full live list.

FIRST VIEWPORT: A compact BEST SHOP waybill masthead with a live catalog readout; a one-line proof statement; five live goods cards with price and stock; a stamped CASH ON DELIVERY panel showing the $7.99 shipping fee; one burnt-orange rounded action labeled to reach the goods manifest. No decorative eyebrow above the main statement.

FORM: COD Waybill, pick card, seed:bdb5e1eb575be046.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
