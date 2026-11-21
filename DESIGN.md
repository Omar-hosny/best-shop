---
name: Best Shop
description: A night-market stall of live goods, painted price tags, and cash paid at the door.
colors:
  primary: "#c2410c"
  primary-foreground: "#ffffff"
  brand: "#c2410c"
  brand-foreground: "#ffffff"
  ivory: "#fff3dc"
  aubergine: "#2a1738"
  card: "#fffcf1"
  surface: "#f5e7c9"
  surface-accent: "#e8d2a5"
  sign: "#2a1738"
  sign-foreground: "#fff3dc"
  bulb: "#f4b740"
  bulb-foreground: "#171029"
  rule: "#bfa984"
  muted-ink: "#5b4566"
  subtle: "#6b5674"
  destructive: "#a32121"
  night-ground: "#171029"
  night-card: "#251a3b"
  night-ink: "#fff3dc"
  night-muted-ink: "#d8cbe6"
  night-rule: "#624d80"
  night-surface: "#211638"
  night-surface-accent: "#2e2047"
  night-brand: "#ffb27a"
  night-brand-foreground: "#171029"
  night-destructive: "#ff8f7d"
typography:
  display:
    fontFamily: "Bungee, Impact, sans-serif"
    fontSize: "clamp(2.25rem, 5.4vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Bungee, Impact, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0.01em"
  title:
    fontFamily: "Bungee, Impact, sans-serif"
    fontSize: "clamp(1.75rem, 2.6vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.01em"
  body:
    fontFamily: "Karla, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  product:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.45
  label:
    fontFamily: "Roboto Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.08em"
rounded:
  panel: "2px"
  media: "2px"
  pill: "999px"
spacing:
  page-x: "1rem"
  page-x-sm: "1.5rem"
  page-x-lg: "2rem"
  section-y: "3rem"
  section-y-lg: "4rem"
  grid-gap: "0.75rem"
  row-y: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.panel}"
    padding: "0 1.5rem"
    height: "3rem"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.aubergine}"
    typography: "{typography.label}"
    rounded: "{rounded.panel}"
    padding: "0 1.25rem"
    height: "2.75rem"
  sign-panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.aubergine}"
    padding: "1rem"
    rounded: "{rounded.panel}"
  sign-solid:
    backgroundColor: "{colors.sign}"
    textColor: "{colors.sign-foreground}"
    padding: "1.25rem 1.5rem"
    rounded: "{rounded.panel}"
  product-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.aubergine}"
    typography: "{typography.product}"
    padding: "1rem"
    rounded: "{rounded.panel}"
  bulb-badge:
    backgroundColor: "{colors.bulb}"
    textColor: "{colors.bulb-foreground}"
    typography: "{typography.label}"
    padding: "0.25rem 0.5rem"
    rounded: "{rounded.panel}"
---

# Design System: Best Shop

## Overview

**Creative North Star: "Lantern Bazaar"**

The storefront is a stall at dusk: goods hung on a board, prices painted on square paper tags, and a warm bulb strand strung above the payment sign. It replaces the waybill / delivery-slip identity wholesale rather than polishing it. The world is built from heavy 2px sign borders, ivory canvas and aubergine ink, one burnt-orange action color, and a single authored moment of bulbs coming on. Metaphor never stands in front of merchandise — the live goods cards are the hero, and the cash-on-delivery board is the one memorable fixture.

The system is flat, squared-off, and legible at a glance under a night-market's warm light. Bungee paints the sign lettering, Karla carries the prose, and Roboto Mono prints every figure that changes with a live read. Product photography stays API-supplied; no local raster ships and no inventory, price, or social proof is invented. Loading, empty, and failed reads are stated honestly in the stall's own language.

**Key Characteristics:**

- Ivory canvas with aubergine sign ink in light mode; deep aubergine night ground and ivory ink in dark mode.
- One action color, #c2410c, reserved for actions and live signals; a lighter #ffb27a only for text on dark surfaces.
- Painted-sign display (Bungee), readable body (Karla), tabular mono figures (Roboto Mono).
- Square paper tags with a 2px border and a single punched hole; round bulbs are the only soft geometry.
- Flat surfaces, no shadows or gradients, one bulb-strand entrance, and themed browser chrome.

**Direction provenance.** Lantern Bazaar was assigned candidate 4 of the grounded list: general-store counter, doorstep photo handoff, post-office money order, open-air night market under string lights, cash drawer/till, classifieds noticeboard, delivery-tracking interface; seed `e7b66a13273a9ecb`. The product surface dealt index 7 as lead (seed `772744a9ff5dd1f2`) and its expression is a pegboard stall display with a hanging price ticket, not a docket. Challengers — drawcord cape, glazier colorfield partition, teletext, arcade pixel glow, luxury fashion flagship, dark developer console — were declined; two raises survive: DRAWCORD STATE VOCABULARY (states are named explicitly, never implied by color alone) and ARCADE PALETTE LAW (the accent belongs only to actions and live signals).

## Colors

The palette is warm paper, aubergine sign paint, a bulb yellow, and one burnt-orange action. Dark mode inverts ground and ink but keeps the bulb, the action, and the bulb's dark foreground fixed.

