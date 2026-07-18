import { Skeleton } from "@/components/ui/skeleton";

type CardGridSkeletonProps = {
  cards?: number;
};

export function CardGridSkeleton({ cards = 4 }: CardGridSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-lg border bg-card p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
