import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonAddFriends = () => {
  return (
    <div className="flex gap-4 p-2 justify-between rounded bg-zinc-800">
      <div className="flex gap-2">
        <Skeleton className="w-12 h-12 rounded-full bg-zinc-700" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-36 h-4 bg-zinc-700" />
          <Skeleton className="w-24 h-3 bg-zinc-700" />
        </div>
      </div>

      <Skeleton className="w-24 h-8 bg-zinc-700" />
    </div>
  );
};

export default SkeletonAddFriends;
