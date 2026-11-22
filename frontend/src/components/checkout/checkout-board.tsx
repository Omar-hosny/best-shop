import { ArrowLeft, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RetryButton } from "@/components/retry-button";
import { getCart } from "@/lib/cart-data";
import {
  emptyCheckoutValues,
  type CheckoutValues,
} from "@/lib/checkout-rules";
import { getCurrentUser } from "@/lib/session";
import type { Cart } from "@/lib/types";

import { CheckoutForm } from "./checkout-form";
import { CheckoutSummary } from "./checkout-summary";

const actionClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

export async function CheckoutBoard() {
  let cart: Cart | null;
  try {
    cart = await getCart();
  } catch {
    return <ReadFailure />;
  }
  if (!cart) redirect("/login?next=/checkout");

  if (cart.items.length === 0) {
    return (
      <div className="rounded-4xl bg-card p-6 sm:p-8">
        <ShoppingBasket className="size-8 text-brand" aria-hidden="true" />
        <h2 className="mt-5 font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
          Nothing to check out
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          Your cart is empty. Pick a live tag from the goods board first, then
          come back to place a cash-on-delivery order.
        </p>
        <Link href="/#goods" className={`${actionClass} mt-7`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to live goods
        </Link>
      </div>
    );
  }

  let defaultValues: CheckoutValues = emptyCheckoutValues;
  try {
    const user = await getCurrentUser();
    if (user) {
      defaultValues = {
        ...emptyCheckoutValues,
        "shippingAddress.fullName": user.name,
      };
    }
  } catch {
    // The address is still fully editable; a failed session read must not hide
    // an otherwise valid checkout.
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section
        aria-labelledby="checkout-details-title"
        className="rounded-4xl bg-card p-5 sm:p-7"
      >
        <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
          Delivery slip
        </p>
        <h2
          id="checkout-details-title"
          className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display"
        >
          Where should it go?
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          We use this address only for this order. Items, prices, and totals are
          taken from your live cart by the API.
        </p>
        <div className="mt-8">
          <CheckoutForm defaultValues={defaultValues} />
        </div>
      </section>

      <CheckoutSummary cart={cart} />
    </div>
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        This checkout could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute cart or prices have been shown in
        its place.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <RetryButton />
        <Link href="/cart" className={actionClass}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to cart
        </Link>
      </div>
    </div>
  );
}
