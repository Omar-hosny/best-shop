import type { Order, OrderStatus } from "./types";

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const orderStatusLabel = (status: OrderStatus | string) =>
  titleCase(status);

export const paymentStatusLabel = (status: Order["paymentStatus"] | string) =>
  titleCase(status);

// Must match CANCELLABLE_STATUSES in controllers/order.controller.js.
export const canCancelOrder = (status: OrderStatus | string) =>
  status === "pending" || status === "confirmed";

export function formatOrderDate(value?: string): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
