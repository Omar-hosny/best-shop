import { Suspense } from "react";

import { Hero, HeroSkeleton } from "@/components/home/hero";
import {
  GoodsManifest,
  GoodsManifestSkeleton,
} from "@/components/home/product-rail";
import { DeliverySlip } from "@/components/home/promise-strip";

export default function Home() {
  return (
    <main id="main">
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />

      </Suspense>
      <Suspense fallback={<GoodsManifestSkeleton />}>
        <GoodsManifest />
      </Suspense>
      <DeliverySlip />
    </main>
  );
}
