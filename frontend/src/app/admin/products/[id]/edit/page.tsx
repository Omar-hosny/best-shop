import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminProductFormSkeleton } from "@/components/admin/admin-skeleton";
import { ProductEditPanel } from "@/components/admin/product-edit-panel";
import { isProductId } from "@/lib/product-rules";

export const metadata: Metadata = {
  title: "Edit product",
  description: "Change a live Best Shop product through the admin API.",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Staff only · edit item
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
            Change the tag
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Only fields you change are sent. The API re-checks every value and
            re-reads the category before saving.
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
            <ProductEditResults params={params} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function ProductEditResults({ params }: EditProductPageProps) {
  const { id } = await params;
  if (!isProductId(id)) notFound();
  return <ProductEditPanel id={id} />;
}
