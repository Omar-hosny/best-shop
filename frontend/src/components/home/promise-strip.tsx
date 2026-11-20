import Link from "next/link";

export function DeliverySlip() {
  return (
    <section
      id="delivery"
      aria-labelledby="delivery-title"
      className="border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
          <div>
            <h2
              id="delivery-title"
              className="font-display text-section uppercase tracking-display"
            >
              Pay on delivery
            </h2>
            <p className="mt-5 max-w-2xl font-mono text-sm leading-6 sm:text-[0.9375rem]">
              The catalog, prices and stock are read live. The shop calculates
              your total, and cash is collected when the order arrives.
            </p>
            <Link
              href="#goods"
              className="mt-7 inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Back to live goods
            </Link>
          </div>

          <dl className="rounded-[24px] border border-border bg-card p-6 font-mono text-eyebrow uppercase tracking-label">
            <div className="flex justify-between gap-4 border-b border-dashed border-border pb-3">
              <dt>
                <span aria-hidden="true" className="mr-2 text-brand">
                  01
                </span>
                Standard delivery
              </dt>
              <dd className="font-bold">$7.99</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-dashed border-border py-3">
              <dt>
                <span aria-hidden="true" className="mr-2 text-brand">
                  02
                </span>
                Payment method
              </dt>
              <dd className="font-bold">Cash</dd>
            </div>
            <div className="flex justify-between gap-4 pt-3">
              <dt>
                <span aria-hidden="true" className="mr-2 text-brand">
                  03
                </span>
                Goods total
              </dt>
              <dd className="font-bold">Prices as listed</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
