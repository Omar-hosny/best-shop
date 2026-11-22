import type { OrderStatus } from "./types";

export const ADMIN_SETTABLE_STATUSES = [
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type AdminSettableStatus = (typeof ADMIN_SETTABLE_STATUSES)[number];

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_TRANSITIONS: Record<OrderStatus, readonly AdminSettableStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus)
  );
}

export function isAdminSettableStatus(
  value: unknown,
): value is AdminSettableStatus {
  return (
    typeof value === "string" &&
    ADMIN_SETTABLE_STATUSES.includes(value as AdminSettableStatus)
  );
}

export function allowedTransitions(
  status: OrderStatus,
): readonly AdminSettableStatus[] {
  return STATUS_TRANSITIONS[status] ?? [];
}

export function isAllowedTransition(
  current: OrderStatus,
  next: unknown,
): next is AdminSettableStatus {
  return isAdminSettableStatus(next) && allowedTransitions(current).includes(next);
}
