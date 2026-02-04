import { Card, CardContent } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
            Wedding Packages
          </h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
