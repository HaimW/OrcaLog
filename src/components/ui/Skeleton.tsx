export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="flex gap-3">
        <div className="skeleton w-20 h-20 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2.5 py-1">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-4 w-40 rounded-full" />
          <div className="flex gap-2 mt-2">
            <div className="skeleton h-3 w-14 rounded-full" />
            <div className="skeleton h-3 w-14 rounded-full" />
            <div className="skeleton h-3 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card flex flex-col items-center gap-2 py-5">
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="skeleton h-7 w-12 rounded-full" />
      <div className="skeleton h-3 w-20 rounded-full" />
    </div>
  );
}

export function SkeletonText({ width = "100%", height = "1rem" }: { width?: string; height?: string }) {
  return (
    <div className="skeleton rounded-full" style={{ width, height }} />
  );
}
