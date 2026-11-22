"use client";

import { useActionState, useState } from "react";

import { clearCartAction } from "@/app/actions/cart.actions";
import { initialCartActionState } from "@/lib/cart-state";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center border-2 border-sign px-4 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground disabled:cursor-not-allowed disabled:opacity-60";

export function CartClearButton() {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    clearCartAction,
    initialCartActionState,
  );

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={buttonClass}>
        Clear cart
      </button>
    );
  }

  return (
    <form action={formAction}>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Clearing…" : "Yes, clear cart"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className={buttonClass}
        >
          Keep items
        </button>
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-2 text-sm leading-6 text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
