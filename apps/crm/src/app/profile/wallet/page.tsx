"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Wallet, Gift, Send, Plus, ArrowUp, ArrowDown, Loader2, AlertCircle, Building2, Clock, History, CreditCard } from 'lucide-react';
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
  useGetCrmWalletQuery,
  useWithdrawFromCrmWalletMutation
} from '@repo/store/api';
import { useCrmAuth } from '@/hooks/useCrmAuth';

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

export default function CrmWalletPage() {
    const { user, role, isCrmAuthenticated } = useCrmAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Withdrawal states
    const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifsc: '',
        accountHolderName: '',
        bankName: '',
        withdrawalMethod: 'bank_transfer',
        upiId: ''
    });

    // Fetch wallet data
    const { data: walletResp, isLoading: walletLoading, refetch: refetchWallet } = useGetCrmWalletQuery({
        page: currentPage,
        limit: itemsPerPage
    }, {
        skip: !isCrmAuthenticated,
        refetchOnMountOrArgChange: true
    });

    const [withdrawFromWallet, { isLoading: isWithdrawing }] = useWithdrawFromCrmWalletMutation();

    const handleWithdrawal = async () => {
        const amount = parseFloat(withdrawalAmount);
        const method = bankDetails.withdrawalMethod;
        const balance = walletResp?.data?.balance || 0;
        const settings = walletResp?.data?.settings || {};

        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const minBalance = settings.minWalletBalanceForWithdrawal || 50;
        if (balance < minBalance) {
            toast.error(`Minimum wallet balance of ₹${minBalance} is required to withdraw`);
            return;
        }

        const minWithdrawal = settings.minWithdrawalAmount || 100;
        if (amount < minWithdrawal) {
            toast.error(`Minimum withdrawal amount is ₹${minWithdrawal}`);
            return;
        }

        const maxWithdrawablePercentage = settings.maxWithdrawablePercentage || 50;
        const maxAllowed = (balance * maxWithdrawablePercentage) / 100;
        if (amount > maxAllowed) {
            toast.error(`You can only withdraw up to ${maxWithdrawablePercentage}% of your wallet balance (₹${maxAllowed.toFixed(2)})`);
            return;
        }
        
        if (!bankDetails.accountHolderName) {
            toast.error('Account holder name is required');
            return;
        }   

        if (method === 'upi') {
            if (!bankDetails.upiId) {
                toast.error('Please enter UPI ID');
                return;
            }
            const upiRegex = /^[\w.-]+@[\w.-]+$/;
            if (!upiRegex.test(bankDetails.upiId)) {
                toast.error('Invalid UPI ID format');
                return;
            }
        } else {
            if (!bankDetails.accountNumber || !bankDetails.ifsc) {
                toast.error('Please fill all bank details');
                return;
            }
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!ifscRegex.test(bankDetails.ifsc.toUpperCase())) {
                toast.error('Invalid IFSC code format');
                return;
            }
            const accountRegex = /^[0-9]{9,18}$/;
            if (!accountRegex.test(bankDetails.accountNumber)) {
                toast.error('Account number must be 9-18 digits');
                return;
            }
        }

        try {
            const result: any = await withdrawFromWallet({
                amount,
                bankDetails: {
                    ...bankDetails,
                    ifsc: bankDetails.ifsc.toUpperCase()
                },
                withdrawalMethod: method
            }).unwrap();

            if (result.success) {
                toast.success(result.message || 'Withdrawal initiated successfully');
                setShowWithdrawalDialog(false);
                setWithdrawalAmount('');
                refetchWallet();
            } else {
                toast.error(result.message || 'Withdrawal failed');
            }
        } catch (error: any) {
            console.error('Withdrawal error:', error);
            toast.error(error.data?.message || 'Failed to process withdrawal');
        }
    };

    if (!isCrmAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <AlertCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Access Restricted</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">Please log in to your account to manage your wallet.</p>
                <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
            </div>
        );
    }

    if (walletLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Loading wallet details...</p>
            </div>
        );
    }

    const walletData = walletResp?.data;
    const balance = walletData?.balance || 0;
    const transactions = walletData?.transactions || [];
    const pagination = walletData?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
    const settings = walletData?.settings || {};

    return (
        <div className="min-h-screen bg-background">
            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Fixed Header Style */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold font-headline mb-1 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                                Wallet & Payouts
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                                Manage your earnings, referral bonuses, and payout requests.
                            </p>
                        </div>
                        {walletData?.referralCode && (
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Referral Code</span>
                                <Badge variant="outline" className="text-lg py-1.5 px-4 font-mono border-primary/20 bg-primary/5 text-primary">
                                    {walletData.referralCode}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stat Cards - Consistent with Dashboard */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <StatCard
                        title="Wallet Balance"
                        value={`₹${balance.toLocaleString('en-IN')}`}
                        subtitle="Total earnings"
                        change="+0.0%"
                        icon={Wallet}
                        iconColor="text-primary"
                    />
                    <StatCard
                        title="Withdrawable"
                        value={`₹${((balance * (settings.maxWithdrawablePercentage || 50)) / 100).toLocaleString('en-IN')}`}
                        subtitle={`${settings.maxWithdrawablePercentage || 50}% of total balance`}
                        change="Limit"
                        icon={ArrowUp}
                        iconColor="text-primary"
                    />
                    <StatCard
                        title="Referral Rewards"
                        value="₹0"
                        subtitle="Bonus earnings"
                        change="+0"
                        icon={Gift}
                        iconColor="text-primary"
                    />
                    <StatCard
                        title="Min. Balance"
                        value={`₹${settings.minWalletBalanceForWithdrawal || 50}`}
                        subtitle="Required for payout"
                        change="Requirement"
                        icon={AlertCircle}
                        iconColor="text-primary"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Withdrawal Action Card */}
                    <Card className="lg:col-span-1 border-primary/10 overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Withdrawal Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                                    <p className="text-sm text-muted-foreground mb-1">Available for Payout</p>
                                    <p className="text-3xl font-bold">₹{((balance * (settings.maxWithdrawablePercentage || 50)) / 100).toLocaleString('en-IN')}</p>
                                </div>
                                
                                <Alert variant="default" className="bg-primary/5 border-primary/20">
                                    <AlertCircle className="h-4 w-4 text-primary" />
                                    <AlertDescription className="text-xs text-primary/80">
                                        You can withdraw up to {settings.maxWithdrawablePercentage || 50}% of your wallet balance. Minimum withdrawal amount is ₹{settings.minWithdrawalAmount || 100}.
                                    </AlertDescription>
                                </Alert>

                                <Button 
                                    className="w-full h-12 text-base font-bold rounded-xl"
                                    onClick={() => {
                                        const minBalance = settings.minWalletBalanceForWithdrawal || 50;
                                        if (balance < minBalance) {
                                            toast.error(`Minimum wallet balance of ₹${minBalance} is required to withdraw.`);
                                            return;
                                        }
                                        setShowWithdrawalDialog(true);
                                    }}
                                >
                                    Withdraw Rewards
                                </Button>

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                            <Clock className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Processing Time</p>
                                            <p className="text-xs text-muted-foreground">Most payouts are processed within 24-48 hours via RazorpayX.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Bank & UPI</p>
                                            <p className="text-xs text-muted-foreground">Instant UPI transfers or Direct Bank Payouts available.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction History Table */}
                    <Card className="lg:col-span-2 border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <History className="h-5 w-5 text-primary" />
                                    Recent Transactions
                                </CardTitle>
                                <CardDescription>Your latest credits and debits</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Transaction ID</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length > 0 ? (
                                        transactions.map((tx: Transaction) => (
                                            <TableRow key={tx._id} className="hover:bg-muted/10 transition-colors">
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{tx.description}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">{tx.source.replace('_', ' ')}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                                                    {tx.transactionId || tx._id.substring(0, 10).toUpperCase()}
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${tx.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.transactionType === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                                No transactions found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            {pagination.totalPages > 1 && (
                                <div className="p-4 border-t flex justify-end">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={pagination.totalPages}
                                        onPageChange={setCurrentPage}
                                        itemsPerPage={itemsPerPage}
                                        onItemsPerPageChange={setItemsPerPage}
                                        totalItems={pagination.totalItems || transactions.length}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Withdrawal Dialog - Consistent with CRM Modals */}
            <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Request Withdrawal</DialogTitle>
                        <DialogDescription>
                            Enter your details to initiate a payout to your bank or UPI account.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Withdrawal Amount (₹)</Label>
                            <Input 
                                id="amount"
                                type="number" 
                                placeholder="0.00"
                                className="text-lg font-bold"
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground">Max allowed today: ₹{((balance * (settings.maxWithdrawablePercentage || 50)) / 100).toFixed(2)}</p>
                        </div>

                        <div className="space-y-3">
                            <Label>Payout Method</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    type="button"
                                    variant={bankDetails.withdrawalMethod === 'bank_transfer' ? 'default' : 'outline'}
                                    className="w-full text-xs"
                                    onClick={() => setBankDetails(prev => ({...prev, withdrawalMethod: 'bank_transfer'}))}
                                >
                                    Bank Transfer
                                </Button>
                                <Button 
                                    type="button"
                                    variant={bankDetails.withdrawalMethod === 'upi' ? 'default' : 'outline'}
                                    className="w-full text-xs"
                                    onClick={() => setBankDetails(prev => ({...prev, withdrawalMethod: 'upi'}))}
                                >
                                    Instant UPI
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label className="text-xs">Account Holder Name</Label>
                                <Input 
                                    placeholder="As per bank records" 
                                    value={bankDetails.accountHolderName}
                                    onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                                />
                            </div>

                            {bankDetails.withdrawalMethod === 'upi' ? (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <Label className="text-xs">UPI ID</Label>
                                    <Input 
                                        placeholder="username@upi" 
                                        value={bankDetails.upiId}
                                        onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                                    />
                                </div>
                            ) : (
                                <div className="grid gap-4 animate-in fade-in duration-300">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Account Number</Label>
                                        <Input 
                                            placeholder="Enter account number" 
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">IFSC Code</Label>
                                        <Input 
                                            className="uppercase"
                                            placeholder="SBIN0001234" 
                                            value={bankDetails.ifsc}
                                            onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>Cancel</Button>
                        <Button 
                          onClick={handleWithdrawal} 
                          disabled={isWithdrawing || !withdrawalAmount}
                        >
                            {isWithdrawing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Confirm Payout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
