"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import type { CartActionState } from "@/lib/cart-state";
import { getAuthCookieHeader } from "@/lib/session";
import type { Cart } from "@/lib/types";

// Mirrors validators/cart.validator.js. The API still owns stock checks and
// ownership; these checks only keep malformed input off the wire.
const MONGO_ID = /^[0-9a-f]{24}$/i;
const MAX_ITEM_QUANTITY = 99;

const ok = (message: string): CartActionState => ({ status: "ok", message });
const fail = (message: string): CartActionState => ({ status: "error", message });

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseQuantity(raw: string, optional = false): number | null {
  if (optional && raw === "") return 1;
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return value >= 1 && value <= MAX_ITEM_QUANTITY ? value : null;
}

// Authenticate inside the action, not just in the page that rendered the form.
// A stale/expired token is caught from the API response below; a missing cookie
// redirects here. Redirects must stay outside try/catch so NEXT_REDIRECT is
// never swallowed.
async function requireAuthCookie(nextPath: string): Promise<string> {
  const cookie = await getAuthCookieHeader();
  if (!cookie) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return cookie;
}

function toErrorState(error: unknown): CartActionState {
  if (error instanceof ApiError) {
    return fail(error.message || "The stall did not accept that change");
  }
  return fail("Something went wrong. Please try again.");
}

// Returns an error state for anything the caller should render, or null on
// success after revalidating the cart route.
async function mutateCart(
  cookie: string,
  nextPath: string,
  request: () => Promise<unknown>,
): Promise<CartActionState | null> {
  let unauthorized = false;
  try {
    await request();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      return toErrorState(error);
    }
  }

  if (unauthorized) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  revalidatePath("/cart");
  return null;
}

export async function addCartItemAction(
  _previous: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readField(formData, "productId");
  const nextPath = `/products/${encodeURIComponent(productId)}`;
  const cookie = await requireAuthCookie(nextPath);

  if (!MONGO_ID.test(productId)) return fail("That item reference is not valid");
  const quantity = parseQuantity(readField(formData, "quantity"), true);
  if (quantity === null) {
    return fail(`Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}`);
  }

  const failure = await mutateCart(cookie, nextPath, () =>
    apiFetch<Cart>("/cart/items", {
      method: "POST",
      cookie,
      body: { productId, quantity },
    }),
  );
  return failure ?? ok("Added to cart");
}

export async function updateCartItemAction(
  _previous: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readField(formData, "productId");
  const cookie = await requireAuthCookie("/cart");

  if (!MONGO_ID.test(productId)) return fail("That item reference is not valid");
  const quantity = parseQuantity(readField(formData, "quantity"));
  if (quantity === null) {
    return fail(`Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}`);
  }

  const failure = await mutateCart(cookie, "/cart", () =>
    apiFetch<Cart>(`/cart/items/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      cookie,
      body: { quantity },
    }),
  );
  return failure ?? ok("Quantity updated");
}

export async function removeCartItemAction(
  _previous: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = readField(formData, "productId");
  const cookie = await requireAuthCookie("/cart");

  if (!MONGO_ID.test(productId)) return fail("That item reference is not valid");

  const failure = await mutateCart(cookie, "/cart", () =>
    apiFetch<Cart>(`/cart/items/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      cookie,
    }),
  );
  return failure ?? ok("Removed from cart");
}

export async function clearCartAction(
  _previous: CartActionState,
  _formData: FormData,
): Promise<CartActionState> {
  void _previous;
  void _formData;
  const cookie = await requireAuthCookie("/cart");

  const failure = await mutateCart(cookie, "/cart", () =>
    apiFetch<Cart>("/cart", { method: "DELETE", cookie }),
  );
  return failure ?? ok("Cart cleared");
}
