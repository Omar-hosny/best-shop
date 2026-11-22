import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CategoryManager } from "@/components/admin/category-manager";
import { RetryButton } from "@/components/retry-button";
import { type AdminReadResult, getAdminCategories } from "@/lib/admin-data";
import type { Category } from "@/lib/types";

const linkClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

export async function CategoriesBoard() {
  let result: AdminReadResult<Category[]>;
  try {
    result = await getAdminCategories();
  } catch {
    return <ReadFailure />;
  }

  // Control-flow helpers throw, so these checks stay outside the read try/catch.
  if (result.kind === "unauthorized") {
    redirect("/login?next=/admin/categories");
  }
  if (result.kind === "forbidden") {
    redirect("/account");
  }

  return <CategoryManager categories={result.data} />;
}

function ReadFailure() {
  return (
    <div className="rounded-4xl bg-card p-6 sm:p-8">
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] uppercase leading-tight tracking-display">
        This category list could not be read
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
        The API did not answer. No substitute categories have been shown in its
        place, and no changes have been made.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <RetryButton />
        <Link href="/admin" className={linkClass}>
          <ArrowRight className="size-4" aria-hidden="true" />
          Back to overview
        </Link>
      </div>
    </div>
  );
}
