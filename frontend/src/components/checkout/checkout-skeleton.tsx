export function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <span className="sr-only">Preparing checkout</span>
      <div className="rounded-4xl bg-card p-5 sm:p-7">
        <div className="h-3 w-28 animate-pulse bg-surface" />
        <div className="mt-3 h-7 w-64 animate-pulse bg-surface" />
        <div className="mt-8 space-y-5">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-32 animate-pulse bg-surface" />
              <div className="h-12 w-full animate-pulse bg-surface" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-4xl bg-card" />
    </div>
  );
}
