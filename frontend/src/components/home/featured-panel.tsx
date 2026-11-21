export function DeliveryStamp() {
  return (
    <aside aria-label="Cash on delivery terms" className="flex flex-col gap-5">
      <div className="bulb-string" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((bulb) => (
          <span
            key={bulb}
            className="bulb"
            style={{ animationDelay: `${bulb * 110}ms` }}
          />
        ))}
      </div>

      <div className="sign-solid px-5 py-6 text-center sm:px-6 sm:py-8">
        <p className="font-mono text-eyebrow font-medium uppercase tracking-label opacity-80">
          Payment at the door
        </p>
        <p className="mt-4 font-display text-[clamp(1.75rem,2.6vw,2.5rem)] uppercase leading-[1.05] tracking-display">
          Cash on
          <br />
          delivery
        </p>
      </div>

      <dl className="sign mt-0 p-4 font-mono text-eyebrow uppercase tracking-label">
        <div className="flex justify-between gap-4 pb-3">
          <dt>Standard delivery</dt>
          <dd className="font-bold">$7.99</dd>
        </div>
        <div className="flex justify-between gap-4 pt-3">
          <dt>Card needed</dt>
          <dd className="font-bold text-brand">No</dd>
        </div>
      </dl>
    </aside>
  );
}
