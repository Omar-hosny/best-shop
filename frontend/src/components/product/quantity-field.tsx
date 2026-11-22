"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { addCartItemAction } from "@/app/actions/cart.actions";
import { initialCartActionState } from "@/lib/cart-state";

interface QuantityFieldProps {
  productId: string;
  max: number;
  name: string;
}

const controlClass =
  "inline-flex size-12 shrink-0 items-center justify-center bg-surface text-foreground transition-colors hover:bg-bulb hover:text-bulb-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground/60";

export function QuantityField({ productId, max, name }: QuantityFieldProps) {
  const [quantity, setQuantity] = useState(max > 0 ? 1 : 0);
  const [state, formAction, pending] = useActionState(
    addCartItemAction,
    initialCartActionState,
  );

  const cap = Math.min(max, 99);
  const soldOut = cap <= 0;
  const current = Math.min(quantity, cap);

  return (
    <div className="rounded-4xl bg-card p-5">
      <form action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={current} />

        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
              How many
            </p>
            <div
              role="group"
              aria-label={`Quantity of ${name}`}
              className="mt-2 inline-flex items-center"
            >
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={soldOut || current <= 1}
                aria-label="Decrease quantity"
                className={controlClass}
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <output
                aria-live="polite"
                className="flex h-12 w-12 items-center justify-center bg-surface-accent text-center font-mono text-product font-bold tabular-nums"
              >
                {current}
              </output>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(cap, value + 1))}
                disabled={soldOut || current >= cap}
                aria-label="Increase quantity"
                className={controlClass}
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            {soldOut ? "None on hand" : `Max ${cap}`}
          </p>
        </div>

        <div className="mt-6 pt-5">
          <button
            type="submit"
            disabled={soldOut || pending}
            className="inline-flex min-h-12 w-full items-center justify-center bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary"
          >
            {soldOut
              ? "Sold out"
              : pending
                ? "Adding to cart…"
                : `Add ${current} to cart`}
          </button>

          {state.status === "error" && state.message ? (
            <p role="alert" className="mt-3 text-sm leading-6 text-destructive">
              {state.message}
            </p>
          ) : null}
          {state.status === "ok" ? (
            <p role="status" className="mt-3 text-sm leading-6 text-muted-foreground">
              Added to your cart.{" "}
              <Link href="/cart" className="font-bold text-brand underline underline-offset-4">
                View cart
              </Link>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
