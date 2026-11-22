export function AdminOverviewSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-8">
      <span className="sr-only">Reading the live admin overview</span>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="rounded-4xl bg-card p-5">
            <div className="h-3 w-20 animate-pulse bg-surface" />
            <div className="mt-4 h-9 w-12 animate-pulse bg-surface" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <div key={index} className="rounded-4xl bg-card p-5 sm:p-6">
            <div className="h-7 w-44 animate-pulse bg-surface" />
            <div className="mt-6 space-y-4">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-10 animate-pulse bg-surface" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminOrdersSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-5">
      <span className="sr-only">Reading the live admin order queue</span>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="h-11 w-24 animate-pulse bg-surface" />
        ))}
      </div>
      {[0, 1, 2].map((index) => (
        <div key={index} className="rounded-4xl bg-card p-5 sm:p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse bg-surface" />
              <div className="h-7 w-40 animate-pulse bg-surface" />
            </div>
            <div className="h-8 w-24 animate-pulse bg-surface" />
          </div>
          <div className="mt-5 border-t-2 border-sign pt-4">
            <div className="h-11 w-32 animate-pulse bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
