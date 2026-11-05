import { Skeleton } from "@/components/ui/skeleton";

export const SummarySkeleton = () => (
  <div className="w-full flex flex-col gap-4">
    <div className="flex flex-col gap-4 p-2 bg-zinc-800 rounded-lg">
      <div className="flex gap-2 items-center">
        <Skeleton className="w-12 h-12 rounded-full bg-zinc-700" />
        <Skeleton className="h-4 w-32 bg-zinc-700" />
      </div>

      <div className="flex flex-col p-2 gap-2">
        <Skeleton className="h-4 w-full bg-zinc-700" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full bg-zinc-700" />
          <Skeleton className="h-4 w-full bg-zinc-700" />
        </div>
      </div>

      <div className="w-full grid grid-cols-2 items-center rounded-b-lg py-4 px-2">
        <Skeleton className="h-4 w-20 bg-zinc-700" />
        <Skeleton className="h-6 w-12 bg-zinc-700" />
      </div>
    </div>
  </div>
);