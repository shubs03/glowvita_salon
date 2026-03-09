"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Badge } from "@repo/ui/badge";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2, 
  ArrowDownLeft, 
  ArrowUpRight,
  Wallet,
  Download
} from "lucide-react";
import { toast } from "sonner";

import { 
  useGetAdminTransactionsQuery 
} from "@repo/store/services/api";
import { useSelector } from "react-redux";
import { selectSelectedRegion } from "@repo/store/slices/adminAuthSlice";

interface WalletTransaction {
  _id: string;
  transactionId: string;
  userId: any;
  userName: string;
  userType: string;
  transactionType: "credit" | "debit";
  amount: number;
  source: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  description: string;
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
}

export function WalletTransactionsTab() {
  const selectedRegionId = useSelector(selectSelectedRegion);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");

  // RTK Query hook
  const { data: transactionResp, isLoading, refetch } = useGetAdminTransactionsQuery({
    page: currentPage,
    limit: itemsPerPage,
    type: filterType !== "all" ? filterType : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    userType: filterUserType !== "all" ? filterUserType : undefined,
    source: filterSource !== "all" ? filterSource : undefined,
    search: searchQuery || undefined,
    regionId: selectedRegionId || undefined,
  });

  const transactions = transactionResp?.data || [];
  const stats = transactionResp?.stats || {
    totalTransactions: 0,
    totalCredits: 0,
    totalDebits: 0,
    netFlow: 0,
  };
  const pagination = transactionResp?.pagination || { totalPages: 1, total: 0 };

  const fetchTransactions = () => {
    refetch();
  };

  // No longer need local filtering or pagination
  const paginatedTransactions = transactions;
  const totalPages = pagination.totalPages;
  const totalItems = pagination.total;

  const getSourceBadge = (source: string) => {
    const sourceMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      add_money: { label: "Add Money", variant: "default" },
      withdrawal: { label: "Withdrawal", variant: "secondary" },
      referral_bonus: { label: "Referral", variant: "outline" },
      booking_payment: { label: "Booking", variant: "destructive" },
      product_payment: { label: "Product", variant: "destructive" },
      refund: { label: "Refund", variant: "default" },
    };
    
    const config = sourceMap[source] || { label: source, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      completed: { label: "Completed", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
      failed: { label: "Failed", variant: "destructive" },
      cancelled: { label: "Cancelled", variant: "outline" },
    };
    
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    toast.info("Export feature coming soon");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Transaction History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor all wallet transactions across the platform
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{stats.totalCredits.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{stats.totalDebits.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{stats.netFlow.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user, transaction ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterUserType}
                onChange={(e) => { setFilterUserType(e.target.value); setCurrentPage(1); }}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="User">User</option>
                <option value="Vendor">Vendor</option>
                <option value="Doctor">Doctor</option>
                <option value="Supplier">Supplier</option>
              </select>
              <select
                value={filterSource}
                onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1); }}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Sources</option>
                <option value="add_money">Add Money</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="referral_bonus">Referral</option>
                <option value="booking_payment">Booking</option>
                <option value="product_payment">Product</option>
                <option value="refund">Refund</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <Button variant="outline" size="icon" onClick={fetchTransactions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <p className="text-muted-foreground font-medium text-lg">No transactions found</p>
                          {selectedRegionId ? (
                            <p className="text-sm text-muted-foreground mt-1">
                              Legacy records may only appear in "Global View".
                              Use the <span className="font-semibold text-primary">Sync Legacy Data</span> tool above to assign them.
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((transaction: WalletTransaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="font-mono text-xs">
                            {transaction.transactionId}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{transaction.userName}</div>
                            <Badge variant="outline" className="text-[10px] h-4 mt-0.5">
                              {transaction.userType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {transaction.transactionType === "credit" ? (
                                <ArrowDownLeft className="h-4 w-4 text-primary" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-primary" />
                              )}
                              <span className={transaction.transactionType === "credit" ? "text-primary" : "text-primary"}>
                                {transaction.transactionType === "credit" ? "Credit" : "Debit"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getSourceBadge(transaction.source)}</TableCell>
                          <TableCell className="font-semibold">
                            <span className={transaction.amount > 0 ? "text-primary" : "text-primary"}>
                              {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.description}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination
                  className="mt-4"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={totalItems}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
