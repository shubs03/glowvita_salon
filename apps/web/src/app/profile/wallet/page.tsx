
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { StatCard } from '../../../components/profile/StatCard';
import { Wallet, Gift, Send, Plus, ArrowUp, ArrowDown, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Pagination } from '@repo/ui/pagination';
import { Badge } from '@repo/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Alert, AlertDescription } from '@repo/ui/alert';
import { 
  useGetClientWalletQuery, 
  useAddMoneyToWalletMutation,
  useVerifyWalletPaymentMutation,
  useWithdrawFromWalletMutation,
  useGetWithdrawalHistoryQuery
} from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Transaction = {
  _id: string;
  transactionId: string;
  transactionType: 'credit' | 'debit';
  amount: number;
  source: string;
  status: string;
  description: string;
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
};

export default function WalletPage() {
    const { isAuthenticated } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
    
    // Add money states
    const [addAmount, setAddAmount] = useState('');
    const [isAddingMoney, setIsAddingMoney] = useState(false);
    
    // Withdrawal states
    const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifsc: '',
        accountHolderName: '',
        bankName: '',
    });

    // Fetch wallet data
    const { data: walletData, isLoading: walletLoading, refetch: refetchWallet } = useGetClientWalletQuery({
        page: currentPage,
        limit: itemsPerPage,
        type: filter !== 'all' ? filter : undefined
    }, {
        skip: !isAuthenticated
    });

    // Mutations
    const [addMoneyToWallet, { isLoading: isAddingMoneyLoading }] = useAddMoneyToWalletMutation();
    const [verifyWalletPayment] = useVerifyWalletPaymentMutation();
    const [withdrawFromWallet, { isLoading: isWithdrawing }] = useWithdrawFromWalletMutation();

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleAddMoney = async () => {
        const amount = parseFloat(addAmount);
        
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount < 10) {
            toast.error('Minimum amount to add is ₹10');
            return;
        }

        if (amount > 100000) {
            toast.error('Maximum amount to add is ₹100,000');
            return;
        }

        try {
            setIsAddingMoney(true);
            
            // Create Razorpay order
            const result = await addMoneyToWallet({ amount }).unwrap();
            
            if (result.success && result.data.order) {
                const { order, transactionId } = result.data;
                
                // Initialize Razorpay
                const options = {
                    key: order.razorpayKeyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'GlowVita',
                    description: 'Add Money to Wallet',
                    order_id: order.id,
                    handler: async function (response: any) {
                        try {
                            // Verify payment
                            const verifyResult = await verifyWalletPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                transactionId: transactionId
                            }).unwrap();

                            if (verifyResult.success) {
                                toast.success(verifyResult.message);
                                setAddAmount('');
                                refetchWallet();
                            } else {
                                toast.error(verifyResult.message || 'Payment verification failed');
                            }
                        } catch (error: any) {
                            console.error('Payment verification error:', error);
                            toast.error(error.data?.message || 'Payment verification failed');
                        } finally {
                            setIsAddingMoney(false);
                        }
                    },
                    prefill: {
                        name: walletData?.data?.userName || '',
                    },
                    theme: {
                        color: '#8B5CF6'
                    },
                    modal: {
                        ondismiss: function() {
                            setIsAddingMoney(false);
                            toast.info('Payment cancelled');
                        }
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            }
        } catch (error: any) {
            console.error('Error adding money:', error);
            toast.error(error.data?.message || 'Failed to initiate payment');
            setIsAddingMoney(false);
        }
    };

    const handleWithdrawal = async () => {
        const amount = parseFloat(withdrawalAmount);
        const method = (bankDetails as any).withdrawalMethod || 'bank_transfer';

        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        
        if (!bankDetails.accountHolderName) {
            toast.error('Account holder name is required');
            return;
        }

        if (method === 'upi') {
            if (!(bankDetails as any).upiId) {
                toast.error('Please enter UPI ID');
                return;
            }
            
            // Validate UPI ID format
            const upiRegex = /^[\w.-]+@[\w.-]+$/;
            if (!upiRegex.test((bankDetails as any).upiId)) {
                toast.error('Invalid UPI ID format');
                return;
            }
        } else {
            if (!bankDetails.accountNumber || !bankDetails.ifsc) {
                toast.error('Please fill all bank details');
                return;
            }

            // Validate IFSC code format
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!ifscRegex.test(bankDetails.ifsc.toUpperCase())) {
                toast.error('Invalid IFSC code format');
                return;
            }

            // Validate account number
            const accountRegex = /^[0-9]{9,18}$/;
            if (!accountRegex.test(bankDetails.accountNumber)) {
                toast.error('Account number must be 9-18 digits');
                return;
            }
        }

        try {
            const result = await withdrawFromWallet({
                amount,
                bankDetails: {
                    ...bankDetails,
                    withdrawalMethod: method
                }
            }).unwrap();

            if (result.success) {
                toast.success(result.message);
                setShowWithdrawalDialog(false);
                setWithdrawalAmount('');
                setBankDetails({
                    accountNumber: '',
                    ifsc: '',
                    accountHolderName: '',
                    bankName: '',
                    withdrawalMethod: 'bank_transfer',
                    upiId: ''
                } as any);
                refetchWallet();
            } else {
                toast.error(result.message || 'Withdrawal request failed');
            }
        } catch (error: any) {
            console.error('Withdrawal error:', error);
            toast.error(error.data?.message || 'Failed to process withdrawal request');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to access your wallet.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (walletLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading wallet...</p>
                </div>
            </div>
        );
    }

    const balance = walletData?.data?.balance || 0;
    const stats = walletData?.data?.stats || { totalDeposits: 0, totalWithdrawals: 0, totalReferralEarnings: 0 };
    const transactions = walletData?.data?.transactions || [];
    const pagination = walletData?.data?.pagination || { currentPage: 1, totalPages: 1 };
    const withdrawalLimits = walletData?.data?.withdrawalLimits || {};

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={Wallet} 
                    title="Current Balance" 
                    value={`₹${balance.toFixed(2)}`} 
                    change="Available to spend" 
                />
                <StatCard 
                    icon={Gift} 
                    title="Total Deposits" 
                    value={`₹${stats.totalDeposits.toFixed(2)}`} 
                    change="From all sources" 
                />
                <StatCard 
                    icon={Send} 
                    title="Total Withdrawn" 
                    value={`₹${stats.totalWithdrawals.toFixed(2)}`} 
                    change="Transferred to bank" 
                />
                <StatCard 
                    icon={Gift} 
                    title="Referral Earnings" 
                    value={`₹${stats.totalReferralEarnings.toFixed(2)}`} 
                    change="From referrals" 
                />
            </div>

            {/* Add Money & Withdraw Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Money */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add Money to Wallet</CardTitle>
                        <CardDescription>
                            Instantly add funds for quick payments. Min: ₹10, Max: ₹1,00,000
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="addAmount">Amount (₹)</Label>
                                <Input 
                                    id="addAmount"
                                    type="number" 
                                    placeholder="Enter amount" 
                                    value={addAmount} 
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    min="10"
                                    max="100000"
                                    disabled={isAddingMoney || isAddingMoneyLoading}
                                />
                            </div>
                            <Button 
                                onClick={handleAddMoney} 
                                className="w-full"
                                disabled={isAddingMoney || isAddingMoneyLoading}
                            >
                                {isAddingMoney || isAddingMoneyLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" /> 
                                        Add Money
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Withdraw Money */}
                <Card>
                    <CardHeader>
                        <CardTitle>Withdraw Funds</CardTitle>
                        <CardDescription>
                            Transfer wallet balance to your bank account instantly
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {withdrawalLimits && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        Min: ₹{withdrawalLimits.minWithdrawal} | Max: ₹{withdrawalLimits.maxWithdrawal}
                                        {withdrawalLimits.canWithdrawToday === false && (
                                            <span className="block text-red-600 mt-1">
                                                Daily limit reached. Try again tomorrow.
                                            </span>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Button 
                                onClick={() => setShowWithdrawalDialog(true)} 
                                variant="outline" 
                                className="w-full"
                                disabled={balance <= 0 || withdrawalLimits.canWithdrawToday === false}
                            >
                                <Send className="mr-2 h-4 w-4" /> 
                                Request Withdrawal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>A record of all your wallet transactions</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant={filter === 'all' ? 'default' : 'outline'} 
                                size="sm" 
                                onClick={() => { setFilter('all'); setCurrentPage(1); }}
                            >
                                All
                            </Button>
                            <Button 
                                variant={filter === 'credit' ? 'default' : 'outline'} 
                                size="sm" 
                                onClick={() => { setFilter('credit'); setCurrentPage(1); }}
                            >
                                Credits
                            </Button>
                            <Button 
                                variant={filter === 'debit' ? 'default' : 'outline'} 
                                size="sm" 
                                onClick={() => { setFilter('debit'); setCurrentPage(1); }}
                            >
                                Debits
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length > 0 ? (
                                    transactions.map((tx: Transaction) => (
                                        <TableRow key={tx._id}>
                                            <TableCell className="text-sm">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${
                                                        tx.transactionType === 'credit' 
                                                            ? 'bg-green-100 text-green-600' 
                                                            : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {tx.transactionType === 'credit' ? (
                                                            <ArrowDown className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowUp className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{tx.description}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {tx.transactionId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    tx.status === 'completed' ? 'default' :
                                                    tx.status === 'pending' ? 'secondary' :
                                                    tx.status === 'failed' ? 'destructive' : 'outline'
                                                }>
                                                    {tx.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${
                                                tx.transactionType === 'credit' 
                                                    ? 'text-green-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {pagination.totalPages > 1 && (
                        <Pagination
                            className="mt-4"
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={pagination.totalTransactions}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Withdrawal Dialog */}
            <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Withdraw Funds</DialogTitle>
                        <DialogDescription>
                            Enter withdrawal amount and bank details. Money will be credited within 30 minutes to 2 hours.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="withdrawalAmount">Withdrawal Amount (₹)</Label>
                            <Input 
                                id="withdrawalAmount"
                                type="number" 
                                placeholder="Enter amount" 
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                min={withdrawalLimits.minWithdrawal || 100}
                                max={Math.min(balance, withdrawalLimits.maxWithdrawal || 50000)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Available balance: ₹{balance.toFixed(2)}
                            </p>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Account Details
                                </h4>
                                <div className="flex bg-muted p-1 rounded-md">
                                    <button
                                        onClick={() => setBankDetails(prev => ({ ...prev, withdrawalMethod: 'bank_transfer' }))}
                                        className={`text-xs px-3 py-1 rounded-sm transition-all ${
                                            (bankDetails as any).withdrawalMethod !== 'upi' 
                                                ? 'bg-background shadow-sm font-medium' 
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Bank Transfer
                                    </button>
                                    <button
                                        onClick={() => setBankDetails(prev => ({ ...prev, withdrawalMethod: 'upi' }))}
                                        className={`text-xs px-3 py-1 rounded-sm transition-all ${
                                            (bankDetails as any).withdrawalMethod === 'upi' 
                                                ? 'bg-background shadow-sm font-medium' 
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        UPI
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                    <Input 
                                        id="accountHolderName"
                                        placeholder="As per bank account/UPI" 
                                        value={bankDetails.accountHolderName}
                                        onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                                    />
                                </div>

                                {(bankDetails as any).withdrawalMethod === 'upi' ? (
                                    <div>
                                        <Label htmlFor="upiId">UPI ID</Label>
                                        <Input 
                                            id="upiId"
                                            placeholder="username@upi" 
                                            value={(bankDetails as any).upiId || ''}
                                            onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value} as any)}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            E.g. mobilenumber@upi, username@oksbi
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <Label htmlFor="accountNumber">Account Number</Label>
                                            <Input 
                                                id="accountNumber"
                                                type="text"
                                                placeholder="Enter account number" 
                                                value={bankDetails.accountNumber}
                                                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="ifsc">IFSC Code</Label>
                                            <Input 
                                                id="ifsc"
                                                placeholder="SBIN0001234" 
                                                value={bankDetails.ifsc}
                                                onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                                                maxLength={11}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="bankName">Bank Name (Optional)</Label>
                                            <Input 
                                                id="bankName"
                                                placeholder="State Bank of India" 
                                                value={bankDetails.bankName}
                                                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowWithdrawalDialog(false)}
                            disabled={isWithdrawing}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleWithdrawal}
                            disabled={isWithdrawing}
                        >
                            {isWithdrawing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Withdrawal'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
