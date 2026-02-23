import { Card, CardContent } from "@repo/ui/card";
import { Tag, CheckSquare, Percent, IndianRupee } from "lucide-react";

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: string;
  startDate: string;
  expires: string;
  redeemed: number;
  applicableSpecialties: string[];
  applicableCategories: string[];
  applicableDiseases: string[];
  applicableServices: string[];
  applicableServiceCategories: string[];
  minOrderAmount?: number;
  offerImage?: string;
  isCustomCode?: boolean;
  businessType: string;
  businessId: string;
}

interface OffersStatsCardsProps {
  couponsData: Coupon[];
}

const OffersStatsCards = ({ couponsData }: OffersStatsCardsProps) => {
  // Calculate total discount value
  const totalDiscountValue = couponsData.reduce((acc, coupon) => {
    if (coupon.type === 'fixed') {
      return acc + coupon.value * coupon.redeemed;
    }
    // Assuming average order value of 1000 for percentage calculations
    return acc + (1000 * (coupon.value / 100)) * coupon.redeemed;
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Coupons</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">{couponsData.length}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Total coupons created</p>
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
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Active Coupons</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {couponsData.filter(c => c.status === 'Active').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Currently usable by customers</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <CheckSquare className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Redeemed</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                {couponsData.reduce((acc, c) => acc + c.redeemed, 0)}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Total times coupons were applied</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <Percent className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 dark:bg-secondary/10 dark:border-secondary/30 dark:hover:border-secondary/50 dark:hover:shadow-secondary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1 dark:text-secondary-foreground">Total Discount Value</p>
              <p className="text-2xl font-bold text-secondary-foreground dark:text-secondary-foreground">
                ₹{totalDiscountValue.toLocaleString()}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1 dark:text-secondary-foreground/70">Estimated value of discounts</p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-secondary/20 rounded-full transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-secondary/30">
              <IndianRupee className="h-6 w-6 text-secondary-foreground dark:text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OffersStatsCards;