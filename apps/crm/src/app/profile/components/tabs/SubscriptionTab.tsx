import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { RefreshCw, History, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { SubscriptionPlansDialog } from "@/components/SubscriptionPlansDialog";

type UserType = 'vendor' | 'supplier' | 'doctor';

interface Subscription {
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

export const SubscriptionTab = ({ subscription, userType = 'vendor' }: SubscriptionTabProps) => {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Calculate subscription status and days remaining
  const now = new Date();
  const endDate = subscription?.endDate ? new Date(subscription.endDate) : null;
  const startDate = subscription?.startDate ? new Date(subscription.startDate) : null;

  // Calculate days remaining and total days
  let daysLeft = 0;
  let totalDays = 0;
  let isExpired = true;

  if (endDate && startDate) {
    // Calculate time difference in days
    const timeDiff = endDate.getTime() - now.getTime();
    daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Calculate total subscription duration in days
    totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    // Determine if subscription is expired based on end date and status
    isExpired = subscription?.status === 'Expired' || daysLeft <= 0;
  }

  // Calculate progress percentage for the progress bar
  const progressPercentage = totalDays > 0
    ? Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100))
    : 0;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <h3 className="text-2xl font-bold">{subscription?.plan?.name || 'No Active Plan'}</h3>
              <p className="text-muted-foreground">
                {!isExpired ? `Expires on ${formatDate(subscription?.endDate)}` : 'Expired'}
              </p>
            </div>
            <div className="grid sm:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></span>
                  <p className="font-semibold">{isExpired ? 'Expired' : 'Active'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="mt-1 font-semibold">
                  {!isExpired ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Expired'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="mt-1 font-semibold">
                  {formatDate(subscription?.startDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="mt-1 font-semibold">
                  {formatDate(subscription?.endDate)}
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
                {!isExpired
                  ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
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
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
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
            {subscription?.history && subscription.history.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-sm font-medium">
                      <th className="p-3 border-b">Date</th>
                      <th className="p-3 border-b">Plan</th>
                      <th className="p-3 border-b">Payment Mode</th>
                      <th className="p-3 border-b text-right">Duration</th>
                      <th className="p-3 border-b text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscription.history.map((entry, index) => {
                      const startDate = new Date(entry.startDate);
                      const endDate = new Date(entry.endDate);
                      const historyDate = startDate;
                      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                      const isCurrent = entry.status === 'Active' && endDate > new Date();

                      return (
                        <tr
                          key={index}
                          className={`hover:bg-muted/50 transition-colors ${isCurrent && "bg-primary/5"}`}
                        >
                          <td className="p-3 border-b">
                            <div className="font-medium">
                              {historyDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {historyDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            <div className="font-medium">{entry.plan?.name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              {entry?.plan?.name?.includes('Trial') ? 'Free Trial' : 'Paid Plan'}
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            {'Online'}
                          </td>
                          <td className="p-3 border-b text-right">
                            {days} days
                          </td>
                          <td className="p-3 border-b text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.status.toLowerCase() === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.status}
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