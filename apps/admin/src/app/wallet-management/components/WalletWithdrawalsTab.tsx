"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Badge } from "@repo/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/dialog";
import { Label } from "@repo/ui/label";
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

import { 
  useGetAdminWithdrawalsQuery,
  useUpdateWithdrawalStatusMutation,
  useGetRegionsQuery
} from "@repo/store/services/api";
import { useSelector } from "react-redux";
import { selectSelectedRegion, selectCurrentAdmin } from "@repo/store/slices/adminAuthSlice";

interface WalletWithdrawal {
  _id: string;
  withdrawalId: string;
  userId: any;
  userName: string;
  userType: string;
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

export function WalletWithdrawalsTab() {
  const selectedRegionId = useSelector(selectSelectedRegion);
  const currentAdmin = useSelector(selectCurrentAdmin);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WalletWithdrawal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  // RTK Query hook
  const [updateStatus, { isLoading: isUpdating }] = useUpdateWithdrawalStatusMutation();
  const { data: withdrawalResp, isLoading, isError, refetch } = useGetAdminWithdrawalsQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: filterStatus !== "all" ? filterStatus : undefined,
    userType: filterUserType !== "all" ? filterUserType : undefined,
    search: searchQuery || undefined,
    regionId: selectedRegionId || undefined,
  });

  const withdrawals = withdrawalResp?.data || [];
  const stats = withdrawalResp?.stats || {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalPaid: 0,
    highRisk: 0,
  };
  const pagination = withdrawalResp?.pagination || { totalPages: 1, total: 0 };

  const fetchWithdrawals = () => {
    refetch();
  };

  // No longer need local filtering or pagination as it's done on backend
  const paginatedWithdrawals = withdrawals;
  const totalPages = pagination.totalPages;
  const totalItems = pagination.total;

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
    setRejectionReason("");
    setShowRejectionInput(false);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (action: "approve" | "reject") => {
    if (!selectedWithdrawal) return;

    if (action === "reject" && !showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }

    try {
      const result = await updateStatus({
        id: selectedWithdrawal._id,
        action,
        rejectionReason: action === "reject" ? rejectionReason : undefined
      }).unwrap();

      if (result.success) {
        toast.success(result.message || `Withdrawal ${action}d successfully`);
        setShowDetailModal(false);
      } else {
        toast.error(result.message || `Failed to ${action} withdrawal`);
      }
    } catch (err: any) {
      toast.error(err.data?.message || err.message || `Error ${action}ing withdrawal`);
    }
  };

  // No need to recalculate stats as they come from the API response

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
            <div className="text-xl font-bold text-primary">₹{stats.totalPaid.toLocaleString()}</div>
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
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
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
                        <TableCell colSpan={9} className="text-center py-12">
                          <p className="text-muted-foreground font-medium text-lg">No withdrawals found</p>
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
                      paginatedWithdrawals.map((withdrawal: WalletWithdrawal) => (
                        <TableRow key={withdrawal._id}>
                          <TableCell className="font-mono text-xs">
                            {withdrawal.withdrawalId}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{withdrawal.userName}</div>
                            <Badge variant="outline" className="text-[10px] h-4 mt-0.5">
                              {withdrawal.userType}
                            </Badge>
                          </TableCell>
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
                  {selectedWithdrawal.bankDetails?.accountNumber ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span>{selectedWithdrawal.bankDetails?.bankName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Number:</span>
                        <span className="font-semibold">{selectedWithdrawal.bankDetails?.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IFSC:</span>
                        <span className="font-semibold">{selectedWithdrawal.bankDetails?.ifsc}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UPI ID:</span>
                      <span className="font-semibold">{selectedWithdrawal.bankDetails?.upiId || 'N/A'}</span>
                    </div>
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

              {/* Action Buttons for Pending Status */}
              {selectedWithdrawal.status === "pending" && (
                <div className="space-y-4 pt-4 border-t">
                  {showRejectionInput && (
                    <div className="space-y-2">
                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                      <Input
                        id="rejection-reason"
                        placeholder="Enter reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    {showRejectionInput ? (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowRejectionInput(false)}
                                disabled={isUpdating}
                            >
                                Back
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleUpdateStatus("reject")}
                                disabled={isUpdating || !rejectionReason.trim()}
                            >
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                Confirm Reject
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => setShowRejectionInput(true)}
                                    disabled={isUpdating}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    variant="default"
                                    className="flex-1"
                                    onClick={() => handleUpdateStatus("approve")}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    Approve & Payout
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full text-green-600 border-green-600 hover:bg-green-600 hover:text-white transition-colors"
                                onClick={() => handleUpdateStatus("approve_manual")}
                                disabled={isUpdating}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid Manually
                            </Button>
                        </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
