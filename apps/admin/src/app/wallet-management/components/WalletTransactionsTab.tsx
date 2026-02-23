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

interface WalletTransaction {
  _id: string;
  transactionId: string;
  userId: string;
  userName: string;
  transactionType: "credit" | "debit";
  amount: number;
  source: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  description: string;
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
}

const mockTransactions: WalletTransaction[] = [
  {
    _id: "1",
    transactionId: "WTX_1234567890_1234",
    userId: "user_1",
    userName: "John Doe",
    transactionType: "credit",
    amount: 1000,
    source: "add_money",
    status: "completed",
    description: "Add money to wallet - ₹1000",
    createdAt: "2024-01-15T10:30:00Z",
    balanceBefore: 500,
    balanceAfter: 1500,
  },
  {
    _id: "2",
    transactionId: "WTX_1234567891_5678",
    userId: "user_2",
    userName: "Jane Smith",
    transactionType: "debit",
    amount: -500,
    source: "withdrawal",
    status: "completed",
    description: "Withdrawal to bank account - ₹500",
    createdAt: "2024-01-15T09:15:00Z",
    balanceBefore: 2000,
    balanceAfter: 1500,
  },
  {
    _id: "3",
    transactionId: "WTX_1234567892_9012",
    userId: "user_3",
    userName: "Alice Johnson",
    transactionType: "credit",
    amount: 100,
    source: "referral_bonus",
    status: "completed",
    description: "Referral bonus for referring Bob",
    createdAt: "2024-01-14T16:45:00Z",
    balanceBefore: 0,
    balanceAfter: 100,
  },
  {
    _id: "4",
    transactionId: "WTX_1234567893_3456",
    userId: "user_1",
    userName: "John Doe",
    transactionType: "debit",
    amount: -200,
    source: "booking_payment",
    status: "completed",
    description: "Payment for salon booking",
    createdAt: "2024-01-14T14:20:00Z",
    balanceBefore: 700,
    balanceAfter: 500,
  },
  {
    _id: "5",
    transactionId: "WTX_1234567894_7890",
    userId: "user_4",
    userName: "Bob Williams",
    transactionType: "credit",
    amount: 50,
    source: "referral_bonus",
    status: "completed",
    description: "Welcome bonus for joining via referral",
    createdAt: "2024-01-14T11:00:00Z",
    balanceBefore: 0,
    balanceAfter: 50,
  },
];

export function WalletTransactionsTab() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all");

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/wallet/transactions');
      // const data = await response.json();
      
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTransactions(mockTransactions);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || transaction.transactionType === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ₹{transactions
                .filter((t) => t.transactionType === "credit")
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
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
              ₹{Math.abs(transactions
                .filter((t) => t.transactionType === "debit")
                .reduce((sum, t) => sum + t.amount, 0))
                .toLocaleString()}
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
              ₹{transactions
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
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
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
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
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="font-mono text-xs">
                            {transaction.transactionId}
                          </TableCell>
                          <TableCell>{transaction.userName}</TableCell>
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
