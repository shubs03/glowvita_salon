
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { StatCard } from '../../../components/profile/StatCard';
import { Wallet, Gift, DollarSign, Plus, ArrowUp, ArrowDown, Send } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Pagination } from '@repo/ui/pagination';

const initialWallet = {
  balance: 250,
  transactions: [
    { id: "W-001", date: "2024-08-01T10:00:00Z", description: "Refund for cancelled booking", amount: 50, type: 'credit' },
    { id: "W-002", date: "2024-07-01T11:00:00Z", description: "Promotional credit added", amount: 200, type: 'credit' },
    { id: "W-003", date: "2024-07-15T14:30:00Z", description: "Used for 'Signature Facial' booking", amount: -75, type: 'debit' },
  ],
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
};

export default function WalletPage() {
    const [wallet, setWallet] = useState(initialWallet);
    const [addAmount, setAddAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const handleAddMoney = () => {
        const amount = parseFloat(addAmount);
        if(isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount to add.");
            return;
        }

        const newTransaction: Transaction = {
            id: `W-ADD-${Date.now()}`,
            date: new Date().toISOString(),
            description: `Added money to wallet`,
            amount: amount,
            type: 'credit',
        };

        setWallet(prev => ({
            balance: prev.balance + amount,
            transactions: [newTransaction, ...prev.transactions]
        }));

        toast.success(`₹${amount.toFixed(2)} added to your wallet!`);
        setAddAmount('');
    };

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount to withdraw.");
            return;
        }
        if (amount > wallet.balance) {
            toast.error("Withdrawal amount cannot exceed your current balance.");
            return;
        }

        const newTransaction: Transaction = {
            id: `W-WDR-${Date.now()}`,
            date: new Date().toISOString(),
            description: 'Withdrawal to bank account',
            amount: -amount,
            type: 'debit',
        };

        setWallet(prev => ({
            balance: prev.balance - amount,
            transactions: [newTransaction, ...prev.transactions]
        }));

        toast.success(`Withdrawal request for ₹${amount.toFixed(2)} submitted.`);
        setWithdrawAmount('');
    };

    const filteredTransactions = wallet.transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.type === filter;
    });

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const totalDeposits = wallet.transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
    const totalWithdrawals = wallet.transactions.filter(t => t.description.includes('Withdrawal')).reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={Wallet} title="Current Balance" value={`₹${wallet.balance.toFixed(2)}`} change="Available to spend" />
                <StatCard icon={Gift} title="Total Deposits" value={`₹${totalDeposits.toFixed(2)}`} change="From promotions & top-ups" />
                <StatCard icon={Send} title="Total Withdrawn" value={`₹${totalWithdrawals.toFixed(2)}`} change="Transferred to your bank" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Money to Wallet</CardTitle>
                        <CardDescription>Instantly add funds for quick payments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="w-full sm:w-auto flex-grow">
                                <Label htmlFor="addAmount">Amount (₹)</Label>
                                <Input 
                                    id="addAmount"
                                    type="number" 
                                    placeholder="Enter amount" 
                                    value={addAmount} 
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    min="1"
                                />
                            </div>
                            <Button onClick={handleAddMoney} className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Money
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Withdraw Funds</CardTitle>
                        <CardDescription>Transfer your wallet balance to your bank account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="w-full sm:w-auto flex-grow">
                                <Label htmlFor="withdrawAmount">Amount (₹)</Label>
                                <Input 
                                    id="withdrawAmount"
                                    type="number" 
                                    placeholder="Enter amount" 
                                    value={withdrawAmount} 
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    min="1"
                                    max={wallet.balance}
                                />
                            </div>
                            <Button onClick={handleWithdraw} variant="outline" className="w-full sm:w-auto">
                                <Send className="mr-2 h-4 w-4" /> Request Withdrawal
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>A record of all your wallet transactions.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
                            <Button variant={filter === 'credit' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('credit')}>Credits</Button>
                            <Button variant={filter === 'debit' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('debit')}>Debits</Button>
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
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTransactions.length > 0 ? (
                                    currentTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {tx.type === 'credit' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                                                    </div>
                                                    {tx.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.amount > 0 ? '+' : ''}₹{tx.amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                            No transactions found for this filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredTransactions.length > itemsPerPage && (
                        <Pagination
                            className="mt-4"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={filteredTransactions.length}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
