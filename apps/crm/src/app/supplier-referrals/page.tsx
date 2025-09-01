
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Copy, Gift, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { Input } from '@repo/ui/input';
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useGetReferralsQuery, useGetSettingsQuery } from '@repo/store/api';
import { Skeleton } from '@repo/ui/skeleton';

type Referral = {
    _id: string;
    referee: string;
    date: string;
    status: 'Pending' | 'Completed' | 'Bonus Paid';
    bonus: string;
};

const SkeletonLoader = () => (
    <div className="p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/4" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
        <Card className="mb-6">
            <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-grow" />
                    <Skeleton className="h-10 w-28" />
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);

export default function SupplierReferralsPage() {
    const { user, isLoading: isAuthLoading } = useCrmAuth();
    const { data: referralsData, isLoading: isReferralsLoading, isError } = useGetReferralsQuery('V2V', {
        skip: !user
    });
    const { data: settingsData, isLoading: isSettingsLoading } = useGetSettingsQuery('V2V');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    
    const referralLink = user?.referralCode && typeof window !== 'undefined'
        ? `${window.location.origin}/auth/register?ref=${user.referralCode}`
        : "Loading your referral link...";

    const referrals = useMemo(() => {
        if (!Array.isArray(referralsData) || !user) return [];
        return referralsData.filter((r: any) => r.referrer === user.shopName);
    }, [referralsData, user]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = referrals.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(referrals.length / itemsPerPage);

    const handleCopyLink = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(referralLink);
            toast.success("Referral link copied to clipboard!");
        } else {
            toast.error("Referral link not available yet.");
        }
    };
    
    const getStatusColor = (status: Referral['status']) => {
        switch (status) {
          case 'Completed': return 'bg-blue-100 text-blue-800';
          case 'Bonus Paid': return 'bg-green-100 text-green-800';
          case 'Pending': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    if (isAuthLoading || isReferralsLoading || isSettingsLoading) {
        return <SkeletonLoader />;
    }
    
    if (isError) {
        return <div className="p-8 text-center text-destructive">Failed to load referral data. Please try again.</div>
    }

    const totalBonusEarned = referrals.filter((r: Referral) => r.status === 'Bonus Paid').reduce((acc, r) => acc + (Number(r.bonus) || 0), 0);
    const successfulReferrals = referrals.filter(r => r.status !== 'Pending').length;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold font-headline">Refer a Supplier</h1>
                <p className="text-muted-foreground mt-1">Earn rewards by inviting other suppliers to join our platform.</p>
            </div>

            <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground overflow-hidden">
                <div className="grid md:grid-cols-2 items-center">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold mb-2">Expand Your Network</h2>
                        <p className="mb-6 opacity-90 max-w-md">
                            Invite other suppliers to join our platform. When they do, you both benefit. Help us build a stronger supply chain.
                        </p>
                        <div className="space-y-3 text-sm">
                           {settingsData?.referrerBonus && (
                                <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 opacity-90"/><span>Earn ₹{settingsData.referrerBonus.bonusValue} for every successful referral.</span></div>
                           )}
                           {settingsData?.refereeBonus?.enabled && (
                               <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 opacity-90"/><span>Your friend gets ₹{settingsData.refereeBonus.bonusValue} too!</span></div>
                           )}
                           <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 opacity-90"/><span>Strengthen your professional network.</span></div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center p-8">
                         <Gift className="w-48 h-48 text-primary-foreground opacity-20" />
                    </div>
                </div>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Your Unique Referral Link</CardTitle>
                    <CardDescription>Share this link with other suppliers. When they sign up using this link, you'll be credited for the referral.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input value={referralLink} readOnly className="bg-secondary text-base" />
                        <Button onClick={handleCopyLink} className="w-full sm:w-auto" disabled={!user?.referralCode}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.length}</div>
                        <p className="text-xs text-muted-foreground">Suppliers you've referred</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{successfulReferrals}</div>
                        <p className="text-xs text-muted-foreground">Suppliers who successfully joined</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bonus Earned</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalBonusEarned.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Bonuses paid out to you</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Referral History</CardTitle>
                    <CardDescription>Track the status of your referred suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto no-scrollbar rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Referred Supplier</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Bonus</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.length > 0 ? currentItems.map((referral: Referral) => (
                                    <TableRow key={referral._id}>
                                        <TableCell className="font-medium">{referral.referee}</TableCell>
                                        <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(referral.status)}`}>
                                                {referral.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">₹{referral.bonus}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            You haven't referred any suppliers yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {referrals.length > itemsPerPage && (
                        <Pagination
                            className="mt-4"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={referrals.length}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

