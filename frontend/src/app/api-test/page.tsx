import { Suspense } from "react";

import { apiFetch, ApiError } from "@/lib/api";
import type { Pagination, Product, ValidationIssue } from "@/lib/types";

// Temporary Step 2 probe. Deleted once the real /products page exists.
export default function ApiTestPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-14 sm:px-8">
      <div className="border-b-2 border-sign pb-5">
        <h1 className="font-display text-section uppercase leading-tight tracking-display">
          API round-trip test
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Temporary probe for the server-only API client.
        </p>
      </div>

      <section className="mt-8 rounded-4xl bg-card p-5">
        <h2 className="font-mono text-eyebrow font-bold uppercase tracking-label">
          GET /products?limit=3
        </h2>
        {/* With Cache Components, uncached fetches must sit behind Suspense. */}
        <Suspense
          fallback={
            <p className="mt-2 text-sm text-muted-foreground">
              Loading products…
            </p>
          }
        >
          <ProductProbe />
        </Suspense>
      </section>

      <section className="mt-8 rounded-4xl bg-card p-5">
        <h2 className="font-mono text-eyebrow font-bold uppercase tracking-label">
          GET /products?limit=999 (expect 422)
        </h2>
        <Suspense
          fallback={
            <p className="mt-2 text-sm text-muted-foreground">
              Checking validation…
            </p>
          }
        >
          <ValidationProbe />
        </Suspense>
      </section>
    </main>
  );
}

async function ProductProbe() {
  const { data: products, pagination } = await apiFetch<Product[]>(
    "/products?limit=3",
  );

  return (
    <div className="mt-3 font-mono text-sm">
      <ul className="list-inside list-disc">
        {products.map((product) => (
          <li key={product._id}>{product.name}</li>
        ))}
      </ul>
      <pre className="mt-3 overflow-x-auto rounded-4xl bg-surface p-3 text-eyebrow">
        {JSON.stringify(pagination satisfies Pagination | undefined, null, 2)}
      </pre>
    </div>
  );
}

async function ValidationProbe() {
  let outcome:
    | { kind: "unexpected" }
    | {
        kind: "error";
        status: number;
        message: string;
        errors: ValidationIssue[];
      };

  // Compute the result first; JSX is rendered only after the catch block so
  // the react-hooks/error-boundaries rule does not flag a misleading catch.
  try {
    await apiFetch<Product[]>("/products?limit=999");
    outcome = { kind: "unexpected" };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    outcome = {
      kind: "error",
      status: error.status,
      message: error.message,
      errors: error.errors,
    };
  }

  if (outcome.kind === "unexpected") {
    return (
      <p className="mt-3 font-mono text-sm">Unexpected success — expected a 422.</p>
    );
  }

  return (
    <pre className="mt-3 overflow-x-auto rounded-4xl bg-surface p-3 font-mono text-eyebrow">
      {JSON.stringify(
        { status: outcome.status, message: outcome.message, errors: outcome.errors },
        null,
        2,
      )}
    </pre>
  );
}
