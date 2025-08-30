
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { DollarSign, Download, Filter, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

type Transaction = {
  id: string;
  date: string;
  description: string;
  type: 'Consultation Fee' | 'Referral Bonus' | 'Payout';
  amount: number;
  status: 'Completed' | 'Pending';
};

const mockTransactions: Transaction[] = [
  { id: 'TRN-001', date: '2024-08-20', description: 'Consultation with Alex J.', type: 'Consultation Fee', amount: 1500, status: 'Completed' },
  { id: 'TRN-002', date: '2024-08-18', description: 'Payout to Bank Account', type: 'Payout', amount: -5000, status: 'Completed' },
  { id: 'TRN-003', date: '2024-08-15', description: 'Referral bonus for Dr. White', type: 'Referral Bonus', amount: 500, status: 'Completed' },
  { id: 'TRN-004', date: '2024-08-12', description: 'Consultation with Samantha M.', type: 'Consultation Fee', amount: 2000, status: 'Completed' },
  { id: 'TRN-005', date: '2024-08-10', description: 'Consultation with Michael C.', type: 'Consultation Fee', amount: 1500, status: 'Pending' },
];

const chartData = [
  { month: "Mar", earnings: 12000 },
  { month: "Apr", earnings: 15000 },
  { month: "May", earnings: 13000 },
  { month: "Jun", earnings: 17000 },
  { month: "Jul", earnings: 19000 },
  { month: "Aug", earnings: 21000 },
];

export default function EarningsPage() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  
  const totalEarnings = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalPayouts = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
  const availableBalance = totalEarnings + totalPayouts;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold font-headline">My Earnings</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">₹{availableBalance.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Ready for payout</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-green-600">₹{totalEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All-time earnings</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">₹{Math.abs(totalPayouts).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total amount withdrawn</p>
              </CardContent>
          </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your earnings over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} cursor={{ fill: 'hsl(var(--secondary))' }}/>
                      <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A detailed record of all your earnings and payouts.</CardDescription>
              </div>
              <div className="flex gap-2">
                  <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                  <Button><Download className="mr-2 h-4 w-4" /> Export</Button>
              </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto no-scrollbar rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell className="font-medium">{transaction.description}</TableCell>
                                <TableCell>{transaction.type}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {transaction.status}
                                    </span>
                                </TableCell>
                                <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.amount > 0 ? '+' : ''}₹{transaction.amount.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
