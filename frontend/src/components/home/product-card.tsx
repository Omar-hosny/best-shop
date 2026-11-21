import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { categoryName, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const soldOut = product.quantity <= 0;

  return (
    <Link
      href={`/products/${product._id}`}
      aria-label={`View ${product.name}`}
      className={`group relative block h-full rounded-4xl bg-card pt-6 ${compact ? "px-3 pb-3" : "px-4 pb-4"}`}
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-surface">
          {product.images?.length ? (
            <Image
              src={product.images[0]}
              alt=""
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            {categoryName(product.category)}
          </p>
          <h3 className="mt-1 font-mono text-product font-bold leading-snug sm:text-[0.9375rem]">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-3">
            <p className="font-display text-lg leading-none tracking-display">
              {formatMoney(product.price)}
            </p>
            <p
              className={`px-2 py-1 font-mono text-eyebrow font-bold uppercase tracking-label ${
                soldOut
                  ? "bg-surface-accent text-muted-foreground"
                  : "bg-bulb text-bulb-foreground"
              }`}
            >
              {soldOut ? "Sold out" : `${product.quantity} in stock`}
            </p>
          </div>

          <p className="mt-4 inline-flex items-center gap-1 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
            View item
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </p>
        </div>
      </article>
    </Link>
  );
}
