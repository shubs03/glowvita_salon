import { useState } from 'react';
import { Star, Check, History, Zap, RefreshCw } from 'lucide-react';
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { toast } from 'sonner';
import { useGetSubscriptionPlansQuery, useChangePlanMutation, useRenewPlanMutation } from '@repo/store/api';

interface SubscriptionPlan {
  _id: string;
  name: string;
  duration: number;
  durationType: string;
  price: number;
  discountedPrice?: number;
  features: string[];
  isAvailableForPurchase: boolean;
  planType: 'trial' | 'regular';
  status: 'Active' | 'Inactive';
  isFeatured?: boolean;
}

interface SubscriptionTabProps {
  subscription: {
    plan: {
      _id: string;
      name: string;
    };
    status: "Active" | "Expired";
    startDate: string;
    endDate: string;
    history: Array<{
      plan: {
        _id: string;
        name: string;
      };
      startDate: string;
      endDate: string;
      status: "Active" | "Expired";
    }>;
  };
  userType?: 'vendor' | 'supplier' | 'doctor';
}

export function SubscriptionPlansDialog({ 
  open, 
  onOpenChange,
  subscription,
  userType = 'vendor'
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionTabProps['subscription'];
  userType?: SubscriptionTabProps['userType'];
}) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const { data: availablePlans = [], isLoading: plansLoading } = useGetSubscriptionPlansQuery(userType);
  const [changePlan, { isLoading: changingPlan }] = useChangePlanMutation();
  
  const isExpired = new Date(subscription?.endDate) < new Date();
  const isLoading = plansLoading || changingPlan;

  const handlePlanChange = async () => {
    if (!selectedPlan) return;

    try {
      await changePlan({
        planId: selectedPlan._id,
        userType: userType
      }).unwrap();
      
      toast.success('Subscription plan changed successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to change subscription plan');
    }
  };

  const regularPlans = availablePlans
    .filter(plan => 
      plan.planType === 'regular' && 
      plan.status === 'Active' && 
      !plan.name.toLowerCase().includes('trial')
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>{isExpired ? 'Renew Subscription' : 'Change Plan'}</DialogTitle>
          <DialogDescription>
            Choose a plan that best suits your needs
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative py-8 px-2">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative grid md:grid-cols-3 gap-8">
            {regularPlans.map((plan, index) => (
              <div
                key={plan._id}
                className={cn(
                  "group relative p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:translate-y-[-4px]",
                  selectedPlan?._id === plan._id
                    ? "bg-gradient-to-b from-primary/20 to-primary/5 shadow-2xl shadow-primary/20"
                    : "bg-gradient-to-b from-card to-background border hover:border-primary/50 hover:shadow-xl"
                )}
                onClick={() => setSelectedPlan(plan)}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Popular badge */}
                {plan.isFeatured && (
                  <div className="absolute -top-5 inset-x-0 flex items-center justify-center">
                    <div className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-semibold text-sm shadow-lg flex items-center">
                      <Star className="w-4 h-4 mr-1" fill="currentColor" /> Most Popular
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center relative">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    {plan.name}
                  </h3>
                  
                  <div className="mt-6 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold">₹{plan.discountedPrice || plan.price}</span>
                      {plan.discountedPrice && (
                        <span className="text-lg text-muted-foreground line-through opacity-70">₹{plan.price}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      per {plan.durationType.slice(0, -1)}
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    <Badge variant="outline" className="px-3 py-1 bg-background/50">
                      {plan.duration} {plan.durationType}
                    </Badge>
                    {plan.discountedPrice && (
                      <Badge variant="default" className="px-3 py-1 bg-green-600">
                        Save {Math.round(((plan.price - plan.discountedPrice) / plan.price) * 100)}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Features list */}
                <div className="mt-8 space-y-4">
                  {plan.features?.map((feature, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-colors",
                        selectedPlan?._id === plan._id
                          ? "bg-primary/10"
                          : "bg-background/50 group-hover:bg-primary/5"
                      )}
                    >
                      <div className="rounded-full p-1 bg-primary/10 shrink-0">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <div className="mt-8">
                  <Button 
                    variant={selectedPlan?._id === plan._id ? "default" : "outline"}
                    className="w-full relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {selectedPlan?._id === plan._id ? 'Selected Plan' : 'Choose Plan'}
                    </span>
                    {selectedPlan?._id === plan._id && (
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary animate-shimmer" />
                    )}
                  </Button>
                </div>

                {/* Selection indicator */}
                {selectedPlan?._id === plan._id && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none">
                    <div className="absolute top-0 right-0 p-2">
                      <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePlanChange} 
            disabled={!selectedPlan || isLoading}
            className="relative overflow-hidden"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isExpired ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Renew Now
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Confirm Change
                  </>
                )}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
