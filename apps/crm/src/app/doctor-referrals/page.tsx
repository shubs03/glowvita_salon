
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Copy, Gift, UserPlus, Users } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';

type Referral = {
    id: string;
    referredName: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Bonus Paid';
    bonusAmount: number;
};

const mockReferrals: Referral[] = [
    { id: 'REF-001', referredName: 'Dr. Emily White', date: '2024-08-15', status: 'Bonus Paid', bonusAmount: 500 },
    { id: 'REF-002', referredName: 'Dr. Michael Brown', date: '2024-07-20', status: 'Approved', bonusAmount: 500 },
    { id: 'REF-003', referredName: 'Dr. Sarah Green', date: '2024-06-10', status: 'Pending', bonusAmount: 500 },
];

export default function DoctorReferralsPage() {
    const [referrals] = useState<Referral[]>(mockReferrals);
    const referralLink = "https://yourapp.com/register?ref=DOC123";
    const totalBonus = referrals.reduce((acc, r) => r.status === 'Bonus Paid' ? acc + r.bonusAmount : acc, 0);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success("Referral link copied to clipboard!");
    };
    
    const getStatusColor = (status: Referral['status']) => {
        switch (status) {
          case 'Approved': return 'bg-blue-100 text-blue-800';
          case 'Bonus Paid': return 'bg-green-100 text-green-800';
          case 'Pending': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <h1 className="text-2xl font-bold font-headline">My Referrals</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.length}</div>
                        <p className="text-xs text-muted-foreground">Total professionals invited</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Referrals</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{referrals.filter(r => r.status !== 'Pending').length}</div>
                        <p className="text-xs text-muted-foreground">Successfully joined professionals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bonus Earned</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalBonus.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From all successful referrals</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Link</CardTitle>
                    <CardDescription>Share this link to invite other doctors and professionals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input value={referralLink} readOnly className="bg-secondary" />
                        <Button onClick={handleCopyLink} className="w-full sm:w-auto">
                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Referral History</CardTitle>
                    <CardDescription>Track the status of your referrals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Referred Professional</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Bonus Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referrals.map((referral) => (
                                    <TableRow key={referral.id}>
                                        <TableCell className="font-medium">{referral.referredName}</TableCell>
                                        <TableCell>{referral.date}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(referral.status)}`}>
                                                {referral.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">₹{referral.bonusAmount.toFixed(2)}</TableCell>
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
