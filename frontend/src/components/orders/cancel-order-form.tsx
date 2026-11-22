"use client";

import { useActionState, useState } from "react";

import { cancelOrderAction } from "@/app/actions/order.actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { canCancelOrder, orderStatusLabel } from "@/lib/order-format";
import { CANCEL_REASON_MAX, initialOrderActionState } from "@/lib/order-state";
import type { OrderStatus } from "@/lib/types";

interface CancelOrderFormProps {
  orderId: string;
  status: OrderStatus;
}

const outlineButtonClass =
  "inline-flex min-h-12 items-center justify-center border-2 border-sign px-5 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground disabled:cursor-not-allowed disabled:opacity-60";

const textareaClass =
  "w-full rounded-2xl border border-border/60 bg-background px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring/30";

export function CancelOrderForm({ orderId, status }: CancelOrderFormProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    cancelOrderAction,
    initialOrderActionState,
  );

  const cancellable = canCancelOrder(status);
  const reasonId = `cancel-reason-${orderId}`;
  const reasonError = state.fieldErrors.cancelReason;

  const message = state.message ? (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`mt-3 text-sm leading-6 ${
        state.status === "error" ? "text-destructive" : "text-brand"
      }`}
    >
      {state.message}
    </p>
  ) : null;

  return (
    <section
      aria-labelledby={`cancel-order-${orderId}-title`}
      className="rounded-4xl bg-card p-5 sm:p-6"
    >
      <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
        {cancellable ? (confirming ? "Last check" : "Changed your mind?") : "After the door"}
      </p>
      <h2
        id={`cancel-order-${orderId}-title`}
        className="mt-2 font-display text-2xl uppercase leading-none tracking-display"
      >
        Cancellation
      </h2>

      {cancellable ? (
        <>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {confirming
              ? "This cannot be undone. Your items go back to live stock immediately."
              : "You can cancel while the order is pending or confirmed. Stock is returned as soon as the cancellation succeeds."}
          </p>
          {message}

          {/* The form is always mounted so its action reference is present in
              the server-rendered HTML; the confirm step only changes fields. */}
          <form action={formAction} className="mt-5 space-y-4">
            <input type="hidden" name="orderId" value={orderId} />

            {confirming ? (
              <>
                <label
                  htmlFor={reasonId}
                  className="block font-mono text-eyebrow font-bold uppercase tracking-label"
                >
                  Reason <span className="font-medium text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id={reasonId}
                  name="cancelReason"
                  rows={3}
                  maxLength={CANCEL_REASON_MAX}
                  defaultValue={state.cancelReason}
                  aria-invalid={reasonError ? true : undefined}
                  aria-describedby={
                    reasonError ? `${reasonId}-error` : `${reasonId}-hint`
                  }
                  className={textareaClass}
                  placeholder="Tell us briefly why you are cancelling"
                />
                {reasonError ? (
                  <p id={`${reasonId}-error`} className="pl-2 text-xs text-destructive">
                    {reasonError}
                  </p>
                ) : (
                  <p id={`${reasonId}-hint`} className="pl-2 text-xs text-muted-foreground">
                    Up to {CANCEL_REASON_MAX} characters.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <SubmitButton label="Cancel order" pendingLabel="Cancelling…" />
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={pending}
                    className={outlineButtonClass}
                  >
                    Keep order
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={outlineButtonClass}
              >
                Yes, review cancellation
              </button>
            )}
          </form>
        </>
      ) : (
        <>
          {message}
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {status === "cancelled"
              ? "This order is already cancelled."
              : `Cancellation is no longer available for a ${orderStatusLabel(status).toLowerCase()} order.`}
          </p>
        </>
      )}
    </section>
  );
}
