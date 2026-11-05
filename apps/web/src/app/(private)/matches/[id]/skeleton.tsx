import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonMatchLoading = () => {
  return (
    <div className="container flex flex-col gap-2 mx-auto p-2">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2 p-2 bg-zinc-800 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <Skeleton className="bg-zinc-700 h-6 w-48" />
          <Skeleton className="bg-zinc-700 h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="bg-zinc-700 h-4 w-20" />
          <Skeleton className="bg-zinc-700 h-4 w-4" />
          <Skeleton className="bg-zinc-700 h-4 w-24" />
        </div>
      </div>

      {/* Finalizador */}
      <div className="flex flex-col gap-4 bg-zinc-800 p-2 rounded-lg">
        <Skeleton className="bg-zinc-700 h-6 w-48" />
        <div className="flex items-start gap-2">
          <Skeleton className="bg-zinc-700 rounded-full w-16 h-16" />
          <div className="flex flex-col gap-2">
            <Skeleton className="bg-zinc-700 h-5 w-32" />
            <Skeleton className="bg-zinc-700 h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Jogadores */}
      <div className="flex flex-col gap-2 p-2 bg-zinc-800 rounded-lg shadow-md">
        <Skeleton className="bg-zinc-700 h-5 w-48" />
        <Skeleton className="bg-zinc-700 h-3 w-48" />
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
          {/* Time A */}
          <div className="flex flex-col gap-2 bg-zinc-900 p-2 rounded-lg">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="bg-zinc-700 rounded-full w-8 h-8" />
                <Skeleton className="bg-zinc-700 h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Versus */}
          <div className="flex items-center justify-center">
            <Skeleton className="bg-zinc-700 h-8 w-8 rounded-full" />
          </div>

          {/* Time B */}
          <div className="flex flex-col gap-2 bg-zinc-900 p-2 rounded-lg">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex flex-row-reverse gap-2">
                <Skeleton className="bg-zinc-700 rounded-full w-8 h-8" />
                <Skeleton className="bg-zinc-700 h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};