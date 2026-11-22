import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { RetryButton } from "@/components/retry-button";
import { type AdminReadResult, getAdminCategories } from "@/lib/admin-data";
import type { ProductActionState } from "@/lib/catalog-state";
import type { ProductFormValues } from "@/lib/product-rules";
import type { Category } from "@/lib/types";

type ProductFormAction = (
  state: ProductActionState,
  formData: FormData,
) => Promise<ProductActionState>;

interface ProductFormPanelProps {
  mode: "create" | "update";
  action: ProductFormAction;
  initialValues: ProductFormValues;
}

const outlineLinkClass =
  "inline-flex min-h-12 items-center gap-3 border-2 border-sign px-6 font-mono text-eyebrow font-bold uppercase tracking-label transition-colors hover:bg-sign hover:text-sign-foreground";

export async function ProductFormPanel({
  mode,
  action,
  initialValues,
}: ProductFormPanelProps) {
  let result: AdminReadResult<Category[]>;
  try {
    result = await getAdminCategories();
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

  return (
    <ProductForm
      mode={mode}
      action={action}
      categories={result.data}
      initialValues={initialValues}
    />
  );
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-2xl uppercase leading-tight tracking-display">
        The category list could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The product form needs live categories. None have been invented in
        their place, and nothing has been saved.
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
