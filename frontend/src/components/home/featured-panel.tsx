export function DeliveryStamp() {
  return (
    <aside className="flex flex-col justify-between gap-7 p-5 sm:p-6">
      <p className="font-mono text-eyebrow uppercase tracking-label text-brand">
        Payment field
      </p>

      <div className="stamp-press w-fit rounded-[16px] border-4 border-double border-brand px-5 py-4 text-center text-brand">
        <span className="block font-display text-2xl uppercase leading-[0.95] tracking-display sm:text-3xl">
          Cash on
          <br />
          delivery
        </span>
      </div>

      <dl className="space-y-2 border-t border-border pt-4 font-mono text-eyebrow uppercase tracking-label">
        <div className="flex justify-between gap-4 border-b border-dashed border-border pb-2">
          <dt>
            <span aria-hidden="true" className="mr-2">
              01
            </span>
            Standard delivery
          </dt>
          <dd className="font-bold">$7.99</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>
            <span aria-hidden="true" className="mr-2">
              02
            </span>
            Card needed
          </dt>
          <dd className="font-bold">No</dd>
        </div>
      </dl>
    </aside>
  );
}
