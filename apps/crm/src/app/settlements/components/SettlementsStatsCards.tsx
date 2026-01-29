import { Card, CardContent } from "@repo/ui/card";
import { DollarSign, Hourglass, Users, RefreshCw } from 'lucide-react';
import { PayoutData } from "./SettlementsTable";

interface SettlementsStatsCardsProps {
  payouts: PayoutData[];
}

const SettlementsStatsCards = ({ payouts }: SettlementsStatsCardsProps) => {
  const totalPaid = payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.adminPayAmount, 0);
  const totalPending = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.pendingAmount, 0);
  const pendingVendors = payouts.filter(p => p.status === 'Pending').length;
  const totalTransactions = payouts.reduce((sum, p) => sum + p.transactions.length, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Total Paid Out</p>
              <p className="text-2xl font-bold text-primary">₹{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-primary/70 mt-1">All-time paid to vendors</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Pending</p>
              <p className="text-2xl font-bold text-secondary-foreground">
                ₹{totalPending.toLocaleString()}
              </p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Across all vendors</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Hourglass className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary mb-1">Vendors with Pending</p>
              <p className="text-2xl font-bold text-primary">{pendingVendors}</p>
              <p className="text-xs text-primary/70 mt-1">Vendors to be paid</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="group relative overflow-hidden bg-primary/5 border border-primary/20 transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-foreground mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-secondary-foreground">{totalTransactions}</p>
              <p className="text-xs text-secondary-foreground/70 mt-1">Total pay and receive entries</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full transition-colors">
              <RefreshCw className="h-6 w-6 text-secondary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettlementsStatsCards;