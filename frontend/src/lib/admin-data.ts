import "server-only";

import { cache } from "react";

import { isOrderStatus } from "./admin-rules";
import { ApiError, apiFetch } from "./api";
import { getAuthCookieHeader, getCurrentUser } from "./session";
import type {
  AdminOrder,
  Category,
  OrderStatus,
  Pagination,
  Product,
  User,
} from "./types";

type AdminAccess =
  | { kind: "ok"; cookie: string; user: User }
  | { kind: "unauthorized" }
  | { kind: "forbidden" };

export type AdminReadResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "unauthorized" }
  | { kind: "forbidden" };

export interface AdminOverviewData {
  orders: AdminOrder[];
  products: Product[];
}

export interface AdminProductList {
  products: Product[];
  pagination?: Pagination;
}

// Stop at a sane ceiling so a runaway catalog cannot stall the overview.
const MAX_CATALOG_PAGES = 20;

const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const cookie = await getAuthCookieHeader();
  if (!cookie) return { kind: "unauthorized" };

  const user = await getCurrentUser();
  if (!user) return { kind: "unauthorized" };
  if (user.role !== "admin") return { kind: "forbidden" };

  return { kind: "ok", cookie, user };
});

async function readAdminOrders(
  cookie: string,
  status?: OrderStatus,
): Promise<AdminOrder[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const { data } = await apiFetch<AdminOrder[]>(`/orders/admin${query}`, {
    cookie,
  });
  return data;
}

async function readCatalogForStock(): Promise<Product[]> {
  const products: Product[] = [];

  for (let page = 1; page <= MAX_CATALOG_PAGES; page += 1) {
    const { data, pagination } = await apiFetch<Product[]>(
      `/products?page=${page}&limit=50&sort=newest`,
    );
    products.push(...data);

    if (!pagination || page >= pagination.totalPages) break;
  }

  return products;
}

export const getAdminOverview = cache(
  async (): Promise<AdminReadResult<AdminOverviewData>> => {
    const access = await getAdminAccess();
    if (access.kind !== "ok") return access;

    const [orders, products] = await Promise.all([
      readAdminOrders(access.cookie),
      readCatalogForStock(),
    ]);

    return { kind: "ok", data: { orders, products } };
  },
);

export const getAdminOrders = cache(
  async (rawStatus?: string): Promise<AdminReadResult<AdminOrder[]>> => {
    const access = await getAdminAccess();
    if (access.kind !== "ok") return access;

    const status = isOrderStatus(rawStatus) ? rawStatus : undefined;
    return { kind: "ok", data: await readAdminOrders(access.cookie, status) };
  },
);

export const getAdminCategories = cache(
  async (): Promise<AdminReadResult<Category[]>> => {
    const access = await getAdminAccess();
    if (access.kind !== "ok") return access;

    const { data } = await apiFetch<Category[]>("/categories");
    return { kind: "ok", data };
  },
);

export const getAdminProducts = cache(
  async (query: string): Promise<AdminReadResult<AdminProductList>> => {
    const access = await getAdminAccess();
    if (access.kind !== "ok") return access;

    const { data, pagination } = await apiFetch<Product[]>(
      `/products?${query}`,
      { cookie: access.cookie },
    );
    return { kind: "ok", data: { products: data, pagination } };
  },
);

export const getAdminProduct = cache(
  async (id: string): Promise<AdminReadResult<Product | null>> => {
    const access = await getAdminAccess();
    if (access.kind !== "ok") return access;

    try {
      const { data } = await apiFetch<Product>(`/products/${id}`, {
        cookie: access.cookie,
      });
      return { kind: "ok", data: data ?? null };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { kind: "ok", data: null };
      }
      throw error;
    }
  },
);
