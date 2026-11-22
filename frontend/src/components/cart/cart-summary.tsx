import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { formatMoney } from "@/lib/format";
import type { Cart } from "@/lib/types";

import { CartClearButton } from "./cart-clear-button";

export function CartSummary({ cart }: { cart: Cart }) {
  return (
    <aside aria-labelledby="summary-title" className="rounded-4xl bg-card p-5 sm:p-6">
      <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
        Running board
      </p>
      <h2
        id="summary-title"
        className="mt-2 font-display text-2xl uppercase leading-none tracking-display"
      >
        Your totals
      </h2>

      <dl className="mt-6 font-mono text-eyebrow uppercase tracking-label">
        <div className="flex justify-between gap-4 border-b-2 border-sign py-3">
          <dt className="text-muted-foreground">Items</dt>
          <dd className="font-bold tabular-nums">{cart.totalItems}</dd>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-bold tabular-nums">{formatMoney(cart.subtotal)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        A standard delivery fee is calculated when the order is placed. Payment
        is collected at the door — no card is needed.
      </p>

      <Link
        href="/checkout"
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
      >
        Continue to checkout
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>

      <div className="mt-4 border-t-2 border-sign pt-4">
        <CartClearButton />
      </div>
    </aside>
  );
}
