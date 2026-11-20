import Image from "next/image";

import { categoryName, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const soldOut = product.quantity <= 0;

  return (
    <article
      className={`flex h-full flex-col rounded-[24px] bg-card ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-4xl bg-surface">
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

      <div className="mt-3 flex flex-1 flex-col">
        <p className="font-mono text-eyebrow uppercase tracking-label text-muted-foreground">
          {categoryName(product.category)}
        </p>
        <h3 className="mt-1 font-mono text-product font-semibold leading-snug sm:text-[0.9375rem]">
          {product.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t border-dashed border-border pt-3">
          <p className="font-mono text-product font-bold">
            {formatMoney(product.price)}
          </p>
          <p
            className={`font-mono text-eyebrow font-bold uppercase tracking-label ${
              soldOut ? "text-muted-foreground" : "text-brand"
            }`}
          >
            {soldOut ? "Sold out" : `${product.quantity} in stock`}
          </p>
        </div>
      </div>
    </article>
  );
}
