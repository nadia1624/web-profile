export default function ProjectsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 animate-pulse space-y-12">
      {/* Header skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="h-4 w-28 bg-purple-500/20 rounded-full mx-auto" />
        <div className="h-10 w-64 bg-secondary/80 rounded-xl mx-auto" />
        <div className="h-4 w-96 bg-secondary/60 rounded-lg mx-auto" />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex justify-center gap-3">
        <div className="h-9 w-24 bg-purple-600/30 rounded-xl" />
        <div className="h-9 w-32 bg-secondary/60 rounded-xl" />
        <div className="h-9 w-28 bg-secondary/60 rounded-xl" />
      </div>

      {/* Projects grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-panel p-4 rounded-2xl border border-border space-y-4">
            <div className="w-full aspect-video bg-secondary/80 rounded-xl" />
            <div className="h-6 w-3/4 bg-secondary/80 rounded-lg" />
            <div className="h-4 w-1/2 bg-secondary/60 rounded-md" />
            <div className="h-12 w-full bg-secondary/50 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
