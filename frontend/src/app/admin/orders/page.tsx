import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminOrdersBoard } from "@/components/admin/admin-orders-board";
import { AdminOrdersSkeleton } from "@/components/admin/admin-skeleton";
import { isOrderStatus } from "@/lib/admin-rules";

export const metadata: Metadata = {
  title: "Admin orders",
  description: "Live cash-on-delivery order queue for Best Shop administrators.",
};

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Staff only · fulfilment
              </p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
                Order queue
              </h1>
            </div>
            <p className="inline-flex items-center gap-2 font-mono text-eyebrow font-bold uppercase tracking-label text-brand">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full border border-sign bg-bulb"
              />
              Live read
            </p>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Status moves forward only: pending to confirmed to shipped to
            delivered. Cancelling before shipping returns stock through the
            same API transaction.
          </p>
        </div>

        {/* searchParams is request-time data: read it inside Suspense so the
            static shell can still be prerendered. */}
        <div className="mt-8">
          <Suspense fallback={<AdminOrdersSkeleton />}>
            <AdminOrdersResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function AdminOrdersResults({
  searchParams,
}: AdminOrdersPageProps) {
  const { status: rawStatus } = await searchParams;
  // A repeated ?status= param arrives as an array. Treat it as invalid rather
  // than letting the API see a value it never validated.
  const repeated = Array.isArray(rawStatus);
  const status = !repeated && isOrderStatus(rawStatus) ? rawStatus : undefined;
  const invalidFilter = rawStatus !== undefined && (repeated || !status);

  return <AdminOrdersBoard status={status} invalidFilter={invalidFilter} />;
}
