"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import { deleteProductAction } from "@/app/actions/catalog.actions";
import type { ProductActionState } from "@/lib/catalog-state";
import { initialProductActionState } from "@/lib/catalog-state";
import { formatMoney } from "@/lib/format";
import {
  buildAdminProductsHref,
  productCategoryId,
  type AdminProductFilters,
} from "@/lib/product-rules";
import type { Category, Pagination, Product } from "@/lib/types";

const outlineClass =
  "inline-flex min-h-10 items-center border-2 border-sign px-4 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground disabled:cursor-not-allowed disabled:opacity-60";
const dangerClass =
  "inline-flex min-h-10 items-center border-2 border-destructive px-4 font-mono text-eyebrow font-bold uppercase tracking-label text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60";
const linkClass =
  "inline-flex min-h-10 items-center border-2 border-sign px-4 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  filters: AdminProductFilters;
  pagination?: Pagination;
}

export function ProductTable({
  products,
  categories,
  filters,
  pagination,
}: ProductTableProps) {
  const [state, formAction, pending] = useActionState(
    deleteProductAction,
    initialProductActionState,
  );
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const categoryNames = new Map(categories.map((category) => [category._id, category.name]));

  return (
    <div className="space-y-5">
      <DeleteMessage state={state} />

      {products.length === 0 ? (
        <div className="rounded-4xl bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl uppercase leading-tight tracking-display">
            No products in this view
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Nothing matched the current filters. Clear them, or add the first
            product in this slice of the catalog.
          </p>
          <Link href="/admin/products" className={`${linkClass} mt-6`}>
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-4xl bg-card">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <caption className="sr-only">Live product catalog</caption>
            <thead>
              <tr className="border-b-2 border-sign font-mono text-eyebrow font-bold uppercase tracking-label text-muted-foreground">
                <th scope="col" className="px-4 py-4 sm:px-5">Image</th>
                <th scope="col" className="px-4 py-4 sm:px-5">Product</th>
                <th scope="col" className="px-4 py-4 sm:px-5">Category</th>
                <th scope="col" className="px-4 py-4 sm:px-5">Price</th>
                <th scope="col" className="px-4 py-4 sm:px-5">Stock</th>
                <th scope="col" className="px-4 py-4 sm:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.map((product) => (
                <tr key={product._id} className="align-middle">
                  <td className="px-4 py-4 sm:px-5">
                    <ProductThumb product={product} />
                  </td>
                  <td className="max-w-xs px-4 py-4 sm:px-5">
                    <Link
                      href={`/products/${product._id}`}
                      className="font-medium transition-colors hover:text-brand"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 truncate font-mono text-eyebrow text-muted-foreground">
                      {product._id.slice(-8).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-mono text-eyebrow uppercase tracking-label text-muted-foreground sm:px-5">
                    {categoryNames.get(productCategoryId(product.category)) ?? "Unknown"}
                  </td>
                  <td className="px-4 py-4 font-mono text-sm tabular-nums sm:px-5">
                    {formatMoney(product.price)}
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <StockLabel quantity={product.quantity} />
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className={outlineClass}
                      >
                        Edit
                      </Link>
                      <form action={formAction}>
                        <input type="hidden" name="productId" value={product._id} />
                        {confirmingId === product._id ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              disabled={pending}
                              className={dangerClass}
                            >
                              {pending ? "Deleting…" : "Yes, delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              disabled={pending}
                              className={outlineClass}
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(product._id)}
                            className={dangerClass}
                          >
                            Delete
                          </button>
                        )}
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav aria-label="Product pages" className="flex flex-wrap items-center gap-2">
          {pagination.page > 1 ? (
            <Link
              href={buildAdminProductsHref(filters, pagination.page - 1)}
              className={linkClass}
            >
              Previous
            </Link>
          ) : null}
          <p className="px-2 font-mono text-eyebrow font-bold uppercase tracking-label text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} products
          </p>
          {pagination.page < pagination.totalPages ? (
            <Link
              href={buildAdminProductsHref(filters, pagination.page + 1)}
              className={linkClass}
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

function DeleteMessage({ state }: { state: ProductActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
        state.status === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-surface-accent text-brand"
      }`}
    >
      {state.message}
    </p>
  );
}

function ProductThumb({ product }: { product: Product }) {
  const first = product.images?.[0];
  let picsum = false;
  if (first) {
    try {
      picsum = new URL(first).hostname === "picsum.photos";
    } catch {
      picsum = false;
    }
  }

  if (first && picsum) {
    return (
      <Image
        src={first}
        alt=""
        width={56}
        height={56}
        className="size-14 rounded-xl object-cover"
      />
    );
  }

  return (
    <div
      aria-label={
        product.images?.length
          ? `${product.images.length} external image URLs`
          : "No image"
      }
      className="flex size-14 items-center justify-center rounded-xl bg-surface-accent px-1 text-center font-mono text-[0.6rem] font-bold uppercase leading-tight text-muted-foreground"
    >
      {product.images?.length ? `${product.images.length} URL${product.images.length === 1 ? "" : "s"}` : "None"}
    </div>
  );
}

function StockLabel({ quantity }: { quantity: number }) {
  const tone =
    quantity === 0
      ? "bg-surface-accent text-muted-foreground"
      : quantity <= 10
        ? "bg-bulb text-bulb-foreground"
        : "bg-muted text-foreground";
  const label = quantity === 0 ? "Out" : quantity <= 10 ? `${quantity} low` : `${quantity} ready`;

  return (
    <span className={`inline-flex px-2 py-1 font-mono text-eyebrow font-bold uppercase tracking-label ${tone}`}>
      {label}
    </span>
  );
}
