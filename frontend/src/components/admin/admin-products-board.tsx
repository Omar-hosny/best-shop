import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductTable } from "@/components/admin/product-table";
import { RetryButton } from "@/components/retry-button";
import {
  type AdminProductList,
  getAdminCategories,
  getAdminProducts,
  type AdminReadResult,
} from "@/lib/admin-data";
import {
  PRODUCT_SORTS,
  type ParsedProductFilters,
} from "@/lib/product-rules";
import type { Category } from "@/lib/types";

const primaryLinkClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";
const outlineLinkClass =
  "inline-flex min-h-12 items-center gap-3 border-2 border-sign px-6 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground";
const fieldClass =
  "h-12 w-full rounded-2xl border border-border/60 bg-card px-4 font-mono text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-ring";

interface AdminProductsBoardProps {
  parsed: ParsedProductFilters;
}

export async function AdminProductsBoard({ parsed }: AdminProductsBoardProps) {
  let products: AdminReadResult<AdminProductList>;
  let categories: AdminReadResult<Category[]>;
  try {
    [products, categories] = await Promise.all([
      getAdminProducts(parsed.query),
      getAdminCategories(),
    ]);
  } catch {
    return <ReadFailure />;
  }

  // Control-flow helpers throw, so these checks stay outside the read try/catch.
  if (products.kind === "unauthorized" || categories.kind === "unauthorized") {
    redirect("/login?next=/admin/products");
  }
  if (products.kind === "forbidden" || categories.kind === "forbidden") {
    redirect("/account");
  }

  const { filters } = parsed;

  return (
    <div className="space-y-5">
      {parsed.invalid ? (
        <p
          role="status"
          className="rounded-2xl border-l-4 border-bulb bg-card px-4 py-3 text-sm leading-6 text-muted-foreground"
        >
          One or more filters were not recognised. Showing the catalog with the
          valid filters only.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          action="/admin/products"
          method="get"
          aria-label="Filter products"
          className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_minmax(0,12rem)_auto]"
        >
          <label className="sr-only" htmlFor="product-search">
            Search products
          </label>
          <input
            id="product-search"
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            placeholder="Search name or description"
            className={fieldClass}
          />

          <label className="sr-only" htmlFor="product-category-filter">
            Filter by category
          </label>
          <select
            id="product-category-filter"
            name="category"
            defaultValue={filters.category ?? ""}
            className={fieldClass}
          >
            <option value="">All categories</option>
            {categories.data.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="product-sort">
            Sort products
          </label>
          <select
            id="product-sort"
            name="sort"
            defaultValue={filters.sort}
            className={fieldClass}
          >
            {PRODUCT_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {sort.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <button type="submit" className={outlineLinkClass}>
            Filter
          </button>
        </form>

        <Link href="/admin/products/new" className={primaryLinkClass}>
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Link>
      </div>

      <ProductTable
        products={products.data.products}
        categories={categories.data}
        filters={filters}
        pagination={products.data.pagination}
      />
    </div>
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        This catalog could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute products or categories have been
        shown in its place, and no changes have been made.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <RetryButton />
        <Link href="/admin" className={outlineLinkClass}>
          <ArrowRight className="size-4" aria-hidden="true" />
          Back to overview
        </Link>
      </div>
    </div>
  );
}
