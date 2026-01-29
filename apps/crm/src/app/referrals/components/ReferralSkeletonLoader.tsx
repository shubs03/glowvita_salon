import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";

const ReferralSkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Skeleton className="h-10 w-80" />
                </div>
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto no-scrollbar rounded-md border">
              <div className="h-96 flex items-center justify-center">
                <Skeleton className="h-10 w-64" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralSkeletonLoader;