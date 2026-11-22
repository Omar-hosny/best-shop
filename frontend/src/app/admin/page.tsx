import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminOverview } from "@/components/admin/admin-overview";
import {
  AdminOverviewSkeleton,
} from "@/components/admin/admin-skeleton";

export const metadata: Metadata = {
  title: "Admin overview",
  description: "Live order counts and stock watch for Best Shop administrators.",
};

export default function AdminPage() {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="border-b-2 border-sign pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-eyebrow font-medium uppercase tracking-label text-muted-foreground">
                Staff only
              </p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[1.05] tracking-display">
                The control board
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
            Counts, recent orders, and stock levels are read from the API on
            every visit. Admin-only writes live in the order queue.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex min-h-11 items-center font-mono text-eyebrow font-bold uppercase tracking-label text-brand underline underline-offset-4"
          >
            Go to the order queue
          </Link>
        </div>

        <div className="mt-8">
          <Suspense fallback={<AdminOverviewSkeleton />}>
            <AdminOverview />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
