
"use client";

import { useState, useMemo } from 'react';
import { Star, Check, Zap, RefreshCw } from 'lucide-react';
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { toast } from 'sonner';
import { useGetSubscriptionPlansQuery, useChangePlanMutation } from '@repo/store/api';

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
  userTypes?: string[];
}

interface Subscription {
  plan: {
    _id: string;
    name: string;
  };
  endDate: string;
}

interface SubscriptionPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription;
  userType?: 'vendor' | 'supplier' | 'doctor';
}

export function SubscriptionPlansDialog({ 
  open, 
  onOpenChange,
  subscription,
  userType = 'vendor'
}: SubscriptionPlansDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  const { data: plansResponse, isLoading: plansLoading } = useGetSubscriptionPlansQuery(undefined);
  const [changePlan, { isLoading: changingPlan }] = useChangePlanMutation();
  
  const isExpired = subscription?.endDate ? new Date(subscription.endDate) < new Date() : true;

  const availablePlans = useMemo(() => {
    if (!Array.isArray(plansResponse)) return [];
    
    return plansResponse
      .filter((plan: SubscriptionPlan) => {
        const isCorrectType = plan.planType === 'regular';
        const isActive = plan.status === 'Active';
        const isForPurchase = plan.isAvailableForPurchase;
        
        // Handle cases where userTypes might be empty or undefined
        const userTypes = plan.userTypes || [];
        const matchesUserType = userTypes.length === 0 || userTypes.includes(userType);
        
        // Fix: Don't filter out the current plan if it has expired
        const isNotCurrentActivePlan = isExpired ? true : plan._id !== subscription?.plan?._id;

        return isCorrectType && isActive && isForPurchase && matchesUserType && isNotCurrentActivePlan;
      })
      .sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.price - b.price);
  }, [plansResponse, userType, subscription, isExpired]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isExpired ? 'Renew Subscription' : 'Change Plan'}</DialogTitle>
          <DialogDescription>Choose a plan that best suits your needs</DialogDescription>
        </DialogHeader>
        
        <div className="relative py-8 px-2">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative grid md:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-3 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading plans...</p>
              </div>
            ) : availablePlans.length === 0 ? (
              <div className="col-span-3 py-8 text-center text-muted-foreground">
                No other plans available at the moment.
              </div>
            ) : (
              availablePlans.map((plan: SubscriptionPlan) => (
                <div
                  key={plan._id}
                  className={cn(
                    "group relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg",
                    selectedPlan?._id === plan._id 
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center">
                        <Star className="w-3 h-3 mr-1" fill="currentColor" /> Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center relative">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold">₹{plan.discountedPrice || plan.price}</span>
                      {plan.discountedPrice && (
                        <span className="text-lg text-muted-foreground line-through opacity-70">₹{plan.price}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">per {plan.duration} {plan.durationType}</p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedPlan?._id === plan._id && (
                    <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none">
                      <div className="absolute top-2 right-2 p-1.5 bg-primary text-white rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
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
