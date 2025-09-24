
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { StatCard } from '../../../components/profile/StatCard';
import { Wallet, Gift } from 'lucide-react';

const wallet = {
  balance: 250,
  transactions: [
    { id: "W-001", date: "2024-08-01T10:00:00Z", description: "Refund for cancelled booking", amount: 50 },
    { id: "W-002", date: "2024-07-01T11:00:00Z", description: "Promotional credit added", amount: 200 },
  ],
};

export default function WalletPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Wallet</CardTitle>
                <CardDescription>Your wallet balance and transaction history.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <StatCard icon={Wallet} title="Current Balance" value={`₹${wallet.balance.toFixed(2)}`} change="+₹50 last week" />
                    <StatCard icon={Gift} title="Total Credits" value={`₹${wallet.transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}`} change="All time" />
                </div>
                <h4 className="font-semibold mb-4">Transaction History</h4>
                <div className="space-y-2">
                    {wallet.transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-secondary rounded-md">
                            <div>
                                <p>{tx.description}</p>
                                <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                            </div>
                            <p className="font-semibold text-blue-600">+₹{tx.amount.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
