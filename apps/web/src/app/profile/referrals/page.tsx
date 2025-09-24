
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Copy, Gift, UserPlus, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '../../../components/profile/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Badge } from '@repo/ui/badge';
import { Pagination } from '@repo/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';

const referralHistory = [
  { id: 1, friend: 'John Doe', date: '2024-08-10', status: 'Completed', reward: '₹100' },
  { id: 2, friend: 'Jane Smith', date: '2024-07-22', status: 'Pending', reward: '₹100' },
  { id: 3, friend: 'Sam Wilson', date: '2024-07-05', status: 'Completed', reward: '₹100' },
  { id: 4, friend: 'Alice Johnson', date: '2024-06-18', status: 'Completed', reward: '₹100' },
  { id: 5, friend: 'Bob Brown', date: '2024-06-12', status: 'Pending', reward: '₹100' },
];

export default function ReferralsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const referralCode = 'SOPHIA25';
  const referralLink = `https://glowvita.com/register?ref=${referralCode}`;

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast.success(`${textToCopy === referralLink ? 'Link' : 'Code'} copied to clipboard!`);
  };

  const filteredHistory = useMemo(() => {
    return referralHistory.filter(referral =>
      (referral.friend.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || referral.status === statusFilter)
    );
  }, [searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredHistory.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Gift} title="My Referral Code" value={referralCode} change="+ copy code" />
        <StatCard icon={UserPlus} title="Successful Referrals" value={referralHistory.filter(r => r.status === 'Completed').length} change="friends joined" />
        <StatCard icon={Users} title="Total Earnings" value={`₹${referralHistory.filter(r => r.status === 'Completed').reduce((acc, r) => acc + parseFloat(r.reward.replace('₹', '')), 0)}`} change="from referrals" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Link</CardTitle>
          <CardDescription>Share your unique link to invite friends and earn rewards.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input value={referralLink} readOnly />
            <Button onClick={() => handleCopy(referralLink)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle>Referral History</CardTitle>
                    <CardDescription>Track the status of your referrals.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by friend's name..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Friend</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.friend}</TableCell>
                    <TableCell>{referral.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(referral.status)}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{referral.reward}</TableCell>
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
            totalItems={filteredHistory.length}
          />
        </CardContent>
      </Card>
    </div>
  );
}
