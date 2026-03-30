
"use client";

import { useState, useEffect, useMemo, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Eye, CheckCircle, RefreshCw, AlertCircle, X, Plus, DollarSign, Users, Hourglass, Loader2, ChevronRight, ChevronDown, Settings, Upload, Building2, Smartphone, Copy, CheckCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { History, ListTodo } from 'lucide-react';
import { useAppSelector } from '@repo/store/hooks';
import { selectSelectedRegion } from '@repo/store/slices/adminAuthSlice';

interface AdminPaymentSettings {
  _id?: string;
  upiId?: string;
  upiQrCodeUrl?: string;
  upiHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  branchName?: string;
  paymentInstructions?: string;
}

// ─── Payment Settings Dialog ───────────────────────────────────────────────────
function PaymentSettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [settings, setSettings] = useState<AdminPaymentSettings>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'upi' | 'bank'>('upi');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/payment-settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        setConfirmAccount(data.data.accountNumber || '');
        setQrPreview(data.data.upiQrCodeUrl || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setQrPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server as base64 (or you can use FormData + your upload endpoint)
    setIsUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'admin-qr');
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.success && uploadData.url) {
        setSettings(prev => ({ ...prev, upiQrCodeUrl: uploadData.url }));
        setQrPreview(uploadData.url);
      } else {
        // fallback: store as dataURL if no upload endpoint
        const dataUrl = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = (ev) => resolve(ev.target?.result as string);
          r.readAsDataURL(file);
        });
        setSettings(prev => ({ ...prev, upiQrCodeUrl: dataUrl }));
      }
    } catch {
      // fallback: store as dataURL
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = (ev) => resolve(ev.target?.result as string);
        r.readAsDataURL(file);
      });
      setSettings(prev => ({ ...prev, upiQrCodeUrl: dataUrl }));
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleSave = async () => {
    if (settings.accountNumber && confirmAccount && settings.accountNumber !== confirmAccount) {
      toast.error('Account numbers do not match');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, confirmAccountNumber: confirmAccount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment settings saved successfully!');
        onOpenChange(false);
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch (e) {
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const inputCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Admin Payment Settings
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your UPI and bank details. Vendors will see these details when they need to pay you.
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-4">
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('upi')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'upi'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="h-4 w-4" /> UPI / QR Code
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'bank'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="h-4 w-4" /> Bank Details
              </button>
            </div>

            {activeTab === 'upi' && (
              <div className="space-y-5">
                {/* QR Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex items-center justify-center bg-muted/30 relative overflow-hidden">
                    {qrPreview ? (
                      <img src={qrPreview} alt="UPI QR Code" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Smartphone className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No QR uploaded</p>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrUpload}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/50 text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
                      {isUploadingQr ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {isUploadingQr ? 'Uploading...' : (qrPreview ? 'Change QR Code' : 'Upload QR Code')}
                    </div>
                  </label>
                </div>

                {/* UPI ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <div className="relative">
                    <input
                      id="upiId"
                      className={inputCls + " pr-10"}
                      placeholder="e.g. admin@ybl"
                      value={settings.upiId || ''}
                      onChange={e => setSettings(p => ({ ...p, upiId: e.target.value }))}
                    />
                    {settings.upiId && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.upiId!, 'upiId')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {copied === 'upiId' ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* UPI Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="upiHolderName">Account Holder Name (UPI)</Label>
                  <input
                    id="upiHolderName"
                    className={inputCls}
                    placeholder="Name shown on UPI"
                    value={settings.upiHolderName || ''}
                    onChange={e => setSettings(p => ({ ...p, upiHolderName: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <input
                      id="accountHolder"
                      className={inputCls}
                      placeholder="Full name"
                      value={settings.accountHolder || ''}
                      onChange={e => setSettings(p => ({ ...p, accountHolder: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <input
                      id="bankName"
                      className={inputCls}
                      placeholder="e.g. HDFC Bank"
                      value={settings.bankName || ''}
                      onChange={e => setSettings(p => ({ ...p, bankName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <div className="relative">
                    <input
                      id="accountNumber"
                      className={inputCls + " pr-10"}
                      placeholder="Enter account number"
                      value={settings.accountNumber || ''}
                      onChange={e => setSettings(p => ({ ...p, accountNumber: e.target.value }))}
                    />
                    {settings.accountNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(settings.accountNumber!, 'accNo')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {copied === 'accNo' ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                  <input
                    id="confirmAccountNumber"
                    className={`${inputCls} ${
                      confirmAccount && settings.accountNumber && confirmAccount !== settings.accountNumber
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : confirmAccount && settings.accountNumber && confirmAccount === settings.accountNumber
                        ? 'border-green-500 focus-visible:ring-green-500'
                        : ''
                    }`}
                    placeholder="Re-enter account number"
                    value={confirmAccount}
                    onChange={e => setConfirmAccount(e.target.value)}
                  />
                  {confirmAccount && settings.accountNumber && confirmAccount !== settings.accountNumber && (
                    <p className="text-xs text-red-500">Account numbers do not match</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <div className="relative">
                      <input
                        id="ifscCode"
                        className={inputCls + " pr-10 uppercase"}
                        placeholder="e.g. HDFC0001234"
                        value={settings.ifscCode || ''}
                        onChange={e => setSettings(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                      />
                      {settings.ifscCode && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settings.ifscCode!, 'ifsc')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {copied === 'ifsc' ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="branchName">Branch Name</Label>
                    <input
                      id="branchName"
                      className={inputCls}
                      placeholder="e.g. Mumbai Main Branch"
                      value={settings.branchName || ''}
                      onChange={e => setSettings(p => ({ ...p, branchName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="instructions">Instructions for Vendors (Optional)</Label>
              <textarea
                id="instructions"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. Please add vendor name in the payment remarks"
                value={settings.paymentInstructions || ''}
                onChange={e => setSettings(p => ({ ...p, paymentInstructions: e.target.value }))}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
  verified?: boolean;
  createdByType?: string;
  vendorId?: any;
  verifiedAt?: string;
  verifiedBy?: any;
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

function VerifyConfirmationDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  transaction 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  onConfirm: () => void;
  transaction: Transaction | null;
}) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" /> Confirm Verification
          </DialogTitle>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mt-3">
             <p className="text-sm text-blue-900 leading-tight">
               Please double-check the <b>UTR / Transaction ID</b> in your bank or UPI statement before clicking verify.
             </p>
          </div>
        </DialogHeader>
        <div className="bg-muted/50 p-4 rounded-xl space-y-3 mt-4 border border-muted">
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground uppercase font-black tracking-tighter">Amount:</span>
            <span className="font-black text-lg text-foreground">₹{transaction.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground uppercase font-black tracking-tighter">Reference ID:</span>
            <span className="font-mono font-bold bg-background px-2 py-0.5 rounded border">{transaction.transactionId || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs items-center border-t pt-2 mt-2">
             <span className="text-muted-foreground uppercase font-black tracking-tighter">Salon:</span>
             <span className="font-bold text-foreground truncate max-w-[150px]">{transaction.vendorId?.businessName || 'Unknown'}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1 font-bold h-11" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="default" className="flex-1 bg-green-600 hover:bg-green-700 font-black uppercase text-[11px] tracking-widest h-11 shadow-lg shadow-green-200" onClick={onConfirm}>Verify & Confirm</Button>
        </div>
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
  const [paymentSettingsOpen, setPaymentSettingsOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [txnToVerify, setTxnToVerify] = useState<Transaction | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'verified' | 'unverified'>('all');
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
    params.set('_t', Date.now().toString()); // Cache-buster
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

  const filteredHistoryData = useMemo(() => {
    if (historyFilter === 'all') return historyData;
    if (historyFilter === 'verified') return historyData.filter(t => t.verified === true);
    if (historyFilter === 'unverified') return historyData.filter(t => t.verified === false);
    return historyData;
  }, [historyData, historyFilter]);

  const lastHistoryIndex = historyPage * itemsPerPage;
  const firstHistoryIndex = lastHistoryIndex - itemsPerPage;
  const currentHistoryItems = filteredHistoryData.slice(firstHistoryIndex, lastHistoryIndex);
  const totalHistoryPages = Math.ceil(filteredHistoryData.length / itemsPerPage);

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

  const handleVerifyPayment = async (txnId: string, verified: boolean) => {
    if (isVerifying) return;
    const tid = toast.loading("Verifying payment...");
    setIsVerifying(true);
    try {
      console.log(`[PayoutPage] Calling verify API for ${txnId} with status ${verified}`);
      const resp = await fetch(`/api/admin/settlements/${txnId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      });
      const data = await resp.json();
      console.log(`[PayoutPage] Verify API response for ${txnId}:`, data);
      
      if (data.success && data.data) {
        toast.success(data.message, { id: tid });
        
        // 1. Update Global History Data
        setHistoryData(prev => prev.map(t => t._id === txnId ? data.data : t));
        
        // 2. Update Payouts Data (for individual vendor views)
        setPayoutData(prev => prev.map(p => ({
          ...p,
          paymentHistory: p.paymentHistory.map(t => t._id === txnId ? data.data : t)
        })));

        setVerifyDialogOpen(false);
        setTxnToVerify(null);
        
        // Re-fetch everything to ensure all balances are synced correctly
        setTimeout(() => fetchPayouts(), 200);
      } else {
        toast.error(data.message || "Failed to verify", { id: tid });
      }
    } catch (e) {
      console.error("[PayoutPage] Verify Error:", e);
      toast.error("Failed to verify", { id: tid });
    } finally {
      setIsVerifying(false);
    }
  };

  const totalTransactions = payoutData.reduce((acc, p) => acc + p.paymentHistory.length, 0);
  const pendingVendors = payoutData.filter(p => p.status === 'Pending' || p.status === 'Partially Paid').length;
  const unverifiedCount = historyData.filter(t => t.verified === false).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-headline">Payout Management</h1>
        <Button
          variant="outline"
          onClick={() => setPaymentSettingsOpen(true)}
          className="flex items-center gap-2 border-primary/40 text-primary hover:bg-primary/5"
        >
          <Settings className="h-4 w-4" />
          Payment Settings
        </Button>
      </div>

      <PaymentSettingsDialog open={paymentSettingsOpen} onOpenChange={setPaymentSettingsOpen} />

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
            {pendingVendors > 0 && <span className="ml-2 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingVendors}</span>}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 px-6">
            <History className="h-4 w-4" /> Payment History
            {unverifiedCount > 0 && <span className="ml-2 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{unverifiedCount}</span>}
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
                                            <div className="flex items-center gap-2 mb-1">
                                              <p className="font-semibold text-sm leading-none">{txn.type}</p>
                                              {txn.verified ? (
                                                <div className="flex items-center text-green-600 text-[9px] font-bold uppercase leading-none">
                                                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Verified
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-[8px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-tighter shadow-sm">Unverified</span>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-5 text-[8px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-1 uppercase"
                                                    onClick={() => {
                                                      setTxnToVerify(txn);
                                                      setVerifyDialogOpen(true);
                                                    }}
                                                  >
                                                    Verify Now
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
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
                                        <div className="flex flex-col gap-1">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase w-fit ${txn.type === 'Payment to Admin' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {txn.type === 'Payment to Admin' ? 'Received' : 'Paid Out'}
                                          </span>
                                          {txn.verified ? (
                                            <div className="flex items-center text-green-600 text-[8px] font-bold uppercase ml-1">
                                              <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Verified
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1">
                                              <span className="text-[8px] bg-red-50 text-red-600 font-bold px-1 rounded uppercase tracking-tighter">Unverified</span>
                                              <button 
                                                onClick={() => { setTxnToVerify(txn); setVerifyDialogOpen(true); }}
                                                className="text-[8px] text-blue-600 font-bold hover:underline"
                                              >
                                                Verify
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <span className="font-black text-sm">₹{txn.amount.toFixed(2)}</span>
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <CardTitle>Global Payment History</CardTitle>
                    <CardDescription>
                      Track all historical payments received from vendors and payouts sent to vendors.
                    </CardDescription>
                    <div className="flex bg-muted/50 p-1 rounded-xl w-fit mt-4 border border-muted/50">
                        {[
                          { id: 'all', label: 'All Payments', count: historyData.length },
                          { id: 'unverified', label: 'Unverified', count: unverifiedCount, color: 'text-red-500 bg-red-50' },
                          { id: 'verified', label: 'Verified', count: historyData.length - unverifiedCount, color: 'text-green-600 bg-green-50' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => { setHistoryFilter(tab.id as any); setHistoryPage(1); }}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2.5 ${
                              historyFilter === tab.id 
                                ? 'bg-background text-blue-600 shadow-sm border border-muted' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                            }`}
                          >
                            {tab.label}
                            {tab.count > 0 && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] ${tab.id === historyFilter ? (tab.color || 'bg-muted text-primary') : 'bg-muted text-muted-foreground'}`}>
                                {tab.count}
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fetchPayouts()} className="h-9 font-bold">
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
                      <TableHead>Verification</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : currentHistoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground italic">
                          No payment history recorded{selectedRegion && selectedRegion !== 'all' ? ' for the selected region.' : ' for this period.'}
                        </TableCell>
                      </TableRow>
                    ) : currentHistoryItems.map((txn) => (
                      <TableRow key={txn._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-xs">
                          <p className="font-bold">{new Date(txn.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(txn.paymentDate).toLocaleTimeString()}</p>
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {txn.vendorId?.businessName || 'Unknown Vendor'}
                          {txn.notes && (
                            <p className="text-[9px] text-muted-foreground italic font-normal mt-0.5 line-clamp-1 border-l pl-2 border-muted" title={txn.notes}>
                              "{txn.notes}"
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${txn.type === 'Payment to Admin' ? 'text-green-600' : 'text-orange-600'}`}>
                              {txn.type === 'Payment to Admin' ? <Plus className="h-3 w-3" /> : <RefreshCw className="h-3 w-3 rotate-180" />}
                              {txn.type === 'Payment to Admin' ? 'Received' : 'Paid Out'}
                            </span>
                            {txn.createdByType === 'vendor' && (
                              <span className="text-[8px] bg-blue-50 text-blue-600 w-fit font-bold px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">By Vendor</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-black whitespace-nowrap text-foreground">₹{txn.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-[11px] font-mono font-bold text-foreground/80">
                          <div className="flex items-center gap-1 group">
                             <span>{txn.transactionId || '---'}</span>
                             {txn.transactionId && (
                               <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                 navigator.clipboard.writeText(txn.transactionId!);
                                 toast.success('Transaction ID copied');
                               }}>
                                 <Copy className="h-3 w-3" />
                               </Button>
                             )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{txn.paymentMethod}</TableCell>
                        <TableCell>
                          {txn.verified ? (
                             <div className="flex flex-col gap-1">
                               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                                 <CheckCircle className="h-3.5 w-3.5" /> Verified
                               </span>
                               <div className="flex flex-col pl-1">
                                 <p className="text-[8px] text-muted-foreground font-bold">BY {txn.verifiedBy?.name || 'ADMIN'}</p>
                                 {txn.verifiedAt && (
                                   <p className="text-[8px] text-muted-foreground/60 italic font-medium">
                                     {new Date(txn.verifiedAt).toLocaleDateString()}
                                   </p>
                                 )}
                               </div>
                             </div>
                          ) : (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-500 border border-red-100 animate-pulse">
                               <AlertCircle className="h-3.5 w-3.5" /> Unverified
                             </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!txn.verified && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 text-[11px] font-black bg-blue-600 hover:bg-blue-700 text-white px-5 uppercase tracking-wider rounded-lg shadow-lg shadow-blue-100"
                              onClick={() => {
                                setTxnToVerify(txn);
                                setVerifyDialogOpen(true);
                              }}
                            >
                              Verify
                            </Button>
                          )}
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
                totalItems={filteredHistoryData.length}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VerifyConfirmationDialog 
        open={verifyDialogOpen} 
        onOpenChange={setVerifyDialogOpen} 
        onConfirm={() => txnToVerify && handleVerifyPayment(txnToVerify._id, true)} 
        transaction={txnToVerify}
      />
    </div>
  );
}
