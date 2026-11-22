import { ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RetryButton } from "@/components/retry-button";
import { formatMoney } from "@/lib/format";
import {
  formatOrderDate,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/order-format";
import { type OrderReadResult, getOrder } from "@/lib/order-data";

import { CancelOrderForm } from "./cancel-order-form";

const actionClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

export async function OrderDocket({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let result: OrderReadResult;
  try {
    result = await getOrder(id);
  } catch {
    return <ReadFailure />;
  }

  // Control-flow helpers throw; keep them outside the read try/catch.
  if (result.kind === "unauthorized") {
    redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
  }
  if (result.kind === "missing") notFound();

  const { order } = result;
  const address = order.shippingAddress;

  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="border-b-2 border-sign bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/orders"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All orders
          </Link>
          <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
          <Link
            href="/#goods"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground transition-colors hover:text-brand"
          >
            Goods board
          </Link>
          <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Order {order._id.slice(-6).toUpperCase()}
          </p>
          <p className="ml-auto inline-flex items-center gap-2 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full border border-sign bg-bulb"
            />
            Live read
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="rounded-4xl bg-bulb p-6 text-bulb-foreground sm:p-8">
          <div className="flex flex-wrap items-center gap-5">
            <span className="inline-flex size-12 shrink-0 items-center justify-center bg-sign text-sign-foreground">
              <Check className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-eyebrow font-bold uppercase tracking-label opacity-80">
                Order placed
              </p>
              <h1 className="mt-1 font-display text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-none tracking-display">
                {order.orderNumber}
              </h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 opacity-90">
            Keep this number handy. Cash is collected when the order arrives;
            no payment has been taken online.
          </p>
          <dl className="mt-8 grid gap-6 border-t border-bulb-foreground/30 pt-6 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-eyebrow font-medium uppercase tracking-label opacity-80">
                Order status
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold uppercase tracking-label">
                {orderStatusLabel(order.status)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-eyebrow font-medium uppercase tracking-label opacity-80">
                Payment
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold uppercase tracking-label">
                {paymentStatusLabel(order.paymentStatus)} · cash on delivery
              </dd>
            </div>
          </dl>
          {order.cancelReason ? (
            <p className="mt-6 border-t border-bulb-foreground/30 pt-5 text-sm leading-7">
              <span className="font-mono text-eyebrow font-bold uppercase tracking-label opacity-80">
                Cancellation reason:{" "}
              </span>
              {order.cancelReason}
            </p>
          ) : null}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-start">
          <section
            aria-labelledby="order-items-title"
            className="rounded-4xl bg-card p-5 sm:p-7"
          >
            <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
              Frozen at placement
            </p>
            <h2
              id="order-items-title"
              className="mt-2 font-display text-2xl uppercase leading-none tracking-display"
            >
              Your items
            </h2>

            <ul className="mt-6 space-y-4">
              {order.items.map((item) => (
                <li
                  key={item.product}
                  className="flex gap-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="inline-flex size-20 shrink-0 items-center justify-center bg-surface">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={80}
                        height={80}
                        className="size-20 object-cover"
                      />
                    ) : (
                      <span className="sr-only">No photograph filed</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-sm font-bold leading-snug">
                      {item.name}
                    </span>
                    <span className="mt-1 block font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                      {item.quantity} × {formatMoney(item.price)}
                    </span>
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {formatMoney(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <aside className="space-y-6">
            <section
              aria-labelledby="order-address-title"
              className="rounded-4xl bg-card p-5 sm:p-6"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
                Delivery slip
              </p>
              <h2
                id="order-address-title"
                className="mt-2 font-display text-2xl uppercase leading-none tracking-display"
              >
                Shipping to
              </h2>
              <address className="mt-5 space-y-1 text-sm not-italic leading-7 text-muted-foreground">
                <p className="font-mono font-bold text-foreground">{address.fullName}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}
                  {address.postalCode ? ` ${address.postalCode}` : ""}
                </p>
                <p>{address.country}</p>
                <p>{address.phone}</p>
              </address>
              {order.note ? (
                <p className="mt-5 border-t-2 border-sign pt-4 text-sm leading-7 text-muted-foreground">
                  <span className="font-mono text-eyebrow font-bold uppercase tracking-label text-foreground">
                    Note:{" "}
                  </span>
                  {order.note}
                </p>
              ) : null}
            </section>

            <section
              aria-labelledby="order-totals-title"
              className="rounded-4xl bg-card p-5 sm:p-6"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
                Final bill
              </p>
              <h2
                id="order-totals-title"
                className="mt-2 font-display text-2xl uppercase leading-none tracking-display"
              >
                Totals
              </h2>
              <dl className="mt-5 font-mono text-eyebrow uppercase tracking-label">
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-bold tabular-nums">
                    {formatMoney(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-bold tabular-nums">
                    {formatMoney(order.shippingFee)}
                  </dd>
                </div>
                <div className="mt-2 flex justify-between gap-4 border-t-2 border-sign py-3">
                  <dt className="font-bold">Total due</dt>
                  <dd className="font-display text-xl leading-none tracking-display tabular-nums">
                    {formatMoney(order.total)} {order.currency}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Placed {formatOrderDate(order.createdAt)}
              </p>
            </section>

            <CancelOrderForm orderId={order._id} status={order.status} />

            <Link href="/#goods" className={actionClass}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to goods
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ReadFailure() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-8">
      <div className="rounded-4xl bg-card p-6 sm:p-8">
        <h1 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] uppercase leading-tight tracking-display">
          This order could not be read
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          The API did not answer. Your order may still exist — retry the live
          read instead of placing a second one.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <RetryButton />
          <Link href="/orders" className={actionClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to orders
          </Link>
        </div>
      </div>
    </main>
  );
}
