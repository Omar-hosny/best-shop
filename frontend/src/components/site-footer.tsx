// Hoisted out of render: Cache Components rejects unstable values during prerender.
const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-6 font-mono text-eyebrow uppercase tracking-label sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <span>Best Shop / live catalog</span>
          <span>Standard delivery $7.99</span>
          <span>Cash on delivery</span>
          <span className="sm:ml-auto">© {YEAR}</span>
        </div>
      </div>
    </footer>
  );
}
