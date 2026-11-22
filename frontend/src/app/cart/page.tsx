import type { Metadata } from "next";
import { Suspense } from "react";

import { CartBoard } from "@/components/cart/cart-board";
import { CartSkeleton } from "@/components/cart/cart-skeleton";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Live cart items and running totals for the Best Shop stall.",
};

export default function CartPage() {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Your stall board
              </p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
                The cart
              </h1>
            </div>
            <p className="inline-flex items-center gap-2 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full border border-sign bg-bulb"
              />
              Live read
            </p>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Prices and stock are read fresh from the catalog. The delivery fee
            is added when the order is placed, and payment is collected at the
            door.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<CartSkeleton />}>
            <CartBoard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
