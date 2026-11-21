import Link from "next/link";

const steps = [
  {
    title: "Pick a tag",
    detail: "Read the live price and stock on any item in the stall.",
  },
  {
    title: "We bring the order",
    detail: "The shop totals the goods and adds the $7.99 delivery fee.",
  },
  {
    title: "Hand over cash",
    detail: "No card is taken on this site. Payment happens at your door.",
  },
];

export function DeliverySlip() {
  return (
    <section
      id="delivery"
      aria-labelledby="delivery-title"
      className="border-t-2 border-sign bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
          <div>
            <h2
              id="delivery-title"
              className="font-display text-section uppercase leading-tight tracking-display"
            >
              Pay at the door
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
              The catalog, prices and stock are read live. The shop works out
              the total, and cash is collected when the order arrives.
            </p>

            <ol className="mt-8 border-t-2 border-sign">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-2 border-b-2 border-sign py-5 sm:grid-cols-[3rem_1fr] sm:gap-4"
                >
                  <span className="font-display text-xl tracking-display text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-mono text-eyebrow font-bold uppercase tracking-label">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="#goods"
              className="mt-8 inline-flex min-h-12 items-center bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Back to live goods
            </Link>
          </div>

          <div className="sign p-6 font-mono text-eyebrow uppercase tracking-label">
            <p className="pb-3 font-display text-lg tracking-display">
              The door bill
            </p>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between gap-4">
                <dt>Standard delivery</dt>
                <dd className="font-bold">$7.99</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Payment method</dt>
                <dd className="font-bold text-brand">Cash</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Goods total</dt>
                <dd className="font-bold">Tag prices</dd>
              </div>
            </dl>
            <p className="mt-5 pt-1 leading-6 text-muted-foreground">
              No card details are collected anywhere on this site.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
