export function CartSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <span className="sr-only">Reading your cart</span>
      <div className="space-y-3">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="flex gap-4 rounded-4xl bg-card p-4 sm:p-5"
          >
            <div className="size-24 shrink-0 animate-pulse bg-surface" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 w-24 animate-pulse bg-surface" />
              <div className="h-4 w-2/3 animate-pulse bg-surface" />
              <div className="h-11 w-44 animate-pulse bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-4xl bg-card" />
    </div>
  );
}
