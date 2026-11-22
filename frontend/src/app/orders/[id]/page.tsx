import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderDocket } from "@/components/orders/order-docket";
import { OrderSkeleton } from "@/components/orders/order-skeleton";

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Your Best Shop order, with frozen prices and delivery details.",
};

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderDocket params={params} />
    </Suspense>
  );
}
