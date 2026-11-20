import { ArrowDown } from "lucide-react";
import Link from "next/link";

import { RetryButton } from "@/components/retry-button";
import { getHomeProducts } from "@/lib/home-data";
import { DeliveryStamp } from "./featured-panel";

export async function Hero() {
  const heroImageUrl =
    process.env.HERO_IMAGE_URL ?? process.env.NEXT_PUBLIC_HERO_IMAGE_URL;
  const products = await getHomeProducts();
  const isLive = products.length > 0;

  return (
    <section
      aria-labelledby="hero-title"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border pb-3">
          <p className="font-mono text-eyebrow uppercase tracking-label text-brand">
            Field A / Storefront
          </p>
          <p
            aria-live="polite"
            className="font-mono text-eyebrow uppercase tracking-label text-muted-foreground"
          >
            Catalog {isLive ? "live" : "unavailable"}
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_20rem] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-surface sm:aspect-[16/9] lg:aspect-[21/10]">
              {heroImageUrl ? (
                // User-provided header image URL (configured later via env).
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-mono text-eyebrow uppercase tracking-label text-muted-foreground">
                      Header image
                    </p>
                    <p className="font-mono text-eyebrow uppercase tracking-label text-muted-foreground">
                      Pending source
                    </p>
                  </div>

                  <div>
                    <p className="font-display text-[clamp(2.25rem,6vw,4.75rem)] uppercase leading-[0.88] tracking-display text-foreground/90">
                      Live goods,
                      <br />
                      plain prices
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-dashed border-border pt-4 font-mono text-eyebrow uppercase tracking-label text-muted-foreground sm:max-w-xl">
                    <div>
                      <p className="text-brand">01</p>
                      <p className="mt-1 font-bold text-foreground">Catalog</p>
                    </div>
                    <div>
                      <p className="text-brand">02</p>
                      <p className="mt-1 font-bold text-foreground">Prices</p>
                    </div>
                    <div>
                      <p className="text-brand">03</p>
                      <p className="mt-1 font-bold text-foreground">
                        On delivery
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 border-b border-border pb-8">
              <h1
                id="hero-title"
                className="max-w-4xl font-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.9] tracking-display text-balance"
              >
                The shopfront, read live
              </h1>
              <p className="mt-4 max-w-2xl font-mono text-sm leading-6 text-muted-foreground sm:text-[0.9375rem]">
                Real goods, plain prices, and stock read from the catalog. Browse
                the list below and pay cash when your order arrives.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  href="#goods"
                  className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
                >
                  Read the goods list
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#delivery"
                  className="inline-flex min-h-11 items-center font-mono text-eyebrow uppercase tracking-label underline decoration-foreground/40 underline-offset-4 transition-colors hover:text-brand"
                >
                  See delivery costs
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <dl className="rounded-[24px] border border-border bg-card p-5 font-mono text-eyebrow uppercase tracking-label">
              <div className="flex justify-between gap-6 border-b border-dashed border-border pb-3">
                <dt>
                  <span aria-hidden="true" className="mr-2 text-brand">
                    01
                  </span>
                  Catalog
                </dt>
                <dd className="font-bold">{isLive ? "Live" : "Unavailable"}</dd>
              </div>
              <div className="flex justify-between gap-6 border-b border-dashed border-border py-3">
                <dt>
                  <span aria-hidden="true" className="mr-2 text-brand">
                    02
                  </span>
                  Lines read
                </dt>
                <dd className="font-bold">
                  {isLive ? String(products.length).padStart(2, "0") : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-6 pt-3">
                <dt>
                  <span aria-hidden="true" className="mr-2 text-brand">
                    03
                  </span>
                  Standard delivery
                </dt>
                <dd className="font-bold">$7.99</dd>
              </div>
            </dl>

            {!isLive ? (
              <div
                role="status"
                className="rounded-[24px] border border-border p-5"
              >
                <p className="font-display text-lg uppercase tracking-display">
                  Catalog could not be read
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Live prices and stock are unavailable right now. The goods list
                  below will show only what can be read.
                </p>
                <div className="mt-4">
                  <RetryButton />
                </div>
              </div>
            ) : null}

            <DeliveryStamp />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      className="border-b border-border bg-background"
    >
      <span className="sr-only">Loading storefront…</span>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="h-4 w-36 animate-pulse bg-surface" />
          <div className="h-4 w-28 animate-pulse bg-surface" />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_20rem] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <div className="aspect-[16/10] w-full animate-pulse rounded-[24px] bg-surface sm:aspect-[16/9] lg:aspect-[21/10]" />
            <div className="mt-8 border-b border-border pb-8">
              <div className="h-12 w-4/5 animate-pulse bg-surface sm:h-16" />
              <div className="mt-4 h-5 w-full max-w-xl animate-pulse bg-surface" />
              <div className="mt-2 h-5 w-2/3 max-w-lg animate-pulse bg-surface" />
              <div className="mt-7 flex gap-4">
                <div className="h-12 w-48 animate-pulse rounded-full bg-surface" />
                <div className="h-11 w-36 animate-pulse bg-surface" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="h-40 animate-pulse rounded-[24px] border border-border bg-card" />
            <div className="h-56 animate-pulse rounded-[24px] bg-surface" />
          </div>
        </div>
      </div>
    </section>
  );
}
