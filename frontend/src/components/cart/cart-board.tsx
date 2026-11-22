import { ArrowLeft, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RetryButton } from "@/components/retry-button";
import { getCart } from "@/lib/cart-data";
import type { Cart } from "@/lib/types";

import { CartItemRow } from "./cart-item-row";
import { CartSummary } from "./cart-summary";

const actionClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

export async function CartBoard() {
  let cart: Cart | null;
  try {
    cart = await getCart();
  } catch {
    return <ReadFailure />;
  }
  if (!cart) redirect("/login?next=/cart");

  if (cart.items.length === 0) {
    return (
      <div className="rounded-4xl bg-card p-6 sm:p-8">
        <ShoppingBasket className="size-8 text-brand" aria-hidden="true" />
        <h2 className="mt-5 font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
          Nothing on the board yet
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          Your cart is empty. Pick a live tag from the goods board and it will
          hang here until you are ready to order.
        </p>
        <Link href="/#goods" className={`${actionClass} mt-7`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to live goods
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-label="Items in your cart" className="space-y-3">
        {cart.items.map((item) => (
          <CartItemRow key={item.product._id} item={item} />
        ))}
      </section>
      <CartSummary cart={cart} />
    </div>
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        This cart could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute items or prices have been shown in
        its place.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <RetryButton />
        <Link href="/#goods" className={actionClass}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to live goods
        </Link>
      </div>
    </div>
  );
}
