import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { RefreshCw, History, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { SubscriptionPlansDialog } from "@/components/SubscriptionPlansDialog";
import { useGetCrmSubscriptionPlansQuery } from "@repo/store/api";

type UserType = 'vendor' | 'supplier' | 'doctor';
type SubscriptionStatus = "Active" | "Scheduled" | "Expired";
type PlanRef = string | {
  _id?: string;
  $oid?: string;
  name?: string;
  planType?: 'trial' | 'regular';
};

interface Subscription {
  plan: PlanRef;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  purchaseDate?: string;
  history: Array<{
    plan: PlanRef;
    startDate: string;
    endDate: string;
    purchaseDate?: string;
    status: SubscriptionStatus;
  }>;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  planType?: 'trial' | 'regular';
  price?: number;
  discountedPrice?: number;
}

interface SubscriptionTabProps {
  subscription?: Subscription;
  userType?: UserType;
}

// Helper to format dates as "DD Month YYYY"
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const getTime = (dateString?: string) => {
  if (!dateString) return 0;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const getPlanId = (plan?: PlanRef) => {
  if (!plan) return '';
  if (typeof plan === 'string') return plan;
  return plan._id || plan.$oid || '';
};

const getPlanName = (plan?: PlanRef, planById?: Map<string, SubscriptionPlan>) => {
  if (!plan) return 'Unknown Plan';
  if (typeof plan !== 'string' && plan.name) return plan.name;

  const planId = getPlanId(plan);
  const matchedPlan = planId ? planById?.get(planId) : undefined;
  return matchedPlan?.name || (planId ? `Plan ${planId.slice(-6)}` : 'Unknown Plan');
};

const getPlanTypeLabel = (plan?: PlanRef, planById?: Map<string, SubscriptionPlan>) => {
  const planId = getPlanId(plan);
  const matchedPlan = planId ? planById?.get(planId) : undefined;
  const planName = getPlanName(plan, planById).toLowerCase();
  const planType = typeof plan === 'string' ? matchedPlan?.planType : plan?.planType || matchedPlan?.planType;

  return planType === 'trial' || planName.includes('trial') ? 'Free Trial' : 'Paid Plan';
};

export const SubscriptionTab = ({ subscription, userType = 'vendor' }: SubscriptionTabProps) => {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { data: plansResponse } = useGetCrmSubscriptionPlansQuery(undefined);

  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nowTime = now.getTime();

  const planById = React.useMemo(() => {
    const rawPlans = Array.isArray(plansResponse)
      ? plansResponse
      : Array.isArray((plansResponse as any)?.data)
        ? (plansResponse as any).data
        : [];

    return new Map<string, SubscriptionPlan>(
      rawPlans
        .filter((plan: SubscriptionPlan) => plan?._id)
        .map((plan: SubscriptionPlan) => [plan._id, plan])
    );
  }, [plansResponse]);

  const subscriptionEntries = React.useMemo(() => {
    if (!subscription) return [];

    const entries = [
      ...(subscription.history || []),
      {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        purchaseDate: subscription.purchaseDate,
        status: subscription.status,
      },
    ];

    const uniqueEntries = entries.filter((entry, index, allEntries) => {
      const key = `${getPlanId(entry.plan) || getPlanName(entry.plan, planById)}-${entry.startDate}-${entry.endDate}`;
      return allEntries.findIndex(item => {
        const itemKey = `${getPlanId(item.plan) || getPlanName(item.plan, planById)}-${item.startDate}-${item.endDate}`;
        return itemKey === key;
      }) === index;
    });

    uniqueEntries.sort((a, b) => getTime(a.startDate) - getTime(b.startDate));

    let hasActivePlan = false;
    return uniqueEntries.map(entry => {
      const startTime = getTime(entry.startDate);
      const endTime = getTime(entry.endDate);
      let displayStatus: SubscriptionStatus = "Expired";

      if (endTime > nowTime) {
        if (!hasActivePlan && startTime <= nowTime) {
          displayStatus = "Active";
          hasActivePlan = true;
        } else {
          displayStatus = "Scheduled";
        }
      }

      const planIdStr = getPlanId(entry.plan);
      const matchedPlan = planIdStr ? planById.get(planIdStr) : undefined;
      const planPrice = (matchedPlan?.discountedPrice && matchedPlan.discountedPrice > 0) ? matchedPlan.discountedPrice : (matchedPlan?.price || 0);

      return {
        ...entry,
        resolvedPlanName: getPlanName(entry.plan, planById),
        planTypeLabel: getPlanTypeLabel(entry.plan, planById),
        resolvedPlanPrice: planPrice,
        displayStatus,
      };
    });
  }, [subscription, nowTime, planById]);

  const activeEntry = subscriptionEntries.find(entry => entry.displayStatus === "Active");
  const visibleSubscription = activeEntry
    || subscriptionEntries.find(entry => entry.displayStatus === "Scheduled")
    || subscriptionEntries[subscriptionEntries.length - 1];
  const endDate = visibleSubscription?.endDate ? new Date(visibleSubscription.endDate) : null;
  const startDate = visibleSubscription?.startDate ? new Date(visibleSubscription.startDate) : null;
  const currentStatus = visibleSubscription?.displayStatus || "Expired";

  let daysLeft = 0;
  let totalDays = 0;

  if (endDate && startDate) {
    const timeDiff = endDate.getTime() - now.getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  }

  const progressPercentage = totalDays > 0
    ? Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100))
    : 0;

  const isExpired = currentStatus === "Expired";
  const isScheduled = currentStatus === "Scheduled";
  const startsInDays = startDate
    ? Math.max(0, Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 3600 * 24)))
    : 0;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDotColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Scheduled":
        return "bg-blue-500";
      case "Expired":
      default:
        return "bg-red-500";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Subscription</CardTitle>
          <CardDescription>
            Details about your current plan and billing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">{visibleSubscription?.resolvedPlanName || 'No Active Plan'}</h3>
              <p className="text-muted-foreground">
                {currentStatus === "Active"
                  ? `Expires on ${formatDate(visibleSubscription?.endDate)}`
                  : currentStatus === "Scheduled"
                    ? `Starts on ${formatDate(visibleSubscription?.startDate)}`
                    : 'Expired'}
              </p>
            </div>
            <div className="grid sm:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${getStatusDotColor(currentStatus)}`}></span>
                  <p className="font-semibold">{currentStatus}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isScheduled ? 'Starts In' : 'Days Remaining'}</p>
                <p className="mt-1 font-semibold">
                  {currentStatus === "Active"
                    ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                    : currentStatus === "Scheduled" && startDate
                      ? `${startsInDays} day${startsInDays !== 1 ? 's' : ''}`
                      : 'Expired'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="mt-1 font-semibold">
                  {formatDate(visibleSubscription?.startDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="mt-1 font-semibold">
                  {formatDate(visibleSubscription?.endDate)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">Subscription Progress</p>
              <div className="w-full bg-secondary rounded-full h-2.5 mt-1">
                <div
                  className={`h-2.5 rounded-full ${daysLeft <= 7 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1">
                {currentStatus === "Active"
                  ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                  : currentStatus === "Scheduled"
                    ? 'Purchased and waiting for the current plan to finish'
                    : 'Subscription ' + (daysLeft === 0 ? 'expires today' : 'expired')}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setShowPlansModal(true)} className="h-12 px-6 rounded-lg bg-primary hover:bg-primary/90">
                <RefreshCw className="mr-2 h-4 w-4" />
                {isExpired ? 'Renew Subscription' : 'Change Plan'}
              </Button>
              <Button variant="outline" onClick={() => setShowHistoryModal(true)} className="h-12 px-6 rounded-lg border-border hover:border-primary">
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {subscription && (
        <SubscriptionPlansDialog
          open={showPlansModal}
          onOpenChange={setShowPlansModal}
          subscription={subscription}
          userType={userType}
        />
      )}

      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">Subscription History</DialogTitle>
                <DialogDescription>
                  Your complete subscription payment history
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2">
            {subscriptionEntries.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-sm font-medium">
                      <th className="p-3 border-b whitespace-nowrap">Purchase Date</th>
                      <th className="p-3 border-b whitespace-nowrap">Start Date</th>
                      <th className="p-3 border-b whitespace-nowrap">End Date</th>
                      <th className="p-3 border-b">Plan</th>
                      <th className="p-3 border-b text-right whitespace-nowrap">Price</th>
                      <th className="p-3 border-b whitespace-nowrap">Payment Mode</th>
                      <th className="p-3 border-b text-right">Duration</th>
                      <th className="p-3 border-b text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionEntries.map((entry, index) => {
                      const startDate = new Date(entry.startDate);
                      const endDate = new Date(entry.endDate);
                      const purchaseDate = entry.purchaseDate ? new Date(entry.purchaseDate) : null;
                      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                      const isCurrent = entry.displayStatus === 'Active';

                      return (
                        <tr
                          key={index}
                          className={`hover:bg-muted/50 transition-colors ${isCurrent && "bg-primary/5"}`}
                        >
                          <td className="p-3 border-b">
                            {purchaseDate ? (
                              <>
                                <div className="font-medium">
                                  {purchaseDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {purchaseDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 border-b">
                            <div className="font-medium whitespace-nowrap">
                              {startDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {startDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            <div className="font-medium whitespace-nowrap">
                              {endDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {endDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            <div className="font-medium">{entry.resolvedPlanName}</div>
                            <div className="text-xs text-muted-foreground">
                              {entry.planTypeLabel}
                            </div>
                          </td>
                          <td className="p-3 border-b text-right">
                            ₹{(entry.resolvedPlanPrice || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 border-b">
                            {'Online'}
                          </td>
                          <td className="p-3 border-b text-right">
                            {days} days
                          </td>
                          <td className="p-3 border-b text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusColor(entry.displayStatus)
                            }`}>
                              {entry.displayStatus}
                              {isCurrent && (
                                <span className="ml-1">• Current</span>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No subscription history</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  You don't have any subscription history yet. Your subscription details will appear here.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowHistoryModal(false)}
              className="h-12 px-6 rounded-lg border-border hover:border-primary w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
