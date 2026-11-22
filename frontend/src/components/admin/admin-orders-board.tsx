import { ArrowRight, ClipboardList } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { RetryButton } from "@/components/retry-button";
import { type AdminReadResult, getAdminOrders } from "@/lib/admin-data";
import { adminCustomerEmail, adminCustomerName } from "@/lib/admin-format";
import { ORDER_STATUSES } from "@/lib/admin-rules";
import { formatMoney } from "@/lib/format";
import {
  formatOrderDate,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/order-format";
import type { AdminOrder, OrderStatus } from "@/lib/types";

interface AdminOrdersBoardProps {
  status?: OrderStatus;
  invalidFilter?: boolean;
}

const filters: ReadonlyArray<{ label: string; value?: OrderStatus }> = [
  { label: "All" },
  ...ORDER_STATUSES.map((status) => ({
    label: orderStatusLabel(status),
    value: status,
  })),
];

const linkClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

export async function AdminOrdersBoard({
  status,
  invalidFilter = false,
}: AdminOrdersBoardProps) {
  let result: AdminReadResult<AdminOrder[]>;
  try {
    result = await getAdminOrders(status);
  } catch {
    return <ReadFailure />;
  }

  // Control-flow helpers throw, so these checks stay outside the read try/catch.
  if (result.kind === "unauthorized") {
    redirect("/login?next=/admin/orders");
  }
  if (result.kind === "forbidden") {
    redirect("/account");
  }

  const orders = result.data;

  return (
    <div className="space-y-5">
      {invalidFilter ? (
        <p
          role="status"
          className="rounded-2xl border-l-4 border-bulb bg-card px-4 py-3 text-sm leading-6 text-muted-foreground"
        >
          That status filter is not recognised. Showing all orders.
        </p>
      ) : null}

      <nav
        aria-label="Filter orders by status"
        className="flex flex-wrap gap-2"
      >
        {filters.map((filter) => {
          const active = filter.value === status;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/orders?status=${filter.value}` : "/admin/orders"}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center border-2 px-4 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-sign hover:bg-sign hover:text-sign-foreground"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <EmptyQueue status={status} />
      ) : (
        <section aria-label="Admin orders" className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </section>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: AdminOrder }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const email = adminCustomerEmail(order);

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

      <dl className="mt-5 grid gap-4 border-t-2 border-sign pt-4 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Customer
          </dt>
          <dd className="mt-1 text-sm font-medium">{adminCustomerName(order)}</dd>
          {email ? (
            <dd className="mt-0.5 truncate text-xs text-muted-foreground">
              {email}
            </dd>
          ) : null}
        </div>
        <div>
          <dt className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Payment
          </dt>
          <dd className="mt-1 text-sm font-medium">
            {paymentStatusLabel(order.paymentStatus)} · cash on delivery
          </dd>
        </div>
      </dl>

      {order.cancelReason ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          <span className="font-mono text-eyebrow font-bold uppercase tracking-label text-foreground">
            Cancellation reason:{" "}
          </span>
          {order.cancelReason}
        </p>
      ) : null}

      <OrderStatusControls orderId={order._id} status={order.status} />
    </article>
  );
}

function EmptyQueue({ status }: { status?: OrderStatus }) {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <ClipboardList className="size-8 text-brand" aria-hidden="true" />
      <h2 className="mt-5 font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        No orders in this queue
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        {status
          ? `No orders currently have the status ${orderStatusLabel(status).toLowerCase()}.`
          : "No orders have been placed yet. Live orders appear here as shoppers check out."}
      </p>
      <Link href="/admin/orders" className={`${linkClass} mt-7`}>
        View all orders
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        This order queue could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute orders have been shown in its
        place.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <RetryButton />
        <Link href="/admin" className={linkClass}>
          Back to overview
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
