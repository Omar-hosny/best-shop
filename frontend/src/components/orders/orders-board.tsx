import { ArrowLeft, ArrowRight, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RetryButton } from "@/components/retry-button";
import { formatMoney } from "@/lib/format";
import {
  formatOrderDate,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/order-format";
import { type OrdersReadResult, getOrders } from "@/lib/order-data";
import type { Order } from "@/lib/types";

const actionClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

const detailClass =
  "inline-flex min-h-11 items-center gap-3 border-2 border-sign px-5 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground";

export async function OrdersBoard() {
  let result: OrdersReadResult;
  try {
    result = await getOrders();
  } catch {
    return <ReadFailure />;
  }

  if (result.kind === "unauthorized") {
    redirect("/login?next=/orders");
  }

  if (result.orders.length === 0) {
    return (
      <div className="rounded-4xl bg-card p-6 sm:p-8">
        <ShoppingBasket className="size-8 text-brand" aria-hidden="true" />
        <h2 className="mt-5 font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
          No orders on the ledger
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          Once you place a cash-on-delivery order, its live status and frozen
          prices will appear here.
        </p>
        <Link href="/#goods" className={`${actionClass} mt-7`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to live goods
        </Link>
      </div>
    );
  }

  return (
    <section aria-label="Your orders" className="space-y-3">
      {result.orders.map((order) => (
        <OrderRow key={order._id} order={order} />
      ))}
    </section>
  );
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <article className="rounded-4xl bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Order {order._id.slice(-6).toUpperCase()}
          </p>
          <h2 className="mt-1 font-display text-2xl uppercase leading-none tracking-display">
            {order.orderNumber}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Placed {formatOrderDate(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="sm:text-right">
          <span className="inline-flex min-h-8 items-center bg-surface px-3 font-mono text-eyebrow font-bold uppercase tracking-label">
            {orderStatusLabel(order.status)}
          </span>
          <p className="mt-2 font-mono text-sm font-bold tabular-nums">
            {formatMoney(order.total)} {order.currency}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t-2 border-sign pt-4">
        <Link href={`/orders/${order._id}`} className={detailClass}>
          View order
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
          {paymentStatusLabel(order.paymentStatus)} · cash on delivery
        </p>
        {order.cancelReason ? (
          <p className="w-full text-sm leading-6 text-muted-foreground">
            <span className="font-mono text-eyebrow font-bold uppercase tracking-label text-foreground">
              Cancelled:{" "}
            </span>
            {order.cancelReason}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        This order list could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute history has been shown in its
        place.
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
