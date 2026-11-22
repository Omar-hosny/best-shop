import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { ProductCard } from "@/components/home/product-card";
import { RetryButton } from "@/components/retry-button";
import { categoryName, formatMoney } from "@/lib/format";
import {
  categoryIdOf,
  getProduct,
  getRelatedProducts,
} from "@/lib/product-data";
import type { Product } from "@/lib/types";

import { QuantityField } from "./quantity-field";
import { SpecimenViewer } from "./specimen-viewer";

const actionClass =
  "inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85";

export async function ProductDocket({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: Product | null;
  try {
    product = await getProduct(id);
  } catch {
    return <ReadFailure />;
  }
  if (!product) notFound();

  const soldOut = product.quantity <= 0;
  const lowStock = product.quantity > 0 && product.quantity <= 5;

  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="border-b-2 border-sign bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/#goods"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Goods board
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border sm:block"
          />
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            Stall item {product._id.slice(-6).toUpperCase()}
          </p>
          <p className="ml-auto inline-flex items-center gap-2 font-mono text-eyebrow font-medium uppercase tracking-label text-brand">
            <span aria-hidden="true" className="size-2.5 rounded-full border border-sign bg-bulb" />
            Live read
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <section aria-label="Catalog photograph" className="lg:pr-6">
            <div className="rounded-4xl bg-surface p-3 sm:p-4">
              <SpecimenViewer images={product.images ?? []} name={product.name} />

              <div className="relative z-10 -mt-8 ml-4 mr-4 w-fit rounded-4xl bg-card px-5 py-4 sm:ml-8 sm:min-w-[21rem]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                      Price on this tag
                    </p>
                    <p className="mt-1 font-display text-2xl leading-none tracking-display sm:text-3xl">
                      {formatMoney(product.price)}
                    </p>
                  </div>
                  <p className="pb-1 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
                    USD
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Item details" className="lg:border-l-2 lg:border-sign lg:pl-8">
            <h1 className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] uppercase leading-[1.08] tracking-display text-balance">
              {product.name}
            </h1>

            <dl className="mt-7 grid gap-3 py-5 font-mono text-eyebrow uppercase tracking-label">
              <FieldRow label="Department" value={categoryName(product.category)} />
              <FieldRow
                label="On hand"
                value={
                  <span
                    className={`px-2 py-1 font-bold ${
                      soldOut
                        ? "bg-surface-accent text-muted-foreground"
                        : lowStock
                          ? "bg-bulb text-bulb-foreground"
                          : "bg-muted text-foreground"
                    }`}
                  >
                    {soldOut
                      ? "Sold out"
                      : `${product.quantity} ready${lowStock ? " · Low stock" : ""}`}
                  </span>
                }
              />
              <FieldRow
                label="Reference"
                value={`ITM-${product._id.slice(-8).toUpperCase()}`}
              />
            </dl>

            <div className="mt-8">
              <QuantityField
                productId={product._id}
                max={product.quantity}
                name={product.name}
              />
            </div>

            <div className="mt-8 rounded-4xl bg-sign p-5 text-sign-foreground">
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label opacity-80">
                At the door
              </p>
              <p className="mt-2 font-display text-2xl uppercase leading-[1.08] tracking-display">
                Cash on delivery
              </p>
              <p className="mt-3 text-sm leading-7 opacity-90">
                No card needed. $7.99 standard delivery, added to the order total.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 grid gap-10 border-t-2 border-sign pt-10 lg:grid-cols-2 lg:gap-14">
          <section aria-labelledby="notes-title">
            <h2
              id="notes-title"
              className="font-display text-section uppercase leading-tight tracking-display"
            >
              Stall notes
            </h2>
            <p className="mt-5 max-w-[68ch] text-sm leading-7 text-muted-foreground">
              {product.description?.trim() ||
                "No description has been filed for this line. The photograph and figures above are the supplied record."}
            </p>
          </section>

          <section aria-labelledby="delivery-title">
            <h2
              id="delivery-title"
              className="font-display text-section uppercase leading-tight tracking-display"
            >
              Pay on delivery
            </h2>
            <dl className="mt-5 rounded-4xl bg-card p-5 font-mono text-eyebrow uppercase tracking-label">
              <LedgerRow label="Standard delivery" value="$7.99" />
              <LedgerRow label="Card needed" value="No" />
              <LedgerRow label="Method" value="Cash on delivery" />
            </dl>
            <p className="mt-5 max-w-[62ch] text-sm leading-7 text-muted-foreground">
              The delivery fee is added when an order is placed. Payment is
              collected on delivery; no card details are taken on this site.
            </p>
          </section>
        </div>

        <Suspense fallback={null}>
          <RelatedGoods
            categoryId={categoryIdOf(product)}
            excludeId={product._id}
            department={categoryName(product.category)}
          />
        </Suspense>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/#goods" className={actionClass}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to live goods
          </Link>
        </div>
      </div>
    </main>
  );
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3 last:pb-0 first:pt-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold text-brand">{value}</dd>
    </div>
  );
}

async function RelatedGoods({
  categoryId,
  excludeId,
  department,
}: {
  categoryId: string;
  excludeId: string;
  department: string;
}) {
  const products = await getRelatedProducts(categoryId, excludeId);
  if (!products.length) return null;

  return (
    <section aria-labelledby="related-title" className="mt-16 border-t-2 border-sign pt-10">
      <h2
        id="related-title"
        className="font-display text-section uppercase leading-tight tracking-display"
      >
        More from {department}
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} compact />
        ))}
      </div>
    </section>
  );
}

function ReadFailure() {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl rounded-4xl bg-card p-6 sm:p-8">
          <h1 className="font-display text-section uppercase leading-tight tracking-display">
            This tag could not be read
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
            The live catalog did not answer. No substitute goods or prices have
            been shown in its place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <RetryButton />
            <Link href="/#goods" className={actionClass}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to live goods
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
