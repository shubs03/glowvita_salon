"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@repo/ui/dialog";
import { 
  Search, 
  RefreshCw, 
  Loader2, 
  ArrowUpRight,
  Banknote,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface WalletWithdrawal {
  _id: string;
  withdrawalId: string;
  userId: string;
  userName: string;
  amount: number;
  withdrawalFee: number;
  netAmount: number;
  bankDetails: {
    accountNumber?: string;
    ifsc?: string;
    accountHolderName: string;
    bankName?: string;
    upiId?: string;
  };
  status: "pending" | "processing" | "completed" | "failed" | "rejected_by_system" | "cancelled";
  riskScore: number;
  riskFlags: string[];
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  failureReason?: string;
}

const mockWithdrawals: WalletWithdrawal[] = [
  {
    _id: "1",
    withdrawalId: "WD_1234567890_1234",
    userId: "user_1",
    userName: "John Doe",
    amount: 5000,
    withdrawalFee: 0,
    netAmount: 5000,
    bankDetails: {
      accountNumber: "****1234",
      ifsc: "SBIN0001234",
      accountHolderName: "John Doe",
      bankName: "State Bank of India",
    },
    status: "completed",
    riskScore: 15,
    riskFlags: [],
    requestedAt: "2024-01-15T10:30:00Z",
    processedAt: "2024-01-15T10:35:00Z",
    completedAt: "2024-01-15T11:00:00Z",
  },
  {
    _id: "2",
    withdrawalId: "WD_1234567891_5678",
    userId: "user_2",
    userName: "Jane Smith",
    amount: 10000,
    withdrawalFee: 50,
    netAmount: 9950,
    bankDetails: {
      accountNumber: "****5678",
      ifsc: "HDFC0005678",
      accountHolderName: "Jane Smith",
      bankName: "HDFC Bank",
    },
    status: "processing",
    riskScore: 25,
    riskFlags: ["large_amount"],
    requestedAt: "2024-01-15T09:15:00Z",
    processedAt: "2024-01-15T09:20:00Z",
  },
  {
    _id: "3",
    withdrawalId: "WD_1234567892_9012",
    userId: "user_3",
    userName: "Alice Johnson",
    amount: 2500,
    withdrawalFee: 0,
    netAmount: 2500,
    bankDetails: {
      accountNumber: "****9012",
      ifsc: "ICIC0009012",
      accountHolderName: "Alice Johnson",
      bankName: "ICICI Bank",
    },
    status: "rejected_by_system",
    riskScore: 85,
    riskFlags: ["new_account", "rapid_withdrawal", "first_transaction_withdrawal"],
    requestedAt: "2024-01-14T16:45:00Z",
    rejectionReason: "High risk transaction detected: new_account, rapid_withdrawal",
  },
  {
    _id: "4",
    withdrawalId: "WD_1234567893_3456",
    userId: "user_4",
    userName: "Bob Williams",
    amount: 15000,
    withdrawalFee: 0,
    netAmount: 15000,
    bankDetails: {
      accountNumber: "****3456",
      ifsc: "AXIS0003456",
      accountHolderName: "Bob Williams",
      bankName: "Axis Bank",
    },
    status: "pending",
    riskScore: 45,
    riskFlags: ["large_percentage_withdrawal"],
    requestedAt: "2024-01-14T14:20:00Z",
  },
  {
    _id: "5",
    withdrawalId: "WD_1234567894_7890",
    userId: "user_5",
    userName: "Charlie Brown",
    amount: 3000,
    withdrawalFee: 0,
    netAmount: 3000,
    bankDetails: {
      accountNumber: "****7890",
      ifsc: "PNB0007890",
      accountHolderName: "Charlie Brown",
      bankName: "Punjab National Bank",
    },
    status: "failed",
    riskScore: 20,
    riskFlags: [],
    requestedAt: "2024-01-14T11:00:00Z",
    processedAt: "2024-01-14T11:05:00Z",
    failureReason: "Bank account validation failed",
  },
];

export function WalletWithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<WalletWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "processing" | "completed" | "failed" | "rejected">("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WalletWithdrawal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/wallet/withdrawals');
      // const data = await response.json();
      
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setWithdrawals(mockWithdrawals);
    } catch (error) {
      toast.error("Failed to load withdrawals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch = 
      withdrawal.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.withdrawalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.bankDetails.accountHolderName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || withdrawal.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalItems = filteredWithdrawals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
      pending: { label: "Pending", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      processing: { label: "Processing", variant: "default", icon: <Clock className="h-3 w-3" /> },
      completed: { label: "Completed", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      failed: { label: "Failed", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      rejected_by_system: { label: "Rejected", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
      cancelled: { label: "Cancelled", variant: "outline", icon: <XCircle className="h-3 w-3" /> },
    };
    
    const config = statusMap[status] || { label: status, variant: "outline", icon: null };
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> High ({score})</Badge>;
    } else if (score >= 40) {
      return <Badge variant="secondary" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Medium ({score})</Badge>;
    }
    return <Badge variant="outline" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Low ({score})</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (withdrawal: WalletWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailModal(true);
  };

  // Calculate stats
  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "pending").length,
    processing: withdrawals.filter((w) => w.status === "processing").length,
    completed: withdrawals.filter((w) => w.status === "completed").length,
    failed: withdrawals.filter((w) => w.status === "failed" || w.status === "rejected_by_system").length,
    totalAmount: withdrawals
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.amount, 0),
    highRisk: withdrawals.filter((w) => w.riskScore >= 70).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Withdrawal Monitoring
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage all wallet withdrawal requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Paid</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">₹{stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{stats.highRisk}</div>
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
                placeholder="Search by user, withdrawal ID, or account holder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="rejected_by_system">Rejected</option>
              </select>
              <Button variant="outline" size="icon" onClick={fetchWithdrawals}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals Table */}
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
                      <TableHead>Withdrawal ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedWithdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No withdrawals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedWithdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal._id}>
                          <TableCell className="font-mono text-xs">
                            {withdrawal.withdrawalId}
                          </TableCell>
                          <TableCell>{withdrawal.userName}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{withdrawal.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₹{withdrawal.netAmount.toLocaleString()}
                            {withdrawal.withdrawalFee > 0 && (
                              <span className="text-xs text-muted-foreground block">
                                Fee: ₹{withdrawal.withdrawalFee}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{withdrawal.bankDetails.bankName || 'UPI'}</div>
                            <div className="text-xs text-muted-foreground">
                              {withdrawal.bankDetails.upiId ? withdrawal.bankDetails.upiId : withdrawal.bankDetails.accountNumber}
                            </div>
                          </TableCell>
                          <TableCell>{getRiskBadge(withdrawal.riskScore)}</TableCell>
                          <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(withdrawal.requestedAt)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(withdrawal)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>
              Detailed information about this withdrawal request
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawal ID</p>
                  <p className="font-mono text-sm">{selectedWithdrawal.withdrawalId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold">₹{selectedWithdrawal.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Amount</p>
                  <p className="text-lg font-semibold">₹{selectedWithdrawal.netAmount.toLocaleString()}</p>
                </div>
              </div>

              {selectedWithdrawal.withdrawalFee > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawal Fee</p>
                  <p>₹{selectedWithdrawal.withdrawalFee}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Bank/UPI Details</p>
                <div className="bg-secondary p-3 rounded-lg mt-1">
                  <p className="font-medium">{selectedWithdrawal.bankDetails.accountHolderName}</p>
                  {selectedWithdrawal.bankDetails.upiId ? (
                     <>
                        <p className="text-sm">UPI Payment</p>
                        <p className="text-sm text-muted-foreground">{selectedWithdrawal.bankDetails.upiId}</p>
                     </>
                  ) : (
                    <>
                        <p className="text-sm">{selectedWithdrawal.bankDetails.bankName}</p>
                        <p className="text-sm text-muted-foreground">{selectedWithdrawal.bankDetails.accountNumber}</p>
                        <p className="text-sm text-muted-foreground">IFSC: {selectedWithdrawal.bankDetails.ifsc}</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Risk Assessment</p>
                <div className="mt-1">{getRiskBadge(selectedWithdrawal.riskScore)}</div>
                {selectedWithdrawal.riskFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedWithdrawal.riskFlags.map((flag) => (
                      <Badge key={flag} variant="outline" className="text-xs">
                        {flag.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Requested</p>
                  <p>{formatDate(selectedWithdrawal.requestedAt)}</p>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div>
                    <p className="text-muted-foreground">Processed</p>
                    <p>{formatDate(selectedWithdrawal.processedAt)}</p>
                  </div>
                )}
                {selectedWithdrawal.completedAt && (
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p>{formatDate(selectedWithdrawal.completedAt)}</p>
                  </div>
                )}
              </div>

              {selectedWithdrawal.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Rejection Reason</p>
                  <p className="text-sm text-red-600">{selectedWithdrawal.rejectionReason}</p>
                </div>
              )}

              {selectedWithdrawal.failureReason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Failure Reason</p>
                  <p className="text-sm text-red-600">{selectedWithdrawal.failureReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
