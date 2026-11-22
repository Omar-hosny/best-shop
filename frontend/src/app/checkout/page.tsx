import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutBoard } from "@/components/checkout/checkout-board";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place a cash-on-delivery order from your live Best Shop cart.",
};

export default function CheckoutPage() {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Last step
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
            Checkout
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Add a delivery address and place the order. The API snapshots your
            current prices, calculates delivery, and clears the cart only when
            the whole order succeeds.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<CheckoutSkeleton />}>
            <CheckoutBoard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
