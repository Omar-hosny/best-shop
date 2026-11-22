"use client";

import { useActionState } from "react";

import { removeCartItemAction } from "@/app/actions/cart.actions";
import { initialCartActionState } from "@/lib/cart-state";

interface CartRemoveButtonProps {
  productId: string;
  name: string;
}

export function CartRemoveButton({ productId, name }: CartRemoveButtonProps) {
  const [state, formAction, pending] = useActionState(
    removeCartItemAction,
    initialCartActionState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={`Remove ${name} from cart`}
        className="inline-flex min-h-11 items-center justify-center border-2 border-sign px-4 font-mono text-eyebrow font-bold uppercase tracking-label text-destructive transition-colors hover:bg-destructive hover:text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-2 text-sm leading-6 text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
