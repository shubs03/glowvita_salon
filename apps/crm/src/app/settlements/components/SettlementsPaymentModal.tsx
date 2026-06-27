import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from '@repo/ui/label';
import { Plus, Loader2, Building2, Smartphone, Copy, CheckCheck, QrCode, AlertCircle, FileText, Hash, Landmark, IndianRupee } from 'lucide-react';

interface AdminPaymentSettings {
  upiId?: string;
  upiQrCodeUrl?: string;
  upiHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  branchName?: string;
  upiPaymentInstructions?: string;
  bankPaymentInstructions?: string;
  paymentInstructions?: string;
}

interface SettlementsPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectPayment: (payoutId: string, amount: number, method: string, transactionId?: string, notes?: string) => void;
  selectedPayout: { id: string; pendingAmount: number; } | null;
  isProcessing: boolean;
}

type PaymentMethodType = 'UPI' | 'Bank Transfer' | 'Cheque';

const SettlementsPaymentModal = ({
  isOpen,
  onClose,
  onCollectPayment,
  selectedPayout,
  isProcessing
}: SettlementsPaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [payerName, setPayerName] = useState('');
  const [chequeCollectionAt, setChequeCollectionAt] = useState('');
  const [error, setError] = useState('');
  const [adminSettings, setAdminSettings] = useState<AdminPaymentSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [activeMethod, setActiveMethod] = useState<PaymentMethodType>('UPI');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAdminSettings();
      if (selectedPayout) {
        setAmount(selectedPayout.pendingAmount?.toString() || '');
      }
    }
  }, [isOpen, selectedPayout]);

  const fetchAdminSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch('/api/crm/payment-settings');
      const data = await res.json();
      if (data.success && data.data) {
        setAdminSettings(data.data);
        // Default to Bank if UPI missing
        if (!data.data.upiId && !data.data.upiQrCodeUrl && data.data.accountNumber) {
          setActiveMethod('Bank Transfer');
        }
      } else {
        setAdminSettings(null);
      }
    } catch {
      setAdminSettings(null);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeInstructions =
    activeMethod === 'UPI'
      ? adminSettings?.upiPaymentInstructions
      : activeMethod === 'Bank Transfer'
        ? adminSettings?.bankPaymentInstructions
        : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (selectedPayout && numAmount > selectedPayout.pendingAmount + 1) {
       setError(`Amount cannot exceed pending amount (₹${selectedPayout.pendingAmount.toFixed(2)})`);
       return;
    }

    if (!transactionId.trim()) {
      setError(activeMethod === 'Cheque' ? 'Please enter cheque number' : 'Please enter payment reference');
      return;
    }

    if (activeMethod === 'Cheque') {
      if (!payerName.trim()) {
        setError('Please enter cheque name');
        return;
      }

      if (!chequeCollectionAt) {
        setError('Please enter cheque collection time');
        return;
      }
    }

    const paymentNotes = [
      activeMethod === 'UPI' && `UPI ID: ${transactionId.trim()}`,
      activeMethod === 'Bank Transfer' && `Bank detail: ${notes.trim() || 'Not provided'}`,
      activeMethod === 'Cheque' && `Cheque name: ${payerName.trim()}`,
      activeMethod === 'Cheque' && `Collection time: ${chequeCollectionAt}`,
      activeMethod !== 'Bank Transfer' && notes.trim() ? `Remarks: ${notes.trim()}` : null,
    ].filter(Boolean).join(' | ');

    if (selectedPayout) {
      onCollectPayment(
        selectedPayout.id, 
        numAmount, 
        activeMethod,
        transactionId.trim() || undefined,
        paymentNotes || undefined
      );
    }
  };

  const handleReset = () => {
    setAmount('');
    setTransactionId('');
    setNotes('');
    setPayerName('');
    setChequeCollectionAt('');
    setError('');
    setCopied(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        handleReset();
      }
    }}>
      <DialogContent className="sm:max-w-[560px] max-h-[98vh] overflow-y-auto p-0 border-none shadow-2xl">
        <div className="p-6 pb-2">
            <DialogHeader>
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold">Record Payment</DialogTitle>
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                         <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Settlement</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Select your payment method and record the transaction to clear pending platform fees.
                </p>
            </DialogHeader>
            
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white shadow-lg shadow-primary/20 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-0.5">Payable Balance</p>
                   <p className="text-3xl font-black tracking-tight">₹{selectedPayout?.pendingAmount?.toFixed(2) ?? '0.00'}</p>
                </div>
                <IndianRupee className="h-10 w-10 opacity-20" />
            </div>
        </div>

        <div className="px-6 py-4 space-y-6">
            {/* Selection Section */}
            <div>
                <Label className="text-xs font-black uppercase text-muted-foreground tracking-tighter mb-4 block">Select Payment Method</Label>
                {isLoadingSettings ? (
                    <div className="flex items-center justify-center py-10 border-2 border-dashed rounded-2xl bg-muted/20">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">Loading gateway details...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'UPI', label: 'UPI', icon: Smartphone },
                                { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark },
                                { id: 'Cheque', label: 'Cheque', icon: FileText },
                            ].map((method) => {
                                const Icon = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveMethod(method.id as PaymentMethodType);
                                            setTransactionId('');
                                            setNotes('');
                                            setPayerName('');
                                            setChequeCollectionAt('');
                                            setError('');
                                        }}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-2 px-1 rounded-xl border-2 transition-all group ${
                                            activeMethod === method.id 
                                            ? 'border-primary bg-primary/[0.03] ring-1 ring-primary shadow-sm' 
                                            : 'border-muted bg-transparent hover:border-muted-foreground/30'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${activeMethod === method.id ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground group-hover:bg-muted'}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className={`text-[10px] font-bold truncate w-full px-0.5 ${activeMethod === method.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {method.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Details Area — Dynamic based on selection */}
                        <div className="rounded-2xl border-2 border-dashed border-muted p-5 bg-muted/5 min-h-[160px] flex flex-col justify-center">
                            {(activeMethod === 'UPI' && (adminSettings?.upiId || adminSettings?.upiQrCodeUrl)) ? (
                                <div className="space-y-4 text-center">
                                    {adminSettings.upiQrCodeUrl && (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-white rounded-2xl shadow-xl border">
                                                <img 
                                                    src={adminSettings.upiQrCodeUrl} 
                                                    alt="Admin QR Code" 
                                                    className="w-36 h-36 object-contain"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                                                <QrCode className="h-3 w-3" /> Scan from Any App
                                            </div>
                                        </div>
                                    )}
                                    {adminSettings.upiId && (
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-muted shadow-sm hover:border-primary/50 transition-colors">
                                            <div className="text-left">
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">UPI Identifier</p>
                                                <p className="text-sm font-mono font-black text-foreground">{adminSettings.upiId}</p>
                                                {adminSettings.upiHolderName && <p className="text-[10px] text-muted-foreground font-medium italic mt-0.5">Paygee Name: {adminSettings.upiHolderName}</p>}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(adminSettings.upiId!, 'upi')}
                                                className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                {copied === 'upi' ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (activeMethod === 'Bank Transfer' && adminSettings?.accountNumber) ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { label: 'Beneficiary Name', value: adminSettings?.accountHolder, id: 'holder' },
                                            { label: 'Financial Institution', value: adminSettings?.bankName, sub: adminSettings?.branchName, id: 'bank' },
                                            { label: 'Account Number', value: adminSettings?.accountNumber, id: 'acc', copy: true },
                                            { label: 'IFSC Code', value: adminSettings?.ifscCode, id: 'ifsc', copy: true },
                                        ].map((item) => item.value && (
                                            <div key={item.id} className="flex items-center justify-between p-3 px-4 rounded-xl bg-white border border-muted shadow-sm">
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1.5">{item.label}</p>
                                                    <p className="text-sm font-black text-foreground">
                                                        {item.value} {item.sub && <span className="font-normal text-muted-foreground text-[11px]">({item.sub})</span>}
                                                    </p>
                                                </div>
                                                {item.copy && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(item.value!, item.id)}
                                                        className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        {copied === item.id ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-3 py-6">
                                    <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground">
                                        {activeMethod === 'Cheque' ? <FileText className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                                    </div>
                                    <div className="max-w-xs mx-auto">
                                        <p className="text-sm font-black text-foreground uppercase tracking-tighter">
                                            {activeMethod === 'Cheque' ? 'Cheque Collection Details' : 'Admin Details Not Added'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                                            {activeMethod === 'Cheque'
                                                ? 'Enter cheque name, cheque number, and collection time below.'
                                                : 'Ask admin to add payment settings before recording this method.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeInstructions && (
                                <div className="mt-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-800 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 flex items-center justify-center gap-1.5">
                                        <AlertCircle className="h-3 w-3" /> Admin Instructions
                                    </p>
                                    <p className="text-[11px] font-medium italic">{activeInstructions}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-6 border-t">
                <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="pay-amt" className="text-[10px] font-black uppercase text-muted-foreground ml-1">Settlement Amount (₹)</Label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xl leading-none">₹</span>
                            <Input
                                id="pay-amt"
                                type="number"
                                step="0.01"
                                className="pl-9 h-14 text-2xl font-black bg-muted/5 border-muted focus-visible:ring-primary focus-visible:border-primary transition-all rounded-2xl"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                                required
                            />
                        </div>
                    </div>

                    {activeMethod === 'UPI' && (
                        <div className="space-y-2">
                            <Label htmlFor="upi-id" className="text-[10px] font-black uppercase text-muted-foreground ml-1">UPI ID / Reference <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="upi-id"
                                    className="pl-9 h-11 bg-muted/5 border-muted rounded-xl"
                                    placeholder="name@bank or UTR"
                                    value={transactionId}
                                    onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {activeMethod === 'Bank Transfer' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bank-ref" className="text-[10px] font-black uppercase text-muted-foreground ml-1">Bank Reference / UTR <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="bank-ref"
                                        className="pl-9 h-11 bg-muted/5 border-muted rounded-xl"
                                        placeholder="Enter bank reference"
                                        value={transactionId}
                                        onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bank-detail" className="text-[10px] font-black uppercase text-muted-foreground ml-1">Bank Detail</Label>
                                <div className="relative">
                                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="bank-detail"
                                        className="pl-9 h-11 bg-muted/5 border-muted rounded-xl"
                                        placeholder="Bank name / account last 4"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMethod === 'Cheque' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cheque-number" className="text-[10px] font-black uppercase text-muted-foreground ml-1">Cheque Number <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cheque-number"
                                        className="pl-9 h-11 bg-muted/5 border-muted rounded-xl"
                                        placeholder="Enter cheque number"
                                        value={transactionId}
                                        onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cheque-name" className="text-[10px] font-black uppercase text-muted-foreground ml-1">Cheque Name <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cheque-name"
                                        className="pl-9 h-11 bg-muted/5 border-muted rounded-xl"
                                        placeholder="Name on cheque"
                                        value={payerName}
                                        onChange={(e) => { setPayerName(e.target.value); setError(''); }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cheque-time" className="text-[10px] font-black uppercase text-muted-foreground ml-1">Collection Time <span className="text-red-500">*</span></Label>
                                <Input
                                    id="cheque-time"
                                    type="datetime-local"
                                    className="h-11 bg-muted/5 border-muted rounded-xl"
                                    value={chequeCollectionAt}
                                    onChange={(e) => { setChequeCollectionAt(e.target.value); setError(''); }}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cheque-remarks" className="text-[10px] font-black uppercase text-muted-foreground ml-1">Remarks</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="cheque-remarks"
                                        className="pl-9 h-11 bg-muted/5 border-muted rounded-xl"
                                        placeholder="Optional remarks"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && <p className="text-sm text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</p>}

                <div className="flex gap-4 pt-4 pb-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 h-12 text-muted-foreground font-bold hover:bg-muted"
                        onClick={() => { onClose(); handleReset(); }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isProcessing || (isLoadingSettings && !adminSettings)}
                        className="flex-[2] h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wider shadow-lg shadow-primary/30 rounded-xl"
                    >
                        {isProcessing ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...</>
                        ) : (
                            <><Plus className="mr-2 h-4 w-4" /> Record Settlement</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettlementsPaymentModal;
