export function OrderSkeleton() {
  return (
    <main
      id="main"
      role="status"
      aria-busy="true"
      className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14"
    >
      <span className="sr-only">Reading your order</span>
      <div className="rounded-4xl bg-bulb p-6 sm:p-8">
        <div className="h-10 w-52 animate-pulse bg-bulb-foreground/30" />
        <div className="mt-6 h-4 w-72 animate-pulse bg-bulb-foreground/20" />
        <div className="mt-8 grid gap-6 border-t border-bulb-foreground/30 pt-6 sm:grid-cols-2">
          <div className="h-8 animate-pulse bg-bulb-foreground/20" />
          <div className="h-8 animate-pulse bg-bulb-foreground/20" />
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="rounded-4xl bg-card p-5 sm:p-7">
          <div className="h-7 w-40 animate-pulse bg-surface" />
          <div className="mt-8 space-y-4">
            {[0, 1].map((index) => (
              <div key={index} className="h-20 animate-pulse bg-surface" />
            ))}
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-4xl bg-card" />
      </div>
    </main>
  );
}
