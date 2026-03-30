"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { 
  Wallet, 
  Settings, 
  ArrowLeftRight, 
  ArrowUpRight,
  IndianRupee,
  RefreshCw,
  Database,
  ArrowDownLeft,
} from "lucide-react";
import { toast } from "sonner";

// Import tab components
import { WalletSettingsTab } from "./components/WalletSettingsTab";
import { WalletTransactionsTab } from "./components/WalletTransactionsTab";
import { WalletWithdrawalsTab } from "./components/WalletWithdrawalsTab";
import { useAppSelector } from "@repo/store/hooks";
import { selectSelectedRegion, selectCurrentAdmin } from "@repo/store/slices/adminAuthSlice";
import { useGetAdminTransactionsQuery, useGetAdminWithdrawalsQuery } from "@repo/store/services/api";
import { Button } from "@repo/ui/button";

export default function WalletManagementPage() {
  const selectedRegion = useAppSelector(selectSelectedRegion);
  const admin = useAppSelector(selectCurrentAdmin);
  const userRole = admin?.roleName || admin?.role;

  const { data: transactionResp, refetch: refetchTransactions } = useGetAdminTransactionsQuery({
    regionId: selectedRegion || undefined,
    limit: 1
  });

  const { data: withdrawalResp, refetch: refetchWithdrawals } = useGetAdminWithdrawalsQuery({
    regionId: selectedRegion || undefined,
    limit: 1,
    status: 'pending'
  });

  const [isMigrating, setIsMigrating] = React.useState(false);

  const handleFixLegacyData = async () => {
    setIsMigrating(true);
    try {
      const response = await fetch('/api/admin/wallet-migrate', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Data fixed: ${result.details.updatedTransactions} transactions and ${result.details.updatedWithdrawals} withdrawals updated.`);
        refetchTransactions();
        refetchWithdrawals();
      } else {
        toast.error(result.message || "Failed to fix legacy data");
      }
    } catch (error) {
      toast.error("An error occurred during migration");
    } finally {
      setIsMigrating(false);
    }
  };

  const walletStats = transactionResp?.stats || {
    totalTransactions: 0,
    totalCredits: 0,
    totalDebits: 0,
    netFlow: 0,
  };

  const withdrawalStats = withdrawalResp?.stats || {
    total: 0,
    pending: 0,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            Wallet Management
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Monitor wallet transactions, manage withdrawal requests, and configure wallet settings.
          </p>
        </div>

        {(userRole === 'SUPER_ADMIN' || userRole === 'superadmin') && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFixLegacyData} 
            disabled={isMigrating}
            className="flex items-center gap-2"
          >
            <Database className={`h-4 w-4 ${isMigrating ? 'animate-spin' : ''}`} />
            {isMigrating ? "Fixing Data..." : "Sync Legacy Data"}
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Wallet Flow</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${walletStats.netFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{walletStats.netFlow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Completed transactions only</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletStats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">In selected region</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawal Volume</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{walletStats.totalDebits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total debits processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withdrawalStats.pending}</div>
            <p className="text-xs text-orange-600">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
            <span className="sm:hidden">Txns</span>
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            <span className="hidden sm:inline">Withdrawals</span>
            <span className="sm:hidden">Withdraw</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <WalletTransactionsTab />
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <WalletWithdrawalsTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <WalletSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
