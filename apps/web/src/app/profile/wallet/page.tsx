
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { StatCard } from '../../../components/profile/StatCard';
import { Wallet, Gift, DollarSign, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { toast } from 'sonner';

const initialWallet = {
  balance: 250,
  transactions: [
    { id: "W-001", date: "2024-08-01T10:00:00Z", description: "Refund for cancelled booking", amount: 50, type: 'credit' },
    { id: "W-002", date: "2024-07-01T11:00:00Z", description: "Promotional credit added", amount: 200, type: 'credit' },
    { id: "W-003", date: "2024-07-15T14:30:00Z", description: "Used for 'Signature Facial' booking", amount: -75, type: 'debit' },
  ],
};

export default function WalletPage() {
    const [wallet, setWallet] = useState(initialWallet);
    const [addAmount, setAddAmount] = useState('');
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

    const handleAddMoney = () => {
        const amount = parseFloat(addAmount);
        if(isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        const newTransaction = {
            id: `W-${Date.now()}`,
            date: new Date().toISOString(),
            description: `Added money to wallet`,
            amount: amount,
            type: 'credit' as const,
        };

        setWallet(prev => ({
            balance: prev.balance + amount,
            transactions: [newTransaction, ...prev.transactions]
        }));

        toast.success(`₹${amount.toFixed(2)} added to your wallet!`);
        setAddAmount('');
    };

    const filteredTransactions = wallet.transactions.filter(tx => {
        if (filter === 'all') return true;
        return tx.type === filter;
    });

    const totalCredits = wallet.transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <StatCard icon={Wallet} title="Current Balance" value={`₹${wallet.balance.toFixed(2)}`} change="Updated just now" />
                <StatCard icon={Gift} title="Total Credits" value={`₹${totalCredits.toFixed(2)}`} change="From promotions & refunds" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add Money to Wallet</CardTitle>
                    <CardDescription>Instantly add funds to your wallet for quick and easy payments.</CardDescription>
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
                    <div className="space-y-3">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center p-3 bg-secondary rounded-md">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {tx.type === 'credit' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p>{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No transactions found for this filter.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
