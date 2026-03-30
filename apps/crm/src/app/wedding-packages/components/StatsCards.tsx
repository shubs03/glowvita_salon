import { Card, CardContent } from "@repo/ui/card";
import { Tag, DollarSign, Star, BarChart2 } from "lucide-react";

interface WeddingPackage {
  _id: string;
  name: string;
  description: string;
  services: any[];
  totalPrice: number;
  discountedPrice: number | null;
  duration: number;
  staffCount: number;
  assignedStaff: string[];
  image: string | null;
  status: string;
  rejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatsCardsProps {
  packages: WeddingPackage[];
}

export function StatsCards({ packages }: StatsCardsProps) {
  const averagePrice = packages.length > 0
    ? (packages.reduce((sum, pkg) => sum + pkg.totalPrice, 0) / packages.length).toFixed(0)
    : 0;

  const mostPopularServiceCount = packages.length > 0
    ? packages.reduce((prev, current) =>
      (prev.services.length > current.services.length) ? prev : current
    ).services.length
    : 0;

  const averageDuration = packages.length > 0
    ? Math.round(packages.reduce((sum, pkg) => sum + pkg.duration, 0) / packages.length / 60)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Packages</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{packages.length}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Active packages</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <Tag className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Avg. Price</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">₹{averagePrice}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Average package price</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <DollarSign className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Most Popular</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{mostPopularServiceCount}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Services in top package</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <Star className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Avg. Duration</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{averageDuration} Hour</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Average package duration</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <BarChart2 className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
