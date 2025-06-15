
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoveryPlaceCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-xl shadow-soft px-4 py-4 flex gap-3 items-start border border-[#E76F51]/10">
      <Skeleton className="w-16 h-16 rounded-md bg-[#dadada]/40 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
