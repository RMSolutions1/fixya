export function MarketplaceSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
