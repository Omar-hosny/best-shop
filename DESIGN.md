---
name: Best Shop
description: Live goods, plain prices, and cash on delivery printed like a waybill.
colors:
  primary: "#c2410c"
  primary-foreground: "#ffffff"
  kraft-paper: "#f3ead8"
  ink-navy: "#1b2a52"
  paper-card: "#fffcf4"
  surface: "#e9dfcb"
  surface-accent: "#ded2ba"
  muted-ink: "#4a4360"
  rule: "#b9aa90"
  subtle-ink: "#5e5749"
  dark-ground: "#101b33"
  dark-card: "#182748"
  dark-ink: "#f3ead8"
  dark-muted-ink: "#c8d0df"
  dark-rule: "#40527a"
  dark-accent: "#ff8a5b"
typography:
  display:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  product:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  ledger:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  field: "2px"
  media: "2px"
  pill: "999px"
  panel: "24px"
  panel-inner: "16px"
spacing:
  page-x: "1rem"
  page-x-sm: "1.5rem"
  page-x-lg: "2rem"
  section-y: "3.5rem"
  section-y-lg: "5rem"
  grid-gap: "2rem"
  row-y: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
    height: "3rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.25rem"
    height: "2.75rem"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem"
    height: "2.75rem"
  filter-chip-active:
    backgroundColor: "{colors.ink-navy}"
    textColor: "{colors.kraft-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem"
    height: "2.75rem"
  waybill-panel:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink-navy}"
    padding: "1.25rem"
    rounded: "{rounded.panel}"
  delivery-stamp:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.primary}"
    typography: "{typography.title}"
    padding: "1rem 1.25rem"
    rounded: "{rounded.panel}"
  product-card:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink-navy}"
    typography: "{typography.product}"
    padding: "1rem"
    rounded: "{rounded.panel}"
---

# Design System: Best Shop

## Overview

**Creative North Star: "The Delivery Slip"**

The storefront reads as a printed waybill: goods, costs, and payment printed with bureaucratic clarity on warm kraft paper. It replaces the previous editorial field-guide world rather than polishing it. Metaphor never sits in front of merchandise; the live goods cards are the hero, and the cash-on-delivery stamp is the one memorable flourish.

The system is flat, ruled, and dense enough to be trusted. Fine muted rules form the grid, IBM Plex Mono carries every label and number, and burnt orange appears only where the visitor needs to act or where the payment promise is stamped. Product photography remains API-supplied; the homepage ships no local raster and invents no inventory or social proof.

**Key Characteristics:**

- Kraft ground with carbon-copy separations and softly rounded paper panels.
- One action color, used sparingly on primary buttons, live status, and the COD stamp.
- Tabular mono data for prices, stock, categories, and costs.
- Pill-shaped actions and chips inside a softly rounded paper-panel world.
- Honest loading, empty, and failure states instead of placeholder goods.

## Colors

The palette is paper, ink, and one burnt-orange stamp. Dark mode keeps the same primary on buttons but lifts text and stamp accents to a lighter tint of the same hue.

### Primary

