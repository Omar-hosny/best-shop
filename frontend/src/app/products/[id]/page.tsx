import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductDetailSkeleton } from "@/components/product/product-detail-skeleton";
import { ProductDocket } from "@/components/product/product-docket";

export const metadata: Metadata = {
  title: "Item board",
  description:
    "Live price, stock, and cash-on-delivery terms for one Best Shop item.",
};

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDocket params={params} />
    </Suspense>
  );
}
