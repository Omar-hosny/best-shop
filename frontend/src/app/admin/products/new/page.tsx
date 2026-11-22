import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { createProductAction } from "@/app/actions/catalog.actions";
import { AdminProductFormSkeleton } from "@/components/admin/admin-skeleton";
import { ProductFormPanel } from "@/components/admin/product-form-panel";
import { emptyProductFormValues } from "@/lib/product-rules";

export const metadata: Metadata = {
  title: "New product",
  description: "Add a live product to the Best Shop catalog.",
};

export default function NewProductPage() {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Staff only · new item
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
            Add to the board
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Every field is checked again by the API. Orders snapshot their own
            item details, so a new listing cannot disturb past purchases.
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex min-h-11 items-center font-mono text-eyebrow font-bold uppercase tracking-label text-brand underline underline-offset-4"
          >
            Back to product board
          </Link>
        </div>

        <div className="mt-8 rounded-4xl bg-card p-5 sm:p-6">
          <Suspense fallback={<AdminProductFormSkeleton />}>
            <ProductFormPanel
              mode="create"
              action={createProductAction}
              initialValues={emptyProductFormValues}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
