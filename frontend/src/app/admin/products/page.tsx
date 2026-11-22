import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminProductsBoard } from "@/components/admin/admin-products-board";
import { AdminProductsSkeleton } from "@/components/admin/admin-skeleton";
import { parseAdminProductFilters } from "@/lib/product-rules";

export const metadata: Metadata = {
  title: "Admin products",
  description: "Create, edit, and delete live Best Shop products.",
};

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Staff only · catalog
              </p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
                Product board
              </h1>
            </div>
            <p className="inline-flex items-center gap-2 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full border border-sign bg-bulb"
              />
              Live read
            </p>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Prices, stock, and categories here are written straight to the API.
            Order history keeps its own snapshots, so editing or deleting an
            item never rewrites a past order.
          </p>
          <Link
            href="/admin"
            className="mt-4 inline-flex min-h-11 items-center font-mono text-eyebrow font-bold uppercase tracking-label text-brand underline underline-offset-4"
          >
            Back to control board
          </Link>
        </div>

        {/* searchParams is request-time data: read it inside Suspense so the
            static shell can still be prerendered. */}
        <div className="mt-8">
          <Suspense fallback={<AdminProductsSkeleton />}>
            <AdminProductsResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function AdminProductsResults({
  searchParams,
}: AdminProductsPageProps) {
  const parsed = parseAdminProductFilters(await searchParams);
  return <AdminProductsBoard parsed={parsed} />;
}
