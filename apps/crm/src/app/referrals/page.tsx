
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Share2, Users, Gift, CheckCircle } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';

type Referral = {
    id: string;
    referredVendor: string;
    date: string;
    status: 'Pending' | 'Completed' | 'Bonus Paid';
    bonusAmount: number;
};

const mockReferrals: Referral[] = [
    { id: 'REF-001', referredVendor: 'Elite Hair Studio', date: '2024-08-10', status: 'Completed', bonusAmount: 500 },
    { id: 'REF-002', referredVendor: 'The Nail Bar', date: '2024-07-22', status: 'Bonus Paid', bonusAmount: 500 },
    { id: 'REF-003', referredVendor: 'Urban Spa', date: '2024-08-15', status: 'Pending', bonusAmount: 500 },
];

export default function ReferralsPage() {
    const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    
    const referralLink = "https://monorepo-maestro.com/signup?ref=VENDOR123";

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = referrals.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(referrals.length / itemsPerPage);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success("Referral link copied to clipboard!");
    };
    
    const getStatusColor = (status: Referral['status']) => {
        switch (status) {
          case 'Completed': return 'bg-blue-100 text-blue-800';
          case 'Bonus Paid': return 'bg-green-100 text-green-800';
          case 'Pending': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold font-headline mb-6">Refer a Vendor</h1>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.length}</div>
                        <p className="text-xs text-muted-foreground">Vendors you've referred</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{referrals.filter(r => r.status !== 'Pending').length}</div>
                        <p className="text-xs text-muted-foreground">Vendors who successfully signed up</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bonus Earned</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{referrals.filter(r=>r.status === 'Bonus Paid').reduce((acc, r) => acc + r.bonusAmount, 0)}</div>
                        <p className="text-xs text-muted-foreground">Bonuses paid out to you</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Your Referral Link</CardTitle>
                    <CardDescription>Share this link with other vendors. When they sign up, you'll get a bonus!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input value={referralLink} readOnly />
                        <Button onClick={handleCopyLink} className="w-full sm:w-auto">
                            <Share2 className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Referral History</CardTitle>
                    <CardDescription>Track the status of your referred vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Referred Vendor</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Bonus</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map(referral => (
                                    <TableRow key={referral.id}>
                                        <TableCell className="font-medium">{referral.referredVendor}</TableCell>
                                        <TableCell>{referral.date}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(referral.status)}`}>
                                                {referral.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>₹{referral.bonusAmount.toFixed(2)}</TableCell>
                                    </TableRow>
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
                        totalItems={referrals.length}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

