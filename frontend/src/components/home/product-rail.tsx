import { getHomeCategories, getHomeProducts } from "@/lib/home-data";
import { GoodsBoard } from "./goods-board";

export async function GoodsManifest() {
  const [products, categories] = await Promise.all([
    getHomeProducts(),
    getHomeCategories(),
  ]);

  return (
    <section
      id="goods"
      aria-labelledby="goods-title"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-border pb-5">
          <div>
            <h2
              id="goods-title"
              className="font-display text-section uppercase tracking-display"
            >
              Goods manifest
            </h2>
            <p className="mt-3 max-w-2xl font-mono text-pretty text-sm leading-6 text-muted-foreground">
              The lines below are read from the live catalog. Filter by
              department; prices and stock are never cached in this page.
            </p>
          </div>
          <p className="font-mono text-eyebrow uppercase tracking-label text-brand">
            Field B / Goods
          </p>
        </div>

        {products.length || categories.length ? (
          <GoodsBoard products={products} categories={categories} />
        ) : (
          <div role="status" className="mt-8 border-b border-border py-10">
            <p className="font-display text-xl uppercase tracking-display">
              The manifest could not be read
            </p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Catalog and department data are unavailable. Nothing below is
              guessed or filled with samples.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function GoodsManifestSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      className="border-b border-border bg-background"
    >
      <span className="sr-only">Loading goods manifest…</span>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="h-9 w-72 animate-pulse bg-surface" />
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse bg-surface" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-11 w-28 animate-pulse bg-surface" />
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[24px] border border-border bg-card p-4"
            >
              <div className="aspect-4/3 w-full rounded-4xl bg-surface" />
              <div className="mt-3 h-3 w-20 bg-surface" />
              <div className="mt-2 h-4 w-4/5 bg-surface" />
              <div className="mt-4 h-4 w-24 bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
