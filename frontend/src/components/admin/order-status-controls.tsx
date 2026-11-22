"use client";

import { useActionState, useState } from "react";

import { updateAdminOrderStatusAction } from "@/app/actions/admin.actions";
import {
  allowedTransitions,
  type AdminSettableStatus,
} from "@/lib/admin-rules";
import { initialAdminActionState } from "@/lib/admin-state";
import { orderStatusLabel } from "@/lib/order-format";
import { CANCEL_REASON_MAX } from "@/lib/order-state";
import type { OrderStatus } from "@/lib/types";

interface OrderStatusControlsProps {
  orderId: string;
  status: OrderStatus;
}

const statusLabels: Record<AdminSettableStatus, string> = {
  confirmed: "Confirm order",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
};

const forwardClass =
  "inline-flex min-h-11 items-center bg-primary px-5 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60";

const cancelClass =
  "inline-flex min-h-11 items-center border-2 border-destructive px-5 font-mono text-eyebrow font-bold uppercase tracking-label text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60";

const neutralClass =
  "inline-flex min-h-11 items-center border-2 border-sign px-5 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground disabled:cursor-not-allowed disabled:opacity-60";

const textareaClass =
  "w-full rounded-2xl border border-border/60 bg-background px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring/30";

export function OrderStatusControls({ orderId, status }: OrderStatusControlsProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateAdminOrderStatusAction,
    initialAdminActionState,
  );

  const transitions = allowedTransitions(status);
  const forward = transitions.filter((next) => next !== "cancelled");
  const canCancel = transitions.includes("cancelled");
  const terminalCopy =
    status === "cancelled"
      ? "This order is already cancelled."
      : `No further status changes for a ${orderStatusLabel(status).toLowerCase()} order.`;

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
    <div className="mt-5 border-t-2 border-sign pt-4">
      <div className="flex flex-wrap items-start gap-2">
        {forward.map((next) => (
          <form key={next} action={formAction}>
            <input type="hidden" name="orderId" value={orderId} />
            <input type="hidden" name="currentStatus" value={status} />
            <input type="hidden" name="status" value={next} />
            <button type="submit" disabled={pending} className={forwardClass}>
              {pending ? "Updating…" : statusLabels[next]}
            </button>
          </form>
        ))}

        {canCancel ? (
          <form action={formAction} className="w-full sm:w-auto">
            <input type="hidden" name="orderId" value={orderId} />
            <input type="hidden" name="currentStatus" value={status} />
            <input type="hidden" name="status" value="cancelled" />

            {confirming ? (
              <div className="space-y-3 sm:min-w-72">
                <label
                  htmlFor={`admin-cancel-reason-${orderId}`}
                  className="block font-mono text-eyebrow font-bold uppercase tracking-label"
                >
                  Reason <span className="font-medium text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id={`admin-cancel-reason-${orderId}`}
                  name="cancelReason"
                  rows={2}
                  maxLength={CANCEL_REASON_MAX}
                  className={textareaClass}
                  placeholder="Why is this order being cancelled?"
                />
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={pending} className={cancelClass}>
                    {pending ? "Cancelling…" : "Yes, cancel order"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={pending}
                    className={neutralClass}
                  >
                    Keep order
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={cancelClass}
              >
                Cancel order
              </button>
            )}
          </form>
        ) : null}

        {transitions.length === 0 ? (
          <p className="py-2 text-sm leading-6 text-muted-foreground">
            {terminalCopy}
          </p>
        ) : null}
      </div>
      {message}
    </div>
  );
}
