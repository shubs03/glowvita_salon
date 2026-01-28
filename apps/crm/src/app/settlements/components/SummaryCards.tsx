import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { DollarSign, Hourglass, Users, RefreshCw } from 'lucide-react';

interface SummaryCardsProps {
  totalPaid: number;
  totalPending: number;
  pendingVendors: number;
  totalTransactions: number;
}

export function SummaryCards({ 
  totalPaid, 
  totalPending, 
  pendingVendors, 
  totalTransactions 
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">All-time paid to vendors</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all vendors</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendors with Pending</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingVendors}</div>
          <p className="text-xs text-muted-foreground">Vendors to be paid</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTransactions}</div>
          <p className="text-xs text-muted-foreground">Total pay and receive entries</p>
        </CardContent>
      </Card>
    </div>
  );
}