import Image from "next/image";
import Link from "next/link";

import { categoryName, formatMoney } from "@/lib/format";
import type { CartItem } from "@/lib/types";

import { CartQuantityControl } from "./cart-quantity-control";
import { CartRemoveButton } from "./cart-remove-button";

export function CartItemRow({ item }: { item: CartItem }) {
  const { product, quantity, lineTotal } = item;
  const cap = Math.min(product.quantity, 99);

  return (
    <article className="rounded-4xl bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link
          href={`/products/${product._id}`}
          aria-label={`View ${product.name}`}
          className="inline-flex size-24 shrink-0 items-center justify-center bg-surface"
        >
          {product.images?.length ? (
            <Image
              src={product.images[0]}
              alt=""
              width={96}
              height={96}
              className="size-24 object-cover"
            />
          ) : (
            <span className="sr-only">No photograph filed</span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            {categoryName(product.category ?? "Selected")}
          </p>
          <h3 className="mt-1 font-mono text-product font-bold leading-snug">
            <Link href={`/products/${product._id}`} className="hover:text-brand">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
            {formatMoney(product.price)} each
          </p>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Quantity
              </p>
              <div className="mt-2">
                <CartQuantityControl
                  key={`${product._id}-${quantity}`}
                  productId={product._id}
                  name={product.name}
                  quantity={quantity}
                  stock={product.quantity}
                />
              </div>
              <p className="mt-2 font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                {product.quantity <= 0
                  ? "Sold out"
                  : `Max ${cap} on hand`}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Line total
              </p>
              <p className="mt-1 font-display text-xl leading-none tracking-display">
                {formatMoney(lineTotal)}
              </p>
              <div className="mt-3">
                <CartRemoveButton productId={product._id} name={product.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
