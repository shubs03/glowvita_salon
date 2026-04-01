
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Copy, Gift, UserPlus, Users, Search, Mail, MessageCircle, Building } from 'lucide-react';
import { toast } from 'sonner';
import { StatCard } from '../../../components/profile/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Badge } from '@repo/ui/badge';
import { Pagination } from '@repo/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { useGetClientReferralsQuery, useClaimReferralBonusMutation } from '@repo/store/api';
import { useAuth } from '@/hooks/useAuth';
import { NEXT_PUBLIC_CRM_URL, NEXT_PUBLIC_WEB_URL } from '@repo/config/config';

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
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch referral data
  const { data: referralData, isLoading, refetch } = useGetClientReferralsQuery(undefined, {
    skip: !isAuthenticated || !user?._id
  });

  // Claim bonus mutation
  const [claimBonus, { isLoading: isClaiming }] = useClaimReferralBonusMutation();

  const referralCode = referralData?.data?.referralCode || 'LOADING';
  const isValidCode = referralCode !== 'N/A' && referralCode !== 'LOADING' && referralCode !== 'NOTAVAILABLE';
  const clientReferralLink = `${NEXT_PUBLIC_WEB_URL}/client-register?ref=${referralCode}`;
  

    
  const partnerReferralLink = `${NEXT_PUBLIC_CRM_URL}/auth/register?ref=${referralCode}`;
  
  const referralHistory = referralData?.data?.referralHistory || [];
  const stats = referralData?.data?.stats || { totalEarnings: 0, successfulReferrals: 0, totalReferrals: 0 };

  const handleCopy = (textToCopy: string, type: string = 'Link') => {
    if (!isValidCode) {
      toast.error('Referral code not available yet. Please refresh the page.');
      return;
    }
    navigator.clipboard.writeText(textToCopy);
    toast.success(`${type} copied to clipboard!`);
  };

  // Refetch if referral code is not available
  useEffect(() => {
    if (!isLoading && referralCode === 'NOTAVAILABLE') {
      // Wait a bit and refetch
      const timer = setTimeout(() => {
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [referralCode, isLoading, refetch]);

  const filteredHistory = useMemo(() => {
    return referralHistory.filter((referral: any) =>
      (referral.friend.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || 
       (statusFilter === 'Completed' ? (referral.status === 'Completed' || referral.status === 'Bonus Paid') : referral.status === statusFilter))
    );
  }, [referralHistory, searchTerm, statusFilter]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredHistory.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': 
      case 'Bonus Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending': 
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClaimBonus = async (referralId: string) => {
    try {
      const result = await claimBonus({ referralId }).unwrap();
      if (result.success) {
        toast.success('Bonus claimed successfully! Check your wallet.');
        refetch(); // Refresh the referral data
      } else {
        toast.error(result.message || 'Failed to claim bonus');
      }
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      toast.error(error?.data?.message || 'Failed to claim bonus. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    );
  }

  const totalEarnings = referralHistory
    .filter((r: any) => r.status === 'Completed' || r.status === 'Bonus Paid')
    .reduce((acc: number, r: any) => {
      const numericValue = typeof r.reward === 'string' 
        ? parseFloat(r.reward.replace(/[^\d.]/g, '')) 
        : Number(r.reward);
      return acc + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);
  const successfulReferralsCount = referralHistory.filter((r: any) => r.status === 'Completed' || r.status === 'Bonus Paid').length;

  const bonuses = referralData?.data?.settings || {
    c2c: { referrerBonus: 100, refereeBonus: 50 }, // Default fallback values
    c2v: { referrerBonus: 500, refereeBonus: 0 }
  };

  const handleWhatsAppShare = (link: string, type: 'friend' | 'partner') => {
    const reward = type === 'friend' ? bonuses.c2c.referrerBonus : bonuses.c2v.referrerBonus;
    const friendReward = bonuses.c2c.refereeBonus;
    
    let message = '';
    if (type === 'friend') {
      message = `Hey! Join GlowVita using my referral link and get ₹${friendReward} off on your first salon booking! 🧖‍♀️💅\n\nRegister here: ${link}`;
    } else {
      message = `Hey! Register your Salon or Spa on GlowVita and manage your business easily! 🏢✂️\n\nRegister here: ${link}`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Gift} title="Total Earnings" value={`₹${totalEarnings}`} change="from referrals" />
        <StatCard icon={UserPlus} title="Successful Referrals" value={successfulReferralsCount} change="friends joined" />
        <StatCard icon={Users} title="Total Referrals" value={referralHistory.length} change="invites sent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Friend Referral Program */}
          <Card className="border-blue-100 overflow-hidden">
            <CardHeader className="bg-blue-50/50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <UserPlus className="w-5 h-5" /> 
                    Friend Referral Program
                  </CardTitle>
                  <CardDescription className="text-blue-700/70">Invite friends to book salon & spa services</CardDescription>
                </div>
                <Badge className="bg-blue-600">Earn ₹{bonuses.c2c.referrerBonus}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <HowItWorksStep
                  step={1}
                  title="Share your Friend Link"
                  description="Share your unique client referral link with friends via WhatsApp or social media."
                />
                <HowItWorksStep
                  step={2}
                  title="Friend Joins & Books"
                  description={`Your friend registers and receives ₹${bonuses.c2c.refereeBonus} in their wallet for their first booking.`}
                />
                <HowItWorksStep
                  step={3}
                  title="Receive Your Reward"
                  description={`Once your friend completes their first salon service, ₹${bonuses.c2c.referrerBonus} will be credited to your wallet!`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Partner Referral Program */}
          <Card className="border-purple-100 overflow-hidden">
            <CardHeader className="bg-purple-50/50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Building className="w-5 h-5" /> 
                    Partner Referral Program
                  </CardTitle>
                  <CardDescription className="text-purple-700/70">Invite Salons, Doctors, or Suppliers to GlowVita</CardDescription>
                </div>
                <Badge className="bg-purple-600">Earn ₹{bonuses.c2v.referrerBonus}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <HowItWorksStep
                  step={1}
                  title="Share partner Link"
                  description="Invite business owners (Salon, Spa, Clinic) to join GlowVita's business community."
                />
                <HowItWorksStep
                  step={2}
                  title="Partner Registers & Subscribes"
                  description="The partner registers their business and chooses a subscription plan that fits their needs."
                />
                <HowItWorksStep
                  step={3}
                  title="Earn High Reward"
                  description={`Once the partner purchases their first subscription, you receive a massive ₹${bonuses.c2v.referrerBonus} reward!`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Share & Earn</CardTitle>
            <CardDescription>Share your code to start earning rewards today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Your Referral Code</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={referralCode === 'LOADING' ? 'Generating...' : referralCode === 'NOTAVAILABLE' ? 'Generating code...' : referralCode}
                  readOnly
                  className="font-mono bg-secondary"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(referralCode, 'Code')}
                  disabled={!isValidCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 pt-2 border-t">
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Refer a Friend
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={!isValidCode ? 'Generating link...' : clientReferralLink}
                    readOnly
                    className="text-xs bg-secondary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(clientReferralLink, 'Client Join Link')}
                    disabled={!isValidCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Building className="w-3 h-3" /> Refer a Partner (Salons/Doctors)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={!isValidCode ? 'Generating link...' : partnerReferralLink}
                    readOnly
                    className="text-xs bg-secondary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(partnerReferralLink, 'Partner Join Link')}
                    disabled={!isValidCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 italic">
                  Earn bonuses when a business (vendor, doctor, supplier) joins using your code.
                </p>
              </div>
            </div>
            
            <div className="pt-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 border-[#25D366]/20"
                onClick={() => handleWhatsAppShare(clientReferralLink, 'friend')}
              >
                <MessageCircle className="h-4 w-4 mr-2 fill-current" />
                Share Friend Link on WhatsApp
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-primary hover:bg-primary/5"
                onClick={() => handleWhatsAppShare(partnerReferralLink, 'partner')}
              >
                <Building className="h-4 w-4 mr-2" />
                Share Partner Link on WhatsApp
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground hover:bg-transparent"
                onClick={() => {
                  const subject = encodeURIComponent("Join GlowVita - Your Premium Salon Booking Platform");
                  const body = encodeURIComponent(`Hi!\n\nI'm using GlowVita to book my salon and spa appointments. You should try it too! Use my link to join and get ₹${bonuses.c2c.refereeBonus} in your wallet: ${clientReferralLink}\n\nCheers!`);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
              >
                <Mail className="h-3 w-3 mr-2" />
                Invite via Email
              </Button>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Friend / Partner</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No referrals yet. Share your code to start earning!
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((referral: any) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <Badge variant="outline" className={referral.type === 'Partner' ? "border-purple-200 text-purple-700 bg-purple-50" : "border-blue-200 text-blue-700 bg-blue-50"}>
                          {referral.type === 'Client' ? <UserPlus className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
                          {referral.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{referral.friend}</TableCell>
                      <TableCell>{new Date(referral.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(referral.status)}>
                            {referral.status}
                          </Badge>
                          {referral.status === 'Joined' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleClaimBonus(referral.id)}
                              disabled={isClaiming}
                              className="h-7 px-2 text-xs"
                            >
                              {isClaiming ? 'Claiming...' : 'Claim Bonus'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {referral.reward?.startsWith('₹') ? referral.reward : `₹${referral.reward}`}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
