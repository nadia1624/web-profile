export default function Loading() {
  return (
    <div className="w-full min-h-screen max-w-7xl mx-auto px-6 py-20 animate-pulse space-y-12">
      {/* Hero skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <div className="h-4 w-32 bg-secondary/80 rounded-full" />
          <div className="h-10 w-3/4 bg-secondary/80 rounded-xl" />
          <div className="h-6 w-1/2 bg-secondary/80 rounded-lg" />
          <div className="h-20 w-full bg-secondary/80 rounded-xl mt-6" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-40 bg-purple-500/20 rounded-full" />
            <div className="h-12 w-36 bg-secondary/80 rounded-full" />
          </div>
        </div>
        <div className="md:col-span-5 flex justify-center">
          <div className="w-72 h-80 bg-secondary/80 rounded-3xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="space-y-6 pt-12">
        <div className="h-8 w-48 bg-secondary/80 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-64 bg-secondary/60 rounded-2xl" />
          <div className="h-64 bg-secondary/60 rounded-2xl" />
          <div className="h-64 bg-secondary/60 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
