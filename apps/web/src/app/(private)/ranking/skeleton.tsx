import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonTabs = () => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full grid grid-cols-3 gap-1 p-1 bg-zinc-800 rounded-full">
        <Skeleton className="rounded-full p-4 bg-zinc-700" />
        <Skeleton className="rounded-full p-4 bg-zinc-700" />
        <Skeleton className="rounded-full p-4 bg-zinc-700" />
      </div>
    </div>
  );
};

export const SkeletonRanking = () => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full h-[88px] flex gap-4 bg-zinc-800 rounded-lg p-4">
        <Skeleton className="relative min-w-14 min-h-14 rounded-full bg-zinc-700">
          <Skeleton className="w-6 h-6 absolute -left-2 -top-2 rounded-full bg-zinc-600" />
        </Skeleton>
        <div className="flex flex-col gap-2">
          <Skeleton className="bg-zinc-700 w-32 h-4" />
          <Skeleton className="bg-zinc-700 w-20 h-4" />
        </div>
        <div className="w-full flex flex-col items-end gap-2">
          <Skeleton className="bg-zinc-700 w-12 h-4" />
          <Skeleton className="bg-zinc-700 w-20 h-4" />
        </div>
      </div>
    </div>
  );
};
