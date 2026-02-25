
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@repo/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { toast } from 'sonner';
import { Loader2, DollarSign, CheckCircle } from "lucide-react";

// Import types
import { SettlementData } from "./types";

export default function SettlementsPage() {
  // State management
  const [settlements, setSettlements] = useState<SettlementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementData | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch settlements data
  const fetchSettlements = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/crm/settlements?${params}`);
      const data = await response.json();

      if (data.success) {
        setSettlements(data.data || []);
      } else {
        toast.error("Failed to fetch settlements");
      }
    } catch (error) {
      console.error("Error fetching settlements:", error);
      toast.error("Failed to fetch settlements");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch settlements on mount and when filters change
  useEffect(() => {
    fetchSettlements();
  }, [period, statusFilter]);

  // Filter and paginate settlements
  const filteredSettlements = useMemo(() => {
    return settlements.filter(
      (settlement) =>
        (settlement.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          settlement.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" || settlement.status === statusFilter)
    );
  }, [settlements, searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredSettlements.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredSettlements.length / itemsPerPage);

  // Calculate summary stats
  const stats = useMemo(() => {
    const adminOwesTotal = filteredSettlements.reduce((sum, s) => sum + (s.vendorAmount || 0), 0);
    const vendorOwesTotal = filteredSettlements.reduce((sum, s) => sum + (s.adminReceivableAmount || 0), 0);

    return {
      totalSettlements: filteredSettlements.length,
      totalAmount: filteredSettlements.reduce((sum, s) => sum + s.totalAmount, 0),
      adminOwesVendor: adminOwesTotal,
      vendorOwesAdmin: vendorOwesTotal,
      netSettlement: adminOwesTotal - vendorOwesTotal,
      totalPending: filteredSettlements.reduce((sum, s) => sum + s.amountPending, 0),
    };
  }, [filteredSettlements]);

  // Determine settlement direction for display
  const settlementDirection = stats.netSettlement > 0
    ? { type: 'admin_owes', amount: stats.netSettlement }
    : stats.netSettlement < 0
      ? { type: 'vendor_owes', amount: Math.abs(stats.netSettlement) }
      : { type: 'balanced', amount: 0 };

  // Modal handlers
  const handleOpenModal = (settlement: SettlementData) => {
    setSelectedSettlement(settlement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSettlement(null);
  };

  const handleOpenPaymentModal = (settlement: SettlementData) => {
    setSelectedSettlement(settlement);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedSettlement(null);
  };

  // Payment handler — vendor can only record payments TO admin (Pay at Salon fees)
  const handlePayVendor = async (amount: number, paymentMethod: string, transactionId?: string, notes?: string) => {
    if (!selectedSettlement) return;

    // Vendors can only record paying admin (platform fees for Pay at Salon appointments)
    const type = 'Payment to Admin';

    setIsProcessingPayment(true);
    const toastId = toast.loading("Recording your payment to admin...");

    try {
      const response = await fetch('/api/crm/settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: selectedSettlement.vendorId,
          amount,
          type,
          paymentMethod,
          transactionId,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment recorded successfully", {
          description: `₹${amount.toFixed(2)} marked as paid to Admin`,
        });
        handleClosePaymentModal();
        fetchSettlements();
      } else {
        toast.error("Failed to process payment", {
          description: data.message,
        });
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment", {
        description: error?.message || "Please try again.",
      });
    } finally {
      toast.dismiss(toastId);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Vendor Settlements
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Track settlements for both Pay Online and Pay at Salon appointments
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-1">Total Amount</div>
              <div className="text-2xl font-bold">₹{stats.totalAmount.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">{stats.totalSettlements} settlements</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-1">Admin Owes Vendors</div>
              <div className="text-2xl font-bold text-orange-600">₹{stats.adminOwesVendor.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Pay Online service amounts</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-1">Vendors Owe Admin</div>
              <div className="text-2xl font-bold text-green-600">₹{stats.vendorOwesAdmin.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Pay at Salon fees</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground mb-1">Net Settlement</div>
              <div className={`text-2xl font-bold ${settlementDirection.type === 'admin_owes' ? 'text-orange-600' :
                settlementDirection.type === 'vendor_owes' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                {settlementDirection.type === 'admin_owes' && '- '}
                {settlementDirection.type === 'vendor_owes' && '+ '}
                ₹{settlementDirection.amount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {settlementDirection.type === 'admin_owes' && 'Admin owes vendors'}
                {settlementDirection.type === 'vendor_owes' && 'Vendors owe admin'}
                {settlementDirection.type === 'balanced' && 'Balanced'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by vendor or owner name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Settlements Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                No settlements found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Vendor Details</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Total Amount</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Settlement Direction</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentItems.map((settlement) => {
                      const direction = settlement.netSettlement > 0
                        ? { type: 'admin_owes', amount: settlement.vendorAmount }
                        : settlement.netSettlement < 0
                          ? { type: 'vendor_owes', amount: settlement.adminReceivableAmount }
                          : { type: 'balanced', amount: 0 };

                      return (
                        <tr key={settlement.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-mono">{settlement.id.substring(0, 12)}...</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{settlement.vendorName}</div>
                            <div className="text-sm text-muted-foreground">{settlement.ownerName}</div>
                            <div className="text-xs text-muted-foreground">{settlement.contactNo}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">₹{settlement.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm ${direction.type === 'admin_owes' ? 'text-orange-600' :
                              direction.type === 'vendor_owes' ? 'text-green-600' :
                                'text-gray-600'
                              }`}>
                              {direction.type === 'admin_owes' && 'Admin → Vendor'}
                              {direction.type === 'vendor_owes' && 'Vendor → Admin'}
                              {direction.type === 'balanced' && 'Balanced'}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-medium ${direction.type === 'admin_owes' ? 'text-orange-600' :
                            direction.type === 'vendor_owes' ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                            ₹{direction.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${settlement.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : settlement.status === 'Partially Paid'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {settlement.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenModal(settlement)}
                              >
                                View Details
                              </Button>
                              {settlement.status !== 'Paid' && direction.amount > 0 && (
                                direction.type === 'vendor_owes' ? (
                                  // Vendor owes admin platform fees (Pay at Salon) — vendor records their payment
                                  <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleOpenPaymentModal(settlement)}
                                  >
                                    Pay Admin
                                  </Button>
                                ) : direction.type === 'admin_owes' ? (
                                  // Admin owes vendor (Pay Online) — open details to see payout breakdown
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-orange-400 text-orange-600 hover:bg-orange-50"
                                    onClick={() => handleOpenModal(settlement)}
                                  >
                                    Awaiting Payout ₹{direction.amount.toFixed(0)}
                                  </Button>
                                ) : null
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {firstItemIndex + 1} to {Math.min(lastItemIndex, filteredSettlements.length)} of {filteredSettlements.length} settlements
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Settlement Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Settlement Details</DialogTitle>
              <DialogDescription>
                Detailed breakdown of vendor settlement
              </DialogDescription>
            </DialogHeader>

            {selectedSettlement && (
              <div className="space-y-6">
                {/* Vendor Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Vendor Name</div>
                    <div className="font-medium">{selectedSettlement.vendorName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Owner Name</div>
                    <div className="font-medium">{selectedSettlement.ownerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Contact</div>
                    <div className="font-medium">{selectedSettlement.contactNo}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Settlement ID</div>
                    <div className="font-mono text-sm">{selectedSettlement.id}</div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Volume</div>
                    <div className="text-xl font-bold">₹{selectedSettlement.totalAmount.toFixed(2)}</div>
                  </div>
                  <div className="border-l pl-4">
                    <div className="text-sm text-green-600 font-medium">From Online Bookings</div>
                    <div className="text-xs text-muted-foreground">Service amount admin owes you</div>
                    <div className="text-xl font-bold text-green-600">₹{selectedSettlement.adminOwesVendor.toFixed(2)}</div>
                  </div>
                  <div className="border-l pl-4">
                    <div className="text-sm text-red-600 font-medium">From Salon Bookings</div>
                    <div className="text-xs text-muted-foreground">Fees you owe admin</div>
                    <div className="text-xl font-bold text-red-600">₹{selectedSettlement.vendorOwesAdmin.toFixed(2)}</div>
                  </div>
                  <div className="border-l pl-4">
                    <div className="text-sm font-medium text-blue-600">Net Pending</div>
                    <div className="text-xl font-bold text-blue-600">₹{selectedSettlement.amountPending.toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {selectedSettlement.netSettlement > 0 ? "Receivable from Admin" : "Payable to Admin"}
                    </div>
                  </div>
                </div>

                {/* Status-specific breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg bg-orange-50/50">
                    <div className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">Tax & Fees Breakdown</div>
                    <div className="flex justify-between text-sm text-orange-900">
                      <span>Platform Fees:</span>
                      <span className="font-semibold">₹{selectedSettlement.platformFeeTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-orange-900">
                      <span>Service Tax:</span>
                      <span className="font-semibold">₹{selectedSettlement.serviceTaxTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-blue-50/50">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">Settlement Summary</div>
                    <div className="flex justify-between text-sm text-blue-900">
                      <span>Amount Settled:</span>
                      <span className="font-semibold">₹{(selectedSettlement.netSettlement > 0 ?
                        selectedSettlement.paymentHistory.filter(p => p.type === "Payment to Vendor").reduce((acc, p) => acc + p.amount, 0) :
                        selectedSettlement.paymentHistory.filter(p => p.type === "Payment to Admin").reduce((acc, p) => acc + p.amount, 0)
                      ).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-900 border-t mt-1 pt-1">
                      <span>Current Status:</span>
                      <span className="font-bold">{selectedSettlement.status}</span>
                    </div>
                  </div>
                </div>

                {/* Payment History and Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  {/* Payment History */}
                  <div className="flex-1 w-full">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Payment History
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Type</th>
                            <th className="px-3 py-2 text-left">Method</th>
                            <th className="px-3 py-2 text-left">Ref ID</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedSettlement.paymentHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground italic">
                                No payments recorded yet for this period.
                              </td>
                            </tr>
                          ) : (
                            selectedSettlement.paymentHistory.map((payment, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                <td className="px-3 py-2">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${payment.type === 'Payment to Admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {payment.type === 'Payment to Admin' ? 'Settled to Admin' : 'Received Payout'}
                                  </span>
                                </td>
                                <td className="px-3 py-2">{payment.paymentMethod}</td>
                                <td className="px-3 py-2 font-mono text-xs">{payment.transactionId || '---'}</td>
                                <td className="px-3 py-2 text-right font-semibold">₹{payment.amount.toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-80 space-y-4">
                    <Card className="bg-muted/30 border-dashed">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-sm mb-2 uppercase tracking-wider">Quick Actions</h4>
                        {selectedSettlement.amountPending > 0 ? (
                          selectedSettlement.netSettlement < 0 ? (
                            <div className="space-y-3">
                              <p className="text-xs text-muted-foreground italic">
                                You have a pending settlement of ₹{selectedSettlement.amountPending.toFixed(2)} to pay to Admin for Salon bookings.
                              </p>
                              <Button
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                                onClick={() => handleOpenPaymentModal(selectedSettlement)}
                              >
                                Record Payment to Admin
                              </Button>
                              <p className="text-[10px] text-center text-muted-foreground">
                                (For Cash, Agent, or Online payments)
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs text-muted-foreground italic">
                                Admin owes you ₹{selectedSettlement.amountPending.toFixed(2)} for Online bookings. This will be automatically disbursed to your bank account.
                              </p>
                              <Button
                                variant="outline"
                                className="w-full border-orange-400 text-orange-600 cursor-default hover:bg-transparent"
                              >
                                Awaiting Admin Payout
                              </Button>
                            </div>
                          )
                        ) : (
                          <div className="text-center py-4">
                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-green-700">Fully Settled</p>
                            <p className="text-xs text-muted-foreground mt-1">All dues for this period have been cleared.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Appointments List */}
                <div>
                  <h3 className="font-semibold mb-3">Included Appointments ({selectedSettlement.appointments.length})</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Client</th>
                          <th className="px-3 py-2 text-left">Service</th>
                          <th className="px-3 py-2 text-left">Method</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                          <th className="px-3 py-2 text-right">Owner Owed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedSettlement.appointments.map((appt) => {
                          const ownerOwed = appt.paymentMethod === 'Pay Online'
                            ? appt.totalAmount // What admin owes vendor
                            : appt.platformFee + appt.serviceTax; // What vendor owes admin

                          return (
                            <tr key={appt._id}>
                              <td className="px-3 py-2">{new Date(appt.date).toLocaleDateString()}</td>
                              <td className="px-3 py-2">{appt.clientName}</td>
                              <td className="px-3 py-2">{appt.serviceName}</td>
                              <td className="px-3 py-2">
                                <span className={`text-[10px] font-bold uppercase ${appt.paymentMethod === 'Pay Online' ? 'text-blue-600' : 'text-orange-600'}`}>
                                  {appt.paymentMethod}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">₹{appt.finalAmount.toFixed(2)}</td>
                              <td className={`px-3 py-2 text-right font-medium ${appt.paymentMethod === 'Pay Online' ? 'text-green-600' : 'text-red-600'}`}>
                                {appt.paymentMethod === 'Pay Online' ? '+' : '-'}₹{ownerOwed.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            {selectedSettlement && (() => {
              const direction = selectedSettlement.netSettlement > 0
                ? { type: 'admin_owes', amount: selectedSettlement.vendorAmount }
                : selectedSettlement.netSettlement < 0
                  ? { type: 'vendor_owes', amount: selectedSettlement.adminReceivableAmount }
                  : { type: 'balanced', amount: 0 };

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      Pay Admin — Platform Fees
                    </DialogTitle>
                    <DialogDescription>
                      Record your payment of platform fees owed to Admin for Pay at Salon appointments.
                      Pending: ₹{direction.amount.toFixed(2)}
                    </DialogDescription>
                  </DialogHeader>

                  <PaymentForm
                    settlement={selectedSettlement}
                    onSubmit={handlePayVendor}
                    isProcessing={isProcessingPayment}
                    onCancel={handleClosePaymentModal}
                  />
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Payment Form Component
function PaymentForm({
  settlement,
  onSubmit,
  isProcessing,
  onCancel
}: {
  settlement: SettlementData;
  onSubmit: (amount: number, paymentMethod: string, transactionId?: string, notes?: string) => void;
  isProcessing: boolean;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(settlement.amountPending.toString());
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onSubmit(amountNum, paymentMethod, transactionId || undefined, notes || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter amount (e.g. amount paid to Agent)"
          required
        />
        <div className="text-xs text-muted-foreground mt-1">
          Pending: ₹{settlement.amountPending.toFixed(2)}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="UPI">UPI</option>
          <option value="Online">Online</option>
          <option value="Cash">Cash</option>
          <option value="Agent">Agent</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Transaction ID (Optional)</label>
        <input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter transaction ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Add any notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Record Payment'
          )}
        </Button>
      </div>
    </form>
  );
}
