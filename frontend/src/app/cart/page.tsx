import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cart",
  description: "The Best Shop cart page is not built yet.",
};

export default function CartPage() {
  return (
    <main id="main" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl rounded-[24px] border border-border bg-card p-6 sm:p-8">
          <h1 className="font-display text-section uppercase tracking-display">
            Cart
          </h1>
          <p className="mt-4 max-w-xl font-mono text-sm leading-6 text-muted-foreground">
            The cart page is not built yet. No items are shown here, and nothing
            has been added or changed.
          </p>
          <div className="mt-8">
            <Link
              href="/#goods"
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to live goods
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
