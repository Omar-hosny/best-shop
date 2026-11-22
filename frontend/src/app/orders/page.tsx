import type { Metadata } from "next";
import { Suspense } from "react";

import { OrdersBoard } from "@/components/orders/orders-board";
import { OrdersSkeleton } from "@/components/orders/orders-skeleton";

export const metadata: Metadata = {
  title: "Your orders",
  description: "Live cash-on-delivery orders placed from your Best Shop cart.",
};

export default function OrdersPage() {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Your account ledger
              </p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
                The orders
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
            Every order here is read fresh from the API. Open one to see the
            frozen prices, delivery address, and its current status.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<OrdersSkeleton />}>
            <OrdersBoard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
