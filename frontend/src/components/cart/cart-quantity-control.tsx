"use client";

import { Minus, Plus } from "lucide-react";
import { useActionState, useState } from "react";

import { updateCartItemAction } from "@/app/actions/cart.actions";
import { initialCartActionState } from "@/lib/cart-state";

interface CartQuantityControlProps {
  productId: string;
  name: string;
  quantity: number;
  stock: number;
}

const controlClass =
  "inline-flex size-11 shrink-0 items-center justify-center bg-surface text-foreground transition-colors hover:bg-bulb hover:text-bulb-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground/60";

const setButtonClass =
  "inline-flex min-h-11 items-center justify-center bg-sign px-5 font-mono text-eyebrow font-bold uppercase tracking-label text-sign-foreground transition-colors hover:bg-sign/85 disabled:cursor-not-allowed disabled:opacity-60";

export function CartQuantityControl({
  productId,
  name,
  quantity,
  stock,
}: CartQuantityControlProps) {
  const [value, setValue] = useState(quantity);
  const [state, formAction, pending] = useActionState(
    updateCartItemAction,
    initialCartActionState,
  );

  const cap = Math.min(stock, 99);
  const current = Math.min(value, cap);
  const changed = current !== quantity;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={current} />

      <div
        role="group"
        aria-label={`Quantity of ${name}`}
        className="inline-flex items-center"
      >
        <button
          type="button"
          onClick={() => setValue((previous) => Math.max(1, previous - 1))}
          disabled={cap <= 0 || current <= 1}
          aria-label={`Decrease quantity of ${name}`}
          className={controlClass}
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <output
          aria-live="polite"
          className="flex h-11 w-11 items-center justify-center bg-surface-accent text-center font-mono text-product font-bold tabular-nums"
        >
          {current}
        </output>
        <button
          type="button"
          onClick={() => setValue((previous) => Math.min(cap, previous + 1))}
          disabled={cap <= 0 || current >= cap}
          aria-label={`Increase quantity of ${name}`}
          className={controlClass}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <button
        type="submit"
        disabled={pending || !changed || cap <= 0}
        className={setButtonClass}
      >
        {pending ? "Saving…" : "Set"}
      </button>

      {state.status === "error" && state.message ? (
        <p role="alert" className="w-full text-sm leading-6 text-destructive">
          {state.message}
        </p>
      ) : null}
      {state.status === "ok" && state.message ? (
        <p role="status" className="w-full text-sm leading-6 text-muted-foreground">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
