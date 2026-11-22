import "server-only";

import { cache } from "react";

import { ApiError, apiFetch } from "./api";
import { getAuthCookieHeader } from "./session";
import type { Order } from "./types";

export type OrderReadResult =
  | { kind: "ok"; order: Order }
  | { kind: "unauthorized" }
  | { kind: "missing" };

// Order reads are per-user and request-time: never add "use cache" here. A
// missing cookie or expired session is handled by the page so it can redirect
// to login; a missing/foreign order is kept distinct so it can render as 404.
export const getOrder = cache(async (id: string): Promise<OrderReadResult> => {
  const cookie = await getAuthCookieHeader();
  if (!cookie) return { kind: "unauthorized" };

  try {
    const { data } = await apiFetch<Order>(
      `/orders/${encodeURIComponent(id)}`,
      { cookie },
    );
    return { kind: "ok", order: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { kind: "unauthorized" };
    }
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 404 || error.status === 422)
    ) {
      return { kind: "missing" };
    }
    throw error;
  }
});
