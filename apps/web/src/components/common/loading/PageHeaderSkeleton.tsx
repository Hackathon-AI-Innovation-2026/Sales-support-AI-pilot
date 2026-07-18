import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-28" />
    </div>
  );
}
