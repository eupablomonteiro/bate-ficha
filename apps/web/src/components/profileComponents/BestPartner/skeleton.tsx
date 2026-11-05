import { Skeleton } from "@/components/ui/skeleton";

export const BestPartnerSkeleton = () => (
  <div className="w-full flex flex-col gap-4 px-2 pt-8 mt-8 border-t border-zinc-700">
    <Skeleton className="h-4 w-32 bg-zinc-700" />
    <div className="flex flex-col justify-center items-center gap-2 p-2 bg-zinc-800 rounded-md">
      <Skeleton className="w-16 h-16 rounded-full bg-zinc-700" />
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-24 bg-zinc-700" />
        <Skeleton className="h-3 w-16 bg-zinc-700" />
      </div>
    </div>
  </div>
); 