import { Skeleton } from "@/components/ui/skeleton";

export const HeaderSkeleton = () => (
  <div className="w-full flex flex-col gap-2 p-2 border-b border-zinc-700">
    <div className="grid grid-cols-[1fr_auto] gap-4">
      <div className="flex gap-2">
        <Skeleton className="rounded-full w-16 h-16 bg-zinc-700" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32 bg-zinc-700" />
          <Skeleton className="h-3 w-24 bg-zinc-700" />
        </div>
      </div>
      <Skeleton className="w-24 h-10 bg-zinc-700" />
    </div>

    <div className="flex justify-between">
      <Skeleton className="h-4 w-20 bg-zinc-700" />
      <Skeleton className="h-4 w-20 bg-zinc-700" />
      <Skeleton className="h-4 w-20 bg-zinc-700" />
    </div>
  </div>
);