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
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Coupons</p>
              <p className="text-2xl font-bold text-primary">{couponsData.length}</p>
              <p className="text-xs text-primary/70 mt-1">Total coupons created</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Tag className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Active Coupons</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {couponsData.filter(c => c.status === 'Active').length}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Currently usable by customers</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <CheckSquare className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Redeemed</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                {couponsData.reduce((acc, c) => acc + c.redeemed, 0)}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Total times coupons were applied</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Percent className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Discount Value</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                ₹{totalDiscountValue.toLocaleString()}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Estimated value of discounts</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <IndianRupee className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OffersStatsCards;