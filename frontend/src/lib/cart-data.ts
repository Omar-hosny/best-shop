import "server-only";

import { ApiError, apiFetch } from "./api";
import { getAuthCookieHeader } from "./session";
import type { Cart } from "./types";

// The cart is per-user, request-time data: never add "use cache" here. A
// missing or expired cookie is treated like a signed-out visitor; other API
// failures are thrown so the page can show its honest read-failure panel.
export const getCart = async (): Promise<Cart | null> => {
  const cookie = await getAuthCookieHeader();
  if (!cookie) return null;

  try {
    const { data } = await apiFetch<Cart>("/cart", { cookie });
    return data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      return null;
    }
    throw error;
  }
};
