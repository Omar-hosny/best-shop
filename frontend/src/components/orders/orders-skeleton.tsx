export function OrdersSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-3">
      <span className="sr-only">Reading your orders</span>
      {[0, 1, 2].map((index) => (
        <div key={index} className="rounded-4xl bg-card p-5 sm:p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-24 animate-pulse bg-surface" />
              <div className="h-7 w-40 animate-pulse bg-surface" />
              <div className="h-3 w-48 animate-pulse bg-surface" />
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