- **Burnt Orange Stamp** (#c2410c): The binding primary. Used on the primary action, live-read status, stock counts, filter counts, and the double-rule cash-on-delivery stamp. It never becomes a background wash.

### Neutral

- **Kraft Paper** (#f3ead8): Page ground in light mode. Warm, opaque, and untextured; structure comes from rules, not grain.
- **Ink Navy** (#1b2a52): Primary text, active filters, and the footer ground in light mode.
- **Paper Card** (#fffcf4): Raised card and panel interior, used for the delivery stamp and cost ledger.
- **Surface** (#e9dfcb): Quiet tonal layer for media placeholders, the delivery section, and loading blocks.
- **Surface Accent** (#ded2ba): Secondary tonal layer retained for the broader app; not a homepage accent.
- **Muted Ink** (#4a4360): Supporting copy and column labels in light mode.
- **Rule** (#b9aa90): Panel borders, carbon-copy dividers, and input borders in light mode.
- **Subtle Ink** (#5e5749): Low-emphasis supporting tone retained from the app palette.
- **Night Ground** (#101b33): Dark-mode page ground.
- **Night Card** (#182748): Dark-mode card and surface layer.
- **Night Ink** (#f3ead8): Dark-mode body text.
- **Night Muted Ink** (#c8d0df): Dark-mode supporting copy.
- **Night Rule** (#40527a): Dark-mode borders and dividers.
- **Night Stamp Tint** (#ff8a5b): Light tint of the primary hue for dark-mode text, stamp strokes, and focus rings. Buttons remain #c2410c.

**The One Accent Rule.** Burnt orange is the only accent. If an element is not an action, a live-data signal, or the payment stamp, it does not get the accent.

**The Rule Rule.** Structure is drawn with 1px muted rules, dashed carbon-copy separators, and tonal paper layers. The only heavy line is the double-rule cash-on-delivery stamp. No grain, rings, stripes, or gradient substitutes.

## Typography

**Display Font:** Archivo Black (with Arial Black fallback)
**Body Font:** Outfit (with system-ui fallback)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace fallback)

**Character:** Archivo Black is compressed, uppercase, and authoritative; it prints like a heading struck onto a form. IBM Plex Mono carries waybill copy, product names, labels, prices, stock counts, and costs so the whole form reads as entered data. Outfit remains the shared app body face outside this surface.

### Hierarchy

- **Display** (400 weight, `clamp(3rem, 8vw, 6rem)`, 0.88 line-height): The Best Shop masthead only. Uppercase, tight tracking (-0.04em).
- **Headline** (400 weight, 2.25rem, 1.05 line-height): Section titles such as Goods Manifest and Pay on Delivery.
- **Title** (400 weight, 1.25rem, 1.1 line-height): The Live Goods label and the Cash on Delivery stamp.
- **Body** (400 weight, 1rem, 1.75 line-height): Shared app copy outside the waybill.
- **Ledger** (400 weight, 0.875rem, 1.6 line-height): Waybill proof statements and delivery explanation; practical measure capped near 65ch.
- **Product** (600 weight, 0.875rem, 1.45 line-height): Mono product names and price cells in the goods ledger.
- **Label** (500 weight, 0.75rem, 1.3 line-height, 0.08em tracking): Mono labels, card fields, filters, buttons, and footer facts. Always uppercase in this surface.

**The Mono Ledger Rule.** On the waybill, explanatory copy, product names, and every value that changes with live data are mono and tabular. Outfit belongs to the rest of the app, not to the printed form.

## Layout

A single 80rem container (`max-w-7xl`) holds the whole surface with `1rem` side padding on mobile, `1.5rem` from the small breakpoint, and `2rem` from the large breakpoint. Sections are separated by 1px muted full-width rules; internal section rhythm is `3.5rem`, growing to `5rem` on large screens.

The masthead places the shop name and proof line against a bordered live-readout panel; at large widths they share a `1.5fr / 0.5fr` grid. That panel and the cost ledgers carry numbered waybill fields (`01`, `02`, `03`) with dashed carbon-copy separators; the numbers identify form fields, not document sections. Below the masthead, the live goods card grid and delivery stamp use `1fr / 19rem`. The goods manifest holds a wrapable filter row, a live status line, and a 12-card preview with a working Show remaining control. The closing delivery slip uses `1fr / 24rem` on large screens. The sticky header is opaque kraft paper and reserves `7.5rem` scroll margin on mobile and `5.5rem` from the small breakpoint; a skip link becomes visible on keyboard focus.

Mobile collapses every grid into one column. The five hero cards keep image, name, category, price, and stock visible; the full manifest uses a responsive card grid with price and stock separated by a dashed carbon-copy rule. The header wraps to two rows on mobile: shop name and Account/Login, Cart, and theme toggle first, then the page anchors. Every visible interactive target is at least 44px tall.

## Elevation & Depth

The waybill is flat. Depth comes from paper tone changes and fine rule weight, not shadow. The delivery stamp is a card interior on the kraft ground with a rotated double-rule border; the active filter is an inverted ink rectangle. Existing shadow tokens are outside this surface's language.

**The Flat Form Rule.** Panels sit on the page by tone and a hairline border. No ambient shadows, lifted cards, or glass effects belong on the waybill.

## Shapes

Panels, media, product cards, filters, and ledgers use a `24px` corner radius, with `16px` on nested media so images clip cleanly inside their card. Actions are pill-shaped at `999px`. The stamp alone keeps its heavy double 4px burnt-orange rule, rotated -3deg; its 620ms entrance settles in and honors reduced motion.

## Components

### Buttons

- **Shape:** Pill (`999px`), minimum 44–48px tall.
- **Primary:** Burnt orange ground, white uppercase mono label, `0.75rem 1.5rem` padding; used for Read the full goods list, Show all goods, and Back to live goods.
- **Hover / Focus:** Primary darkens to 85% opacity; focus ring is 3px in the primary color with 3px offset.
- **Secondary:** Transparent with a 1px muted border, or an underlined mono text link; hover inverts or shifts to the primary tint.

### Chips

- **Style:** Pill-shaped, 1px muted border, mono uppercase label plus live count.
- **State:** Active filters invert to ink navy with kraft text; inactive filters keep kraft ground with ink text and a primary count. All filters carry `aria-pressed`.

### Cards / Containers

- **Corner Style:** Rounded (`24px`); nested media `16px`.
- **Background:** Paper card or surface tone on the kraft ground.
- **Shadow Strategy:** None; see Elevation & Depth.
- **Border:** 1px muted rule; the delivery stamp uses a 4px double primary rule.
- **Internal Padding:** `1.25rem` for panels, `1rem` for stamp internals.

### Product Card

- **Style:** Rounded `24px` panel with a 1px muted border on a paper-card interior; media uses a `16px` radius and is clipped cleanly. A `1px` dashed rule separates the live price from the live stock line.
- **Type:** Category, name, price, stock, and labels are mono with tabular numerals.
- **States:** Sold-out cards keep the same layout with muted stock text. Empty or failed reads use a bordered status block with a retry action, never sample cards. Streaming skeletons announce `role="status"` and `aria-busy="true"`.
- **Affordance:** Cards are non-clickable because product detail pages do not exist; no hover cue implies a destination.

### Navigation

- **Style:** Sticky header, 1px muted bottom rule, opaque kraft ground, uppercase mono labels.
- **Targets:** Logo, Goods, Departments, Delivery, Account/Login, Cart, and theme toggle are at least 44px tall and labeled.
- **Scope:** Page anchors are in-page; Account and Login go to built routes and resolve from the server session. Cart goes to a placeholder page that says the cart is not built yet. Product and register links are still withheld, and the placeholder is never presented as checkout.

### Delivery Stamp

- **Character:** The signature object: a double-rule burnt-orange stamp reading CASH ON DELIVERY. Its container has no border or card ground, so the stamp is the only card in that column.
- **Behavior:** Sits beside the live goods card grid in the first viewport, with the standard delivery fee and card-needed answer printed beneath it.
- **Motion:** One 620ms settle from the already-visible stamp state into its final -3deg rotation; no fade or blur entrance. Reduced motion shows the final rotated stamp immediately.

## Do's and Don'ts

### Do:

- **Do** read prices, stock, categories, and product names from the live API; show the honest failure state when the read fails.
- **Do** keep primary buttons #c2410c in both themes; use #ff8a5b only as the dark-surface text and stamp tint.
- **Do** use 1px muted rules, rounded panels, pill actions, and tabular IBM Plex Mono for live values.
- **Do** keep all visible CTAs on working in-page anchors, built routes, honest placeholders, or real state changes, with targets at least 44px tall.
- **Do** leave product photography to API-supplied URLs; this surface ships no local raster.

### Don't:

- **Don't** add testimonials, customer counts, delivery dates, returns promises, benchmark numbers, or sample inventory.
- **Don't** link to /products or /products/:id while those paths remain unbuilt, and don't present the cart placeholder as a working checkout.
- **Don't** use grain, concentric rings, repeating stripes, gradients, italic display, numbered section labels, or editorial object language on the waybill.
- **Don't** use Newsreader display type on this surface; it remains only for the untouched auth screens.
- **Don't** hide goods behind hover, carousels, or decorative panels; the live goods cards are the hero.
