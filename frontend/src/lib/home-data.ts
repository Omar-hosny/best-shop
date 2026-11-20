import "server-only";

import { cache } from "react";

import { apiFetch } from "./api";
import type { Category, Product } from "./types";

// react cache() dedupes these across the hero and goods manifest within a
// single request. The catalog is read in two pages so every department is
// represented in the homepage filters; an unreachable API still lets both
// sections render their own designed empty states.

export const getHomeCategories = cache(async (): Promise<Category[]> => {
  try {
    const { data } = await apiFetch<Category[]>("/categories");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
});

export const getHomeProducts = cache(async (): Promise<Product[]> => {
  const paths = [
    "/products?limit=50&sort=newest&page=1",
    "/products?limit=50&sort=newest&page=2",
  ];

  const settled = await Promise.allSettled(
    paths.map((path) => apiFetch<Product[]>(path)),
  );

  const products = settled.flatMap((result) =>
    result.status === "fulfilled" && Array.isArray(result.value.data)
      ? result.value.data
      : [],
  );

  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product._id)) return false;
    seen.add(product._id);
    return true;
  });
});
