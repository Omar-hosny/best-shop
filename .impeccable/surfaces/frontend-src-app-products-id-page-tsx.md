---
version: 1
slug: "frontend-src-app-products-id-page-tsx"
primary_target: "frontend/src/app/products/[id]/page.tsx"
related_targets: ["frontend/src/lib/product-data.ts","frontend/src/components/product/product-docket.tsx","frontend/src/components/product/quantity-field.tsx","frontend/src/components/product/product-detail-skeleton.tsx","frontend/src/components/home/product-card.tsx"]
---

# Product item board — `/products/[id]`

## Scope and mode

Persuade. One live catalog item: a visitor decides whether this is the right good and takes the buying action. The surface inherits the Lantern Bazaar world from DESIGN.md; it is an extension of the system-wide replacement direction, not a second identity.

## Audience, job, action

First-time browsers who arrived from the live goods board want the real photograph, live price, live stock, description, and cash-on-delivery terms. The category action is add to cart; the cart page is still an honest placeholder, so the primary action is disabled with a plain explanation. Secondary actions return to the live goods board.

## Proof and content

Everything comes from `GET /products/:id` and `GET /products?category=…&limit=…`: name, description, price, quantity, images, category. No testimonials, delivery dates, review counts, or invented stock. A missing item uses the route's not-found UI; an unreachable API gets a designed failure panel with retry.

## Constraints

- Keep the bazaar vocabulary: ivory/aubergine sign surfaces, Bungee headings, Roboto Mono live values, 2px painted-sign borders, hanging tag details, one orange action color.
- No waybill numbers, rubber stamps, carbon-copy rules, shadows, gradients, or generic product-page card row.
- Every CTA resolves to a working route or an honest disabled state; targets are at least 44px.
- Photography stays API-supplied; no local raster on this surface. All work stays uncommitted.

## Chosen direction and memorable moment

Pegboard stall display: the product hangs under a single bulb on a pegboard, its price ticket dangling on a string, with stock and classification on pinned paper tags and the CASH ON DELIVERY board closing the counter. The composition is the dealt lead of the surface roll.

## Unresolved decisions

- Real add-to-cart waits for the cart surface; the disabled action says so.
- Delivery timing and returns remain unwritten because no source exists for them.

## Direction contract

THESIS: A product page is one stall display for a single live item, not a consignment form and not a gallery-left/copy-right template. It refuses the docket it replaces.

OWN-WORLD: Ivory paper tags on an aubergine pegboard ground (light) or aubergine tags on a night ground (dark), Bungee item name and price, Roboto Mono for every live value, 2px sign borders and punched-hole tag details, orange only on the live signal, low stock, and the primary action. No stamps, field numbers, shadows, or gradients.

STORY: The visitor reads the item as a stall display — what it is, what it costs, how many are ready, what the notes say, how payment works — with every value visibly read live.

FIRST VIEWPORT: A thin stall strip with a live-read bulb; a dominant bordered product photo with a hanging price ticket; beside it the item name, pinned classification and stock tags, quantity ticket, disabled action with honest note, and the CASH ON DELIVERY board. A plain rule ends the counter before notes below.

FORM: Pegboard stall display, dealt lead (index 7) of the surface structure list; seed:772744a9ff5dd1f2.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
