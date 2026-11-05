import React from "react";
import { Skeleton } from "../ui/skeleton";

export const SkeletonHistoryMatchesSolo = () => {
  return (
    <div className="flex flex-col flex-wrap min-w-full rounded-md bg-zinc-800">
      <div className="text-md flex items-center justify-between py-2 px-2 border-b-2 border-zinc-800">
        <Skeleton className="w-28 h-8 bg-zinc-700" />
        <button className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 bg-zinc-700 rounded-full" />
          <Skeleton className="w-28 h-6 bg-zinc-700" />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-2 text-zinc-200">
        <div className="flex flex-col items-start gap-2">
          <Skeleton className="w-16 h-4 bg-zinc-700" />
          <Skeleton className="w-28 h-4 rounded bg-zinc-700" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="w-12 h-12 bg-zinc-700" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="w-16 h-4 bg-zinc-700" />
          <Skeleton className="w-28 h-4 bg-zinc-700" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonHistoryMatchesTeam = () => {
  return (
    <div className="flex flex-col flex-wrap min-w-full rounded-md bg-zinc-800">
      <div className="text-md flex items-center justify-between py-2 px-2 border-b-2 border-zinc-800">
        <Skeleton className="w-28 h-8 bg-zinc-700" />
        <button className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 bg-zinc-700 rounded-full" />
          <Skeleton className="w-28 h-6 bg-zinc-700" />
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-2 text-zinc-200">
        <div className="flex flex-col items-start gap-2">
          <Skeleton className="w-16 h-4 bg-zinc-700" />
          <Skeleton className="w-16 h-4 bg-zinc-700" />
          <Skeleton className="w-28 h-4 rounded bg-zinc-700" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="w-12 h-12 bg-zinc-700" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="w-16 h-4 bg-zinc-700" />
          <Skeleton className="w-16 h-4 bg-zinc-700" />
          <Skeleton className="w-28 h-4 bg-zinc-700" />
        </div>
      </div>
    </div>
  );
};
