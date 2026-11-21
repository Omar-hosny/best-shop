export function ProductDetailSkeleton() {
  return (
    <main id="main" role="status" aria-busy="true">
      <span className="sr-only">Loading item board…</span>

      <div className="border-b-2 border-sign bg-card">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="h-4 w-72 animate-pulse bg-surface" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <div className="h-[28rem] animate-pulse rounded-4xl bg-surface" />
          <div className="space-y-5">
            <div className="h-14 w-4/5 animate-pulse bg-surface" />
            <div className="h-40 animate-pulse rounded-4xl bg-surface" />
            <div className="h-36 animate-pulse rounded-4xl bg-surface" />
          </div>
        </div>
      </div>
    </main>
  );
}