### Primary

- **Burnt Orange Action** (#c2410c): The binding accent. Filled only for primary actions; also the live-read count, the "No" on the card-needed line, and the "View item" cue. It never becomes a background wash.
- **Night Tint** (#ffb27a): The same hue lifted for text and links on aubergine surfaces in dark mode. Buttons stay #c2410c in both themes.

### Neutral

- **Ivory Canvas** (#fff3dc): Page ground in light mode; also the hole punched through a hanging tag. Warm, opaque, untextured.
- **Aubergine Ink** (#2a1738): Body text in light mode and the solid sign ground for the header, footer, and delivery board; in dark mode those roles swap to ivory.
- **Paper Card** (#fffcf1): Raised sign and tag interior.
- **Stall Surface** (#f5e7c9): Quiet tonal layer for media beds, the auth side board, and loading blocks; **Stall Surface Accent** (#e8d2a5) is the broader secondary layer.
- **Rule** (#bfa984): Hairline dividers inside a sign; **Muted Ink** (#5b4566) and **Subtle Ink** (#6b5674) carry supporting copy.
- **Night Ground** (#171029): Dark-mode page ground; **Night Card** (#251a3b), **Night Surface** (#211638), **Night Rule** (#624d80), and **Night Muted Ink** (#d8cbe6) are the dark counterparts.
- **Bulb Yellow** (#f4b740): Live indicators, in-stock badges, and bulb lights in both themes. Its ink is always **Bulb Foreground** (#171029) — never ivory.

### Named Rules

**The One Accent Rule.** Burnt orange is the only accent. If an element is not an action or a live signal, it does not get the accent.

**The Bulb Contrast Rule.** Bulb yellow always carries aubergine ink (#171029), in light and dark alike. Ivory on bulb is 1.6:1 and is never shipped.

## Typography

**Display Font:** Bungee (with Impact fallback)
**Body Font:** Karla (with system-ui fallback)
**Label / Figure Font:** Roboto Mono (with ui-monospace fallback)

**Character:** Bungee is a wide, uppercase painted-sign face — it reads as lettering struck onto a board, not typeset into a document. Karla is a plain, friendly body face that keeps real copy readable. Roboto Mono prints names, prices, stock, department counts, and field labels so live figures line up in tabular columns.

### Hierarchy

- **Display** (400 weight, `clamp(2.25rem, 5.4vw, 4rem)`, 1.04 line-height, 0.01em tracking): The stall statement and page titles, uppercase and balanced.
- **Headline** (400 weight, 2rem, 1.08 line-height): Section titles such as "Pay at the door" and "Stall notes".
- **Title** (400 weight, `clamp(1.75rem, 2.6vw, 2.5rem)`, 1.05 line-height): The cash-on-delivery board and other sign-face sub-statements.
- **Body** (400 weight, 1rem, 1.75 line-height): Real prose, capped near 65–75ch; never set in mono.
- **Product** (700 weight, 0.875rem, 1.45 line-height): Mono product names in the goods grid.
- **Label** (500 or 700 weight, 0.75rem, 1.35 line-height, 0.08em tracking): Mono field labels, filter buttons, badges, buttons, and footer facts, always uppercase.

**The Live-Figure Rule.** Every number that came from the API — price, stock, counts, the delivery fee — is Roboto Mono with tabular numerals. Explanatory prose is Karla. Mono is data, not a technical costume.

## Layout

A single 80rem container (`max-w-7xl`) holds the whole surface with `1rem` side padding on mobile, `1.5rem` from the small breakpoint, and `2rem` from the large breakpoint. Structure is drawn with full-width 2px rules; section rhythm is `3rem`, growing to `4rem` on large screens.

The hero pairs a live-read masthead (shop name, catalog status, Bungee statement, copy, and actions) with a 20rem delivery board on large screens. A shelf of five real product tags sits under a 2px rule in the same column; the board is a bulb strand above a solid sign and a ruled fee schedule. The goods board carries a wrapping filter row, a live "showing N of M tags" line, and a four-column tag grid at the widest breakpoint that starts at one column on mobile. The closing pay-at-the-door section uses a `1fr / 24rem` split. Product detail uses `1.15fr / 0.85fr`: a pegboard photo bed with a hanging price ticket beside a field list, quantity control, and cash note. Auth screens use a `1.05fr / 1fr` split with a bulb-struck side board.

The sticky header is a solid aubergine sign with a bulb-colored live dot, wraps to two rows on mobile, and reserves `7.5rem` scroll margin on mobile and `5.5rem` from the small breakpoint. A skip link becomes visible on keyboard focus. Every interactive target is at least 44px tall; mobile collapses every grid to one column without hiding goods.

## Elevation & Depth

The stall is flat. Depth comes from surface tone and border weight, never shadow: both shadow tokens resolve to `none`, and no gradients or glass are used. A tag sits on the page because a 2px sign border encloses it; the price ticket overlaps the photo bed by `-mt-8` and is lifted by z-index, not by a cast shadow.

**The Flat Stall Rule.** No ambient shadows, lifted cards, or gradient washes. A zero-offset colored halo is decoration, not depth, and is not used for the bulbs either.

## Shapes

Signs and tags are square: every radius token except `pill` resolves to `2px`, including media, fields, and panels. The reusable surface language is `.sign` (2px border, card interior, foreground ink) and `.sign-solid` (2px border, solid sign ground, sign-foreground ink). A hanging tag adds `.tag::before`: an 8px ivory hole with a 2px sign ring punched at the top center. The only round elements are the bulb lights, the hole ring, and the live-dot indicators. The bulb strand is a 2px rule with five or six bulbs staggered by 110ms.

## Components

### Buttons

- **Shape:** Square (2px), minimum 44–48px tall; uppercase mono label.
- **Primary:** Burnt orange ground (#c2410c), white label, 2px sign border, `0 1.5rem` padding; used for "Shop the live goods" and other real state changes.
- **Secondary:** Card ground with a 2px sign border; hover shifts border and text to the brand tint. A quiet text link is underlined with a 40%-opacity sign rule.
- **Hover / Focus:** Primary darkens to 85% opacity; focus is a 3px ring in the theme's ring color (`#c2410c` light, `#ffb27a` dark) with 3px offset.

### Filters

- **Style:** Square sign buttons, 2px border, mono label plus a live count.
- **State:** Active inverts to the solid sign ground with sign-foreground text; inactive uses card ground with the count in brand orange. `aria-pressed` carries the state so color is not the only signal.

### Cards / Containers

- **Corner Style:** Square (2px), including nested media.
- **Background:** Card interior on the ivory (or night) ground, or the stall surface as a media bed.
- **Border:** 2px sign border; the tag variant adds the punched hole at top center.
- **Shadow Strategy:** None; see Elevation & Depth.
- **Internal Padding:** `1rem` for tags, `1.25rem` for schedules and ledgers.

### Product Card

- **Style:** A hanging paper tag — punched hole, 4/3 API image inside a 1px sign border, category and name in mono, a 2px sign rule above the price and stock line.
- **State:** In-stock quantity is a bulb-yellow badge with aubergine ink; sold out drops the fill and keeps the border and layout. Empty or failed reads use a bordered status block with a retry action, never sample goods.
- **Affordance:** The whole tag links to `/products/:id` and carries a "View item" line with an arrow icon in the brand tint.

### Inputs / Fields

- **Style:** 2px sign border, card ground, mono label above the field; focus ring from the theme's ring token.
- **Error:** A 2px destructive border with a text error block that names the problem.
- **Quantity control:** Square stepper with a bulb-tinted hover state; disabled at the stock ceiling.

### Navigation

- **Style:** Sticky solid-sign header with Bungee wordmark, a bulb-colored live dot, and uppercase mono links; a solid-sign footer repeats the delivery terms.
- **Targets:** Goods, Departments, Delivery, Account/Login, Cart, and theme toggle are at least 44px tall and labeled.

### Delivery Board (signature)

- **Character:** A bulb strand over a solid aubergine sign reading "Cash on delivery", with a square ruled schedule beneath it for the $7.99 standard fee and the "Card needed — No" answer.
- **Motion:** The single authored moment: five bulbs come on with staggered 110ms delays over 720ms, easing from opacity 0.35 / scale 0.85 to full; reduced motion shows them lit immediately.

### Product Docket (signature)

- **Character:** A pegboard-style photo bed in the stall surface with a hanging price ticket punched through its top edge; beside it, a reference strip, a mono field list, quantity control, and a solid cash-on-delivery note.
- **Truth:** Live price and stock only; a failed read says "This tag could not be read" with a retry and no substitute values.

## Do's and Don'ts

### Do:

- **Do** read prices, stock, categories, and product names from the live API and show the honest failure state when a read fails.
- **Do** keep primary buttons #c2410c in both themes; use #ffb27a only for text and links on dark aubergine surfaces.
- **Do** keep bulb-yellow badges on #171029 ink in both themes.
- **Do** draw structure with 2px sign borders, square panels, 2px radii, and punched tags.
- **Do** keep CTAs on working anchors, built routes, honest placeholders, or real state changes, with targets at least 44px tall.
- **Do** theme selection, caret, scrollbars, focus rings, and underline offset from the palette.
- **Do** leave product photography to API-supplied URLs; this system ships no local raster.

### Don't:

- **Don't** return to the waybill: no field numbers, carbon-copy separations, double-rule stamps, or rounded 24px paper panels.
- **Don't** use shadows, gradients, glass, grain, or a zero-offset glow halo; the bulbs animate with opacity and transform only.
- **Don't** put a kicker or eyebrow above a heading; the Bungee sign face carries its own weight.
- **Don't** set body prose in mono or live figures in Karla; each face has one job.
- **Don't** use Impact or Arial Black as the shipped display face — Bungee is self-hosted through `next/font`.
- **Don't** invent inventory, testimonials, delivery dates, or social proof, or present the cart placeholder as checkout.
- **Don't** hide goods behind hover, carousels, or decorative panels; the live tags are the hero.
