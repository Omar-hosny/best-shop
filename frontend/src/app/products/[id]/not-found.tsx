import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="border-b-2 border-sign bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl rounded-4xl bg-card p-6 sm:p-8">
          <h1 className="font-display text-section uppercase leading-tight tracking-display">
            No tag under that reference
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
            The item may have been withdrawn, or the reference is wrong. The
            live goods board is the current record of what is on hand.
          </p>
          <div className="mt-7">
            <Link
              href="/#goods"
              className="inline-flex min-h-12 items-center gap-3 bg-primary px-6 font-mono text-eyebrow font-bold uppercase tracking-label text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to live goods
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
