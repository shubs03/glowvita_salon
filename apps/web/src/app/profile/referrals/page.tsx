
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Copy, Gift, UserPlus, Users, Search, Share2, Mail, MessageCircle } from 'lucide-react';
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

const HowItWorksStep = ({ step, title, description }: { step: number, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg border-2 border-primary/20 flex-shrink-0">
            {step}
        </div>
        <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

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
        <StatCard icon={Gift} title="Total Earnings" value={`₹${referralHistory.filter(r => r.status === 'Completed').reduce((acc, r) => acc + parseFloat(r.reward.replace('₹', '')), 0)}`} change="from referrals" />
        <StatCard icon={UserPlus} title="Successful Referrals" value={referralHistory.filter(r => r.status === 'Completed').length} change="friends joined" />
        <StatCard icon={Users} title="Total Referrals" value={referralHistory.length} change="invites sent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Follow these simple steps to invite friends and earn rewards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <HowItWorksStep 
                    step={1} 
                    title="Share Your Link" 
                    description="Copy your unique referral link or code and share it with your friends via social media, email, or messaging apps."
                />
                 <HowItWorksStep 
                    step={2} 
                    title="Friend Signs Up" 
                    description="Your friend signs up using your link and makes their first booking. We'll automatically track the referral."
                />
                 <HowItWorksStep 
                    step={3} 
                    title="Earn Rewards" 
                    description="Once their first appointment is completed, you'll both receive a reward in your wallet. It's that simple!"
                />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Share & Earn</CardTitle>
                <CardDescription>Share your code to start earning rewards today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-xs font-semibold">Your Referral Code</Label>
                    <div className="flex items-center space-x-2">
                        <Input value={referralCode} readOnly className="font-mono bg-secondary" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(referralCode)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div>
                    <Label className="text-xs font-semibold">Your Referral Link</Label>
                     <div className="flex items-center space-x-2">
                        <Input value={referralLink} readOnly className="text-xs bg-secondary" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(referralLink)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                    <Button variant="outline" size="icon"><Mail className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon"><MessageCircle className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
                </div>
            </CardContent>
        </Card>
      </div>
      
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
