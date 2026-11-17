// Hoisted out of render: Cache Components rejects unstable values during prerender.
const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto max-w-7xl px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <p>© {YEAR} Best Shop. All rights reserved.</p>
      </div>
    </footer>
  );
}
