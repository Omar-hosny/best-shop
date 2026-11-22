import Image from "next/image";

import { categoryName, formatMoney } from "@/lib/format";
import type { Cart } from "@/lib/types";

export function CheckoutSummary({ cart }: { cart: Cart }) {
  return (
    <aside
      aria-labelledby="checkout-summary-title"
      className="rounded-4xl bg-card p-5 sm:p-6 lg:sticky lg:top-24"
    >
      <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
        Order docket
      </p>
      <h2
        id="checkout-summary-title"
        className="mt-2 font-display text-2xl uppercase leading-none tracking-display"
      >
        What you are ordering
      </h2>

      <ul className="mt-6 space-y-4">
        {cart.items.map((item) => (
          <li
            key={item.product._id}
            className="flex gap-3 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
          >
            <span className="inline-flex size-16 shrink-0 items-center justify-center bg-surface">
              {item.product.images?.length ? (
                <Image
                  src={item.product.images[0]}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 object-cover"
                />
              ) : (
                <span className="sr-only">No photograph filed</span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                {categoryName(item.product.category ?? "Selected")}
              </span>
              <span className="mt-1 block font-mono text-sm font-bold leading-snug">
                {item.product.name}
              </span>
              <span className="mt-1 block font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                {item.quantity} × {formatMoney(item.product.price)}
              </span>
            </span>
            <span className="font-mono text-sm font-bold tabular-nums">
              {formatMoney(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 border-t-2 border-sign pt-4 font-mono text-eyebrow uppercase tracking-label">
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-muted-foreground">Items</dt>
          <dd className="font-bold tabular-nums">{cart.totalItems}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-bold tabular-nums">{formatMoney(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="text-right font-bold">Calculated on placement</dd>
        </div>
      </dl>

      <p className="mt-5 rounded-2xl bg-surface p-4 text-sm leading-7 text-muted-foreground">
        Prices are read live now and frozen when the order is placed. The final
        total, including delivery, appears on your confirmation.
      </p>
    </aside>
  );
}
