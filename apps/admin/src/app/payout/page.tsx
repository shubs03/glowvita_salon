
"use client";

import { useState, useEffect, useMemo, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Eye, CheckCircle, RefreshCw, AlertCircle, X, Plus, DollarSign, Users, Hourglass, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { History, ListTodo } from 'lucide-react';
import { useAppSelector } from '@repo/store/hooks';
import { selectSelectedRegion } from '@repo/store/slices/adminAuthSlice';

interface ReceiveAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceive: (amount: number, method: string, txnId?: string, notes?: string, date?: string) => void;
  pendingAmount: number;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  transactionId?: string;
}

interface Appointment {
  _id: string;
  date: string;
  clientName: string;
  serviceName: string;
  finalAmount: number;
  platformFee: number;
  serviceTax: number;
  paymentMethod: string;
}

interface PayoutData {
  id: string;
  vendorId: string;
  vendorName: string;
  contactNo: string;
  ownerName: string;
  adminReceivableAmount: number;
  vendorAmount: number;
  amountPending: number;
  totalAmount: number;
  netSettlement: number;
  status: string;
  paymentHistory: Transaction[];
  appointments: Appointment[];
  totalVolume: number;
  totalToSettle: number;
  amountPaid: number;
  amountRemaining: number;
}

function ReceiveAmountDialog({ open, onOpenChange, onReceive, pendingAmount, direction }: ReceiveAmountDialogProps & { direction: 'receive' | 'pay' }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(pendingAmount.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [open, pendingAmount]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > pendingAmount) {
      setError(`Amount cannot exceed pending amount (₹${pendingAmount.toFixed(2)})`);
      return;
    }

    onReceive(numAmount, paymentMethod, transactionId, notes, paymentDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{direction === 'receive' ? 'Receive Payment' : 'Send Payout'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="col-span-3"
                placeholder={`Max: ₹${pendingAmount.toFixed(2)}`}
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">Method</Label>
              <select
                id="method"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Online">Online</option>
                <option value="Cash">Cash</option>
                <option value="Agent">Agent</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="txnId" className="text-right">UTR/Ref ID</Label>
              <Input
                id="txnId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="col-span-3"
                placeholder="Transaction ID"
                required={direction === 'receive'}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Optional notes"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" /> {direction === 'receive' ? 'Record Receipt' : 'Record Payout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PayoutPage() {
  const [payoutData, setPayoutData] = useState<PayoutData[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [summary, setSummary] = useState({
    totalSettlements: 0,
    totalAmount: 0,
    totalAdminOwes: 0,
    totalVendorOwes: 0,
  });
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);

  // Read selected region from Redux (same pattern as reports)
  const selectedRegion = useAppSelector(selectSelectedRegion);

  // Build the API URL with optional regionId param
  const buildSettlementsUrl = (extraParams: Record<string, string> = {}) => {
    const params = new URLSearchParams(extraParams);
    if (selectedRegion && selectedRegion !== 'all') {
      params.set('regionId', selectedRegion);
    }
    const queryString = params.toString();
    return `/api/admin/settlements${queryString ? `?${queryString}` : ''}`;
  };

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const url = buildSettlementsUrl();
      console.log('[PayoutPage] Fetching settlements with URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPayoutData(data.data);
        setHistoryData(data.history || []);
        setSummary(data.summary || {
          totalSettlements: 0,
          totalAmount: 0,
          totalAdminOwes: 0,
          totalVendorOwes: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch whenever selected region changes (same as reports pattern)
  useEffect(() => {
    fetchPayouts();
  }, [selectedRegion]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = payoutData.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(payoutData.length / itemsPerPage);

  const lastHistoryIndex = historyPage * itemsPerPage;
  const firstHistoryIndex = lastHistoryIndex - itemsPerPage;
  const currentHistoryItems = historyData.slice(firstHistoryIndex, lastHistoryIndex);
  const totalHistoryPages = Math.ceil(historyData.length / itemsPerPage);

  const handleRecordTransaction = async (amount: number, method: string, txnId?: string, notes?: string, date?: string) => {
    if (!selectedPayout) return;

    const direction = selectedPayout.netSettlement > 0 ? 'payout' : 'receive';
    const type = direction === 'payout' ? 'Payment to Vendor' : 'Payment to Admin';

    setIsProcessing(true);
    const toastId = toast.loading(direction === 'payout' ? "Processing payout..." : "Processing receipt...");

    try {
      const response = await fetch('/api/admin/settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId: selectedPayout.vendorId,
          amount,
          type,
          paymentMethod: method,
          transactionId: txnId,
          notes,
          paymentDate: date || new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchPayouts();
      }
    } catch (error) {
      console.error("Error recording transaction:", error);
    } finally {
      toast.dismiss(toastId);
      setIsProcessing(false);
      setReceiveDialogOpen(false);
      setSelectedPayout(null);
    }
  };

  const totalTransactions = payoutData.reduce((acc, p) => acc + p.paymentHistory.length, 0);
  const pendingVendors = payoutData.filter(p => p.status === 'Pending' || p.status === 'Partially Paid').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">Payout Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all vendor settlements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Owes Vendors</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{summary.totalAdminOwes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending payouts for online bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors Owe Admin</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{summary.totalVendorOwes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending fees for salon payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingVendors}
            </div>
            <p className="text-xs text-muted-foreground">Vendors with pending balance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="upcoming" className="flex items-center gap-2 px-6">
            <ListTodo className="h-4 w-4" /> Upcoming Settlements
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 px-6">
            <History className="h-4 w-4" /> Payment History (Received/Paid)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Upcoming Settlements</CardTitle>
                  <CardDescription>
                    Pending balances that need to be paid out or collected from vendors.
                    {selectedRegion && selectedRegion !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Region Filtered
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => fetchPayouts()}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Salon Name</TableHead>
                    <TableHead>Total Volume (₹)</TableHead>
                    <TableHead>Settlement Trend</TableHead>
                    <TableHead>Total to Settle (₹)</TableHead>
                    <TableHead>Paid (₹)</TableHead>
                    <TableHead>Remaining (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <p className="mt-2 text-muted-foreground">Loading settlements...</p>
                        </TableCell>
                      </TableRow>
                    ) : currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                          No settlements found{selectedRegion && selectedRegion !== 'all' ? ' for the selected region.' : '.'}
                        </TableCell>
                      </TableRow>
                    ) : currentItems.map((payout) => (
                      <Fragment key={payout.id}>
                        <TableRow className={expandedVendorId === payout.id ? "bg-muted/30" : ""}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setExpandedVendorId(expandedVendorId === payout.id ? null : payout.id)}
                            >
                              {expandedVendorId === payout.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-base">{payout.vendorName}</div>
                            {(payout.ownerName && payout.ownerName !== 'N/A' || payout.contactNo && payout.contactNo !== 'N/A') && (
                              <div className="text-xs text-muted-foreground">
                                {payout.ownerName && payout.ownerName !== 'N/A' ? payout.ownerName : ''}
                                {payout.ownerName && payout.ownerName !== 'N/A' && payout.contactNo && payout.contactNo !== 'N/A' ? ` (${payout.contactNo})` : payout.contactNo && payout.contactNo !== 'N/A' ? payout.contactNo : ''}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>₹{payout.totalVolume.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${payout.netSettlement > 0 ? 'bg-orange-100 text-orange-700' : payout.netSettlement < 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {payout.netSettlement > 0 ? 'Admin → Vendor' : payout.netSettlement < 0 ? 'Vendor → Admin' : 'Balanced'}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">₹{payout.totalToSettle.toFixed(2)}</TableCell>
                          <TableCell className="text-green-600">₹{payout.amountPaid.toFixed(2)}</TableCell>
                          <TableCell className="font-bold text-red-600">₹{payout.amountRemaining.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${payout.status === "Paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : payout.status === "Partially Paid"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}>
                              {payout.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {payout.amountRemaining > 0 && (
                                <Button
                                  variant={payout.netSettlement > 0 ? "outline" : "default"}
                                  size="sm"
                                  className={`h-8 font-bold text-[10px] uppercase tracking-wider ${payout.netSettlement > 0
                                    ? 'border-orange-500 text-orange-600 hover:bg-orange-50'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                  onClick={() => {
                                    setSelectedPayout(payout);
                                    setReceiveDialogOpen(true);
                                  }}
                                >
                                  {payout.netSettlement > 0 ? 'Send Payout' : 'Collect Fees'}
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <span className="sr-only">View Transactions</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl">{payout.vendorName} - Transaction History</DialogTitle>
                                    <div className="grid grid-cols-3 gap-4 pt-4">
                                      <div className="bg-orange-50 p-4 rounded-lg">
                                        <p className="text-xs text-orange-700 font-medium">Admin Owes (Online)</p>
                                        <p className="text-lg font-bold text-orange-900">₹{(payout.appointments.filter(a => a.paymentMethod === 'Pay Online').reduce((sum, a) => sum + (a.finalAmount - a.platformFee - a.serviceTax), 0)).toFixed(2)}</p>
                                      </div>
                                      <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-xs text-green-700 font-medium">Vendor Owes (Fees)</p>
                                        <p className="text-lg font-bold text-green-900">₹{(payout.appointments.filter(a => a.paymentMethod === 'Pay at Salon').reduce((sum, a) => sum + (a.platformFee + a.serviceTax), 0)).toFixed(2)}</p>
                                      </div>
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-xs text-blue-700 font-medium">Pending Balance</p>
                                        <div className="flex items-center justify-between">
                                          <p className="text-lg font-bold text-blue-900">₹{payout.amountPending.toFixed(2)}</p>
                                          {payout.amountPending > 0 && (
                                            <Button
                                              type="button"
                                              variant="default"
                                              size="sm"
                                              className="h-8"
                                              onClick={() => {
                                                setSelectedPayout(payout);
                                                setReceiveDialogOpen(true);
                                              }}
                                            >
                                              {payout.netSettlement > 0 ? 'Pay' : 'Collect'}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </DialogHeader>
                                  <div className="mt-6">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Transaction History</h3>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                      {payout.paymentHistory.length === 0 ? (
                                        <p className="text-center py-4 text-muted-foreground italic">No transactions recorded yet.</p>
                                      ) : payout.paymentHistory.map((txn, index) => (
                                        <div key={txn._id} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                                          <div>
                                            <p className="font-semibold text-sm">{txn.type}</p>
                                            <div className="flex flex-col gap-1 mt-1">
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <RefreshCw className="h-3 w-3" />
                                                <span className="font-mono">ID: {txn.transactionId || 'N/A'}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Hourglass className="h-3 w-3" />
                                                <span>
                                                  {new Date(txn.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(txn.paymentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <DollarSign className="h-3 w-3" />
                                                <span>Method: {txn.paymentMethod}</span>
                                              </div>
                                            </div>
                                            {txn.notes && <p className="text-xs mt-2 italic text-muted-foreground border-l-2 pl-2">"{txn.notes}"</p>}
                                          </div>
                                          <div className={`text-right font-bold text-lg ${txn.type === 'Payment to Admin' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {txn.type === 'Payment to Admin' ? 'Received' : 'Paid'}
                                            <div className="text-xl">₹{txn.amount.toFixed(2)}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="mt-6">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 font-mono">Status Summary</h3>
                                    <div className="p-4 border rounded-xl bg-muted/20">
                                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        This vendor currently has a {payout.status.toLowerCase()} settlement status.
                                        {payout.amountRemaining > 0
                                          ? ` A balance of ₹${payout.amountRemaining.toFixed(2)} is still pending in the direction of ${payout.netSettlement > 0 ? 'Admin paying Vendor' : 'Vendor paying Admin'}.`
                                          : ' All dues for this period have been fully settled.'}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <ReceiveAmountDialog
                                open={receiveDialogOpen && selectedPayout?.id === payout.id}
                                onOpenChange={(open) => {
                                  setReceiveDialogOpen(open);
                                  if (!open) setSelectedPayout(null);
                                }}
                                onReceive={handleRecordTransaction}
                                pendingAmount={payout.amountPending}
                                direction={payout.netSettlement > 0 ? 'pay' : 'receive'}
                              />
                            </div>
                          </TableCell>
                        </TableRow>

                        {expandedVendorId === payout.id && (
                          <TableRow className="bg-muted/10">
                            <TableCell colSpan={9} className="p-4 border-t">
                              <div className="pl-8">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                  <History className="h-3.5 w-3.5" /> Recent Vendor Transactions
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {payout.paymentHistory.length === 0 ? (
                                    <div className="col-span-full py-6 text-center text-muted-foreground italic border rounded-lg bg-background/50">
                                      No local transactions recorded for this vendor.
                                    </div>
                                  ) : payout.paymentHistory.map((txn) => (
                                    <div key={txn._id} className="p-3 border rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${txn.type === 'Payment to Admin' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                          {txn.type === 'Payment to Admin' ? 'Received' : 'Paid Out'}
                                        </span>
                                        <span className="font-bold text-sm">₹{txn.amount.toFixed(2)}</span>
                                      </div>
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                          <Hourglass className="h-3 w-3" />
                                          {new Date(txn.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                          <RefreshCw className="h-3 w-3" />
                                          <span className="font-mono">Ref: {txn.transactionId || '---'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-medium text-foreground">
                                          <DollarSign className="h-3 w-3" />
                                          {txn.paymentMethod}
                                        </div>
                                      </div>
                                      {txn.notes && (
                                        <p className="mt-2 text-[10px] text-muted-foreground italic line-clamp-1 border-t pt-2">
                                          "{txn.notes}"
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={payoutData.length}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Global Payment History</CardTitle>
                  <CardDescription>
                    Track all historical payments received from vendors and payouts sent to vendors.
                    {selectedRegion && selectedRegion !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Region Filtered
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => fetchPayouts()}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date &amp; Time</TableHead>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount (₹)</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : currentHistoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground italic">
                          No payment history recorded{selectedRegion && selectedRegion !== 'all' ? ' for the selected region.' : ' for this period.'}
                        </TableCell>
                      </TableRow>
                    ) : currentHistoryItems.map((txn) => (
                      <TableRow key={txn._id}>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {new Date(txn.paymentDate).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            {new Date(txn.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {txn.vendorId?.businessName || 'Unknown Vendor'}
                        </TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${txn.type === 'Payment to Admin' ? 'text-green-600' : 'text-orange-600'}`}>
                            {txn.type === 'Payment to Admin' ? <Plus className="h-3 w-3" /> : <RefreshCw className="h-3 w-3 rotate-180" />}
                            {txn.type === 'Payment to Admin' ? 'Received' : 'Paid Out'}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold">₹{txn.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-xs font-mono">{txn.transactionId || '---'}</TableCell>
                        <TableCell className="text-xs">{txn.paymentMethod}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-green-600 text-[10px] font-bold uppercase">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verified
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                className="mt-4"
                currentPage={historyPage}
                totalPages={totalHistoryPages}
                onPageChange={setHistoryPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={historyData.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
