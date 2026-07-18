import { Skeleton } from "@/components/ui/skeleton";

type TableSkeletonProps = {
  columns?: number;
  rows?: number;
};

export function TableSkeleton({ columns = 6, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid gap-4 border-b p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-4 w-full" />)}
      </div>
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (_, columnIndex) => <Skeleton key={columnIndex} className="h-5 w-full" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
