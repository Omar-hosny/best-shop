// Hoisted out of render: Cache Components rejects unstable values during prerender.
const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-sign bg-sign text-sign-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-6 font-mono text-eyebrow font-medium uppercase tracking-label sm:px-6 lg:px-8">
        <span>Best Shop / live stall</span>
        <span>Standard delivery $7.99</span>
        <span>Cash on delivery</span>
        <span className="sm:ml-auto">© {YEAR}</span>
      </div>
    </footer>
  );
}
