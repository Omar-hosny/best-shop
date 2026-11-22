import type { AdminOrder } from "./types";

// The admin list populates the customer, but a deleted account leaves `null`.
// Customer-scoped routes return a bare id. Never show an id as a person.
export function adminCustomerName(order: AdminOrder): string {
  if (!order.user || typeof order.user === "string") {
    return "Customer unavailable";
  }
  return order.user.name || order.user.email || "Customer unavailable";
}

export function adminCustomerEmail(order: AdminOrder): string | null {
  if (!order.user || typeof order.user === "string") return null;
  return order.user.email || null;
}
