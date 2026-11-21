import "server-only";

import { cache } from "react";

import { apiFetch, ApiError } from "./api";
import type { Product } from "./types";

// A malformed id is reported by the API as 400/422, a missing one as 404.
// Both mean the docket cannot be filed, so the route shows its not-found UI.
// A transport failure throws instead and gets the designed read-failure panel.
const ABSENT_STATUSES = new Set([400, 404, 422]);

export const getProduct = cache(async (id: string): Promise<Product | null> => {
  try {
    const { data } = await apiFetch<Product>(
      `/products/${encodeURIComponent(id)}`,
    );
    return data ?? null;
  } catch (error) {
    if (error instanceof ApiError && ABSENT_STATUSES.has(error.status)) {
      return null;
    }
    throw error;
  }
});

export const getRelatedProducts = cache(
  async (categoryId: string, excludeId: string): Promise<Product[]> => {
    try {
      const { data } = await apiFetch<Product[]>(
        `/products?category=${encodeURIComponent(categoryId)}&limit=5&sort=newest`,
      );
      return (Array.isArray(data) ? data : [])
        .filter((product) => product._id !== excludeId)
        .slice(0, 4);
    } catch {
      // A failed secondary read never invents substitute goods.
      return [];
    }
  },
);

export const categoryIdOf = (product: Product) =>
  typeof product.category === "string" ? product.category : product.category._id;
