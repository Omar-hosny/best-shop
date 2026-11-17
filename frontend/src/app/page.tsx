import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to Best Shop
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse products across categories, add what you like to your cart,
          and check out with cash on delivery.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    </main>
  );
}
