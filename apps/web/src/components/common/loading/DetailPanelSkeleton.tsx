import { Skeleton } from "@/components/ui/skeleton";

export function DetailPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
