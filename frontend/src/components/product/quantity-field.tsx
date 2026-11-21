"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface QuantityFieldProps {
  max: number;
  name: string;
}

const controlClass =
  "inline-flex size-12 shrink-0 items-center justify-center bg-surface text-foreground transition-colors hover:bg-bulb hover:text-bulb-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground/60";

export function QuantityField({ max, name }: QuantityFieldProps) {
  const [quantity, setQuantity] = useState(max > 0 ? 1 : 0);
  const soldOut = max <= 0;

  return (
    <div className="rounded-4xl bg-card p-5">
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
              disabled={soldOut || quantity <= 1}
              aria-label="Decrease quantity"
              className={controlClass}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <output
              aria-live="polite"
              className="flex h-12 w-12 items-center justify-center bg-surface-accent text-center font-mono text-product font-bold tabular-nums"
            >
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(max, value + 1))}
              disabled={soldOut || quantity >= max}
              aria-label="Increase quantity"
              className={controlClass}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
          {soldOut ? "None on hand" : `Max ${max}`}
        </p>
      </div>

      <div className="mt-6 pt-5">
        <button
          type="button"
          disabled
          className="inline-flex min-h-12 w-full items-center justify-center bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground disabled:cursor-not-allowed disabled:saturate-50"
        >
          {soldOut ? "Sold out" : `Add ${quantity} to cart — cart opens soon`}
        </button>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The cart is not open yet. Nothing can be added or charged.
        </p>
      </div>
    </div>
  );
}
