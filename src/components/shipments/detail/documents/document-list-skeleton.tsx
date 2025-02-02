// src/components/shipments/details/documents/document-list-skeleton.tsx -->

import { Skeleton } from '../../../../../components/ui/skeleton';

export function DocumentListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="flex items-start space-x-4 p-4 border rounded-lg"
        >
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <div className="w-1 h-1 rounded-full bg-muted" />
              <Skeleton className="h-4 w-24" />
              <div className="w-1 h-1 rounded-full bg-muted" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}