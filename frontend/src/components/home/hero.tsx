import { ArrowDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RetryButton } from "@/components/retry-button";
import { formatMoney } from "@/lib/format";
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
      className="border-b-2 border-sign bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-2 border-sign pb-3 font-mono text-eyebrow font-medium uppercase tracking-label">
          <span>Best Shop / live stall</span>
          <span
            aria-live="polite"
            className="inline-flex items-center gap-2 text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full border border-sign ${isLive ? "bg-bulb" : "bg-muted"}`}
            />
            Catalog {isLive ? "live" : "unavailable"}
          </span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
          <div className="min-w-0">
            {heroImageUrl ? (
              // Optional merchant-supplied banner; never substituted with invented goods.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImageUrl}
                alt=""
                className="mb-8 h-40 w-full rounded-4xl object-cover sm:h-52"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : null}

            <h1
              id="hero-title"
              className="max-w-4xl font-display text-[clamp(2.25rem,5.4vw,4rem)] uppercase leading-[1.04] tracking-display text-balance"
            >
              Live goods.
              <br />
              Plain prices.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[0.9375rem]">
              A working stall, not a catalog teaser. Every tag below is read
              live from the shop with its price and stock. Pay cash when your
              order reaches you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="#goods"
                className="inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Shop the live goods
                <ArrowDown className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#delivery"
                className="inline-flex min-h-11 items-center font-mono text-eyebrow font-medium uppercase tracking-label underline decoration-sign/40 underline-offset-4 transition-colors hover:text-brand"
              >
                See the delivery terms
              </Link>
            </div>

            {isLive ? (
              <div className="mt-10 border-t-2 border-sign pt-5">
                <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                  On the counter now
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {products.slice(0, 5).map((product) => (
                    <li key={product._id}>
                      <Link
                        href={`/products/${product._id}`}
                        className="group block rounded-4xl bg-card p-2"
                      >
                        <span className="relative block aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface">
                          {product.images?.length ? (
                            <Image
                              src={product.images[0]}
                              alt=""
                              fill
                              sizes="(max-width: 639px) 50vw, 20vw"
                              className="object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="mt-2 block truncate font-mono text-eyebrow font-medium uppercase tracking-label">
                          {product.name}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-2 font-mono text-eyebrow font-bold uppercase tracking-label">
                          <span>{formatMoney(product.price)}</span>
                          <span className="text-brand">
                            {product.quantity > 0 ? `${product.quantity} in` : "Out"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!isLive ? (
              <div role="status" className="mt-10 rounded-4xl bg-card p-5">
                <p className="font-display text-lg uppercase tracking-display">
                  The stall cannot be read
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Live prices and stock are unavailable. Nothing here is
                  substituted with sample goods.
                </p>
                <div className="mt-4">
                  <RetryButton />
                </div>
              </div>
            ) : null}
          </div>

          <DeliveryStamp />
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
      className="border-b-2 border-sign bg-background"
    >
      <span className="sr-only">Loading stall…</span>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="flex items-center justify-between border-b-2 border-sign pb-3">
          <div className="h-4 w-36 animate-pulse bg-surface" />
          <div className="h-4 w-28 animate-pulse bg-surface" />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <div className="h-20 w-4/5 animate-pulse bg-surface sm:h-28" />
            <div className="mt-6 h-5 w-full max-w-xl animate-pulse bg-surface" />
            <div className="mt-2 h-5 w-2/3 max-w-lg animate-pulse bg-surface" />
            <div className="mt-8 flex gap-4">
              <div className="h-12 w-52 animate-pulse bg-surface" />
              <div className="h-11 w-44 animate-pulse bg-surface" />
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 border-t-2 border-sign pt-5 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="rounded-4xl bg-card p-2">
                  <div className="aspect-4/3 w-full animate-pulse bg-surface" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse bg-surface" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse bg-surface" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="h-3 w-full animate-pulse border-t-2 border-sign" />
            <div className="h-52 animate-pulse bg-surface" />
            <div className="h-24 animate-pulse rounded-4xl bg-card" />
          </div>
        </div>
      </div>
    </section>
  );
}
