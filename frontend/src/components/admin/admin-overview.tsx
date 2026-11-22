import { ArrowRight, ClipboardList, PackageSearch } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RetryButton } from "@/components/retry-button";
import { type AdminReadResult, type AdminOverviewData, getAdminOverview } from "@/lib/admin-data";
import { adminCustomerName } from "@/lib/admin-format";
import { ORDER_STATUSES } from "@/lib/admin-rules";
import { formatMoney } from "@/lib/format";
import { formatOrderDate, orderStatusLabel } from "@/lib/order-format";
import type { AdminOrder, OrderStatus } from "@/lib/types";

const LOW_STOCK_MAX = 10;
const OPEN_STATUSES: readonly OrderStatus[] = ["pending", "confirmed", "shipped"];

const linkClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

const outlineLinkClass =
  "inline-flex min-h-12 items-center gap-3 border-2 border-sign px-6 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground";

export async function AdminOverview() {
  let result: AdminReadResult<AdminOverviewData>;
  try {
    result = await getAdminOverview();
  } catch {
    return <ReadFailure />;
  }

  // Control-flow helpers throw, so these checks stay outside the read try/catch.
  if (result.kind === "unauthorized") {
    redirect("/login?next=/admin");
  }
  if (result.kind === "forbidden") {
    redirect("/account");
  }

  const { orders, products } = result.data;

  const counts = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>;
  for (const order of orders) {
    if (order.status in counts) counts[order.status] += 1;
  }

  const openOrders = orders.filter((order) =>
    OPEN_STATUSES.includes(order.status),
  );
  const openValue = openOrders.reduce((sum, order) => sum + order.total, 0);
  const lowStock = products
    .filter((product) => product.quantity <= LOW_STOCK_MAX)
    .sort((a, b) => a.quantity - b.quantity);
  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <section aria-label="Order status counts">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ORDER_STATUSES.map((status) => (
            <div key={status} className="rounded-4xl bg-card p-5">
              <p className="font-mono text-eyebrow font-bold uppercase tracking-label text-muted-foreground">
                {orderStatusLabel(status)}
              </p>
              <p className="mt-3 font-display text-4xl leading-none tracking-display tabular-nums">
                {counts[status]}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
          {formatMoney(openValue)} across {openOrders.length} open order
          {openOrders.length === 1 ? "" : "s"} · no revenue is claimed until
          delivery
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="recent-orders-title" className="rounded-4xl bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-brand" aria-hidden="true" />
            <h2
              id="recent-orders-title"
              className="font-display text-2xl uppercase leading-none tracking-display"
            >
              Recent orders
            </h2>
          </div>

          {recent.length === 0 ? (
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              No orders have been placed yet. The queue will fill as shoppers
              check out.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-border/60">
              {recent.map((order) => (
                <RecentOrderRow key={order._id} order={order} />
              ))}
            </ul>
          )}

          <Link href="/admin/orders" className={`${outlineLinkClass} mt-6`}>
            Open order queue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>

        <section aria-labelledby="stock-watch-title" className="rounded-4xl bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <PackageSearch className="size-5 text-brand" aria-hidden="true" />
            <h2
              id="stock-watch-title"
              className="font-display text-2xl uppercase leading-none tracking-display"
            >
              Stock watch
            </h2>
          </div>
          <p className="mt-2 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            {LOW_STOCK_MAX} units or fewer · live catalog read
          </p>

          {lowStock.length === 0 ? (
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              No products are at or below the watch threshold.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-border/60">
              {lowStock.slice(0, 6).map((product) => (
                <li
                  key={product._id}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-3"
                >
                  <Link
                    href={`/products/${product._id}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium transition-colors hover:text-brand"
                  >
                    {product.name}
                  </Link>
                  <span
                    className={`font-mono text-eyebrow font-bold uppercase tracking-label ${
                      product.quantity === 0 ? "text-destructive" : "text-brand"
                    }`}
                  >
                    {product.quantity === 0 ? "Out of stock" : `${product.quantity} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {lowStock.length > 6 ? (
            <p className="mt-4 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
              Showing 6 of {lowStock.length} products at or below the threshold.
            </p>
          ) : null}
        </section>
      </div>

      <div className="flex flex-wrap gap-3 border-t-2 border-sign pt-6">
        <Link href="/admin/orders?status=pending" className={linkClass}>
          Pending orders
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/admin/orders" className={outlineLinkClass}>
          All orders
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/admin/products" className={outlineLinkClass}>
          Manage products
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/admin/categories" className={outlineLinkClass}>
          Manage categories
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function RecentOrderRow({ order }: { order: AdminOrder }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold">{order.orderNumber}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {adminCustomerName(order)} · {formatOrderDate(order.createdAt)} ·{" "}
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-eyebrow font-bold uppercase tracking-label">
            {orderStatusLabel(order.status)}
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            {formatMoney(order.total)} {order.currency}
          </p>
        </div>
      </div>
    </li>
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        This overview could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute counts or stock levels have been
        shown in its place.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <RetryButton />
        <Link href="/admin/orders" className={outlineLinkClass}>
          Order queue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
