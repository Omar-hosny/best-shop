import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateProductAction } from "@/app/actions/catalog.actions";
import { ProductFormPanel } from "@/components/admin/product-form-panel";
import { RetryButton } from "@/components/retry-button";
import { type AdminReadResult, getAdminProduct } from "@/lib/admin-data";
import { productFormValuesFromProduct } from "@/lib/product-rules";
import type { Product } from "@/lib/types";

const outlineLinkClass =
  "inline-flex min-h-12 items-center gap-3 border-2 border-sign px-6 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground";

export async function ProductEditPanel({ id }: { id: string }) {
  let result: AdminReadResult<Product | null>;
  try {
    result = await getAdminProduct(id);
  } catch {
    return <ReadFailure />;
  }

  // Control-flow helpers throw, so these checks stay outside the read try/catch.
  if (result.kind === "unauthorized") {
    redirect("/login?next=/admin/products");
  }
  if (result.kind === "forbidden") {
    redirect("/account");
  }
  if (!result.data) notFound();

  return (
    <ProductFormPanel
      mode="update"
      action={updateProductAction}
      initialValues={productFormValuesFromProduct(result.data)}
    />
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-2xl uppercase leading-tight tracking-display">
        This product could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute values have been placed in the
        form, and nothing has been saved.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <RetryButton />
        <Link href="/admin/products" className={outlineLinkClass}>
          <ArrowRight className="size-4" aria-hidden="true" />
          Back to product board
        </Link>
      </div>
    </div>
  );
}
