import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TablePageSkeletonProps = {
  withHeader?: boolean;
  columns?: number;
  rows?: number;
};

const TablePageSkeleton = ({ withHeader = true, columns = 7, rows = 8 }: TablePageSkeletonProps) => {
  return (
    <div className="space-y-6">
      {withHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      )}

      <div className="flex gap-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-40" />
      </div>

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, idx) => (
                <Skeleton key={`header-${idx}`} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="grid gap-3 py-2"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns }).map((__, colIndex) => (
                  <Skeleton key={`row-${rowIndex}-col-${colIndex}`} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TablePageSkeleton;
