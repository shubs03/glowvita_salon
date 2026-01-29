
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from "@repo/ui/card";
import { toast } from 'sonner';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { useGetCrmReferralsQuery, useGetCrmReferralSettingsQuery, useGetProfileQuery } from '@repo/store/api';
import { Referral } from './types';

// Import new components
import ReferralStatsCards from './components/ReferralStatsCards';
import ReferralTable from './components/ReferralTable';
import ReferralPaginationControls from './components/ReferralPaginationControls';
import HowItWorksSection from './components/HowItWorksSection';
import ReferralLinkCard from './components/ReferralLinkCard';
import HeroSection from './components/HeroSection';
import HeaderSection from './components/HeaderSection';
import ReferralSkeletonLoader from './components/ReferralSkeletonLoader';

const getRoleContent = (role: string) => {
    switch(role) {
        case 'doctor':
            return { 
                title: 'Refer a Doctor', 
                description: 'Earn rewards by inviting other doctors and medical professionals to join our platform.',
                networkText: 'Strengthen your medical network.',
                shareTip: 'Share your link with doctors and medical professionals.',
                signupText: 'Your colleague signs up on our platform using your referral link.',
                professionalsText: 'Strengthen your medical network.',
                successText: 'Doctors who successfully joined'
            };
        case 'supplier':
            return { 
                title: 'Refer a Supplier', 
                description: 'Earn rewards by inviting other suppliers and vendors to join our marketplace.',
                networkText: 'Expand your supplier network.',
                shareTip: 'Share your link with suppliers and vendors.',
                signupText: 'Your partner signs up on our platform using your referral link.',
                professionalsText: 'Expand your supplier network.',
                successText: 'Suppliers who successfully joined'
            };
        case 'vendor':
        default:
            return { 
                title: 'Refer a Vendor', 
                description: 'Earn rewards by inviting other salon owners and beauty professionals to join.',
                networkText: 'Strengthen your professional network.',
                shareTip: 'Share your link with salon owners and beauty professionals.',
                signupText: 'Your colleague signs up on our platform using your referral link.',
                professionalsText: 'Strengthen your professional network.',
                successText: 'Professionals who successfully joined'
            };
    }
};

export default function ReferralsPage() {
    const { user, role, isLoading: isAuthLoading } = useCrmAuth();
    
    // Always use V2V referral type for all roles (unified settings)
    const getReferralType = (userRole: string) => {
        // Always return V2V regardless of role - using unified settings
        return 'V2V';
    };
    
    const referralType = getReferralType(role || 'vendor'); 
    
    const { data: referralsData, isLoading: isReferralsLoading, isError } = useGetCrmReferralsQuery(referralType, {
        skip: !user
    });
    const { data: settingsData, isLoading: isSettingsLoading } = useGetCrmReferralSettingsQuery(referralType);
    
    // Get profile data to ensure we have the latest referral code
    const { data: profileData } = useGetProfileQuery(undefined, {
        skip: !user
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    
    // Use profile data if available, otherwise fall back to user data
    const userData = profileData?.user || user;
    
    const referralLink = userData?.referralCode && typeof window !== 'undefined'
        ? `${window.location.origin}/auth/register?ref=${userData.referralCode}`
        : "Loading your referral link...";

    const referrerName = useMemo(() => {
        if (!user) return '';
        return user.businessName || user.name || user.shopName || 'Your Business';
    }, [user]);

    const referrals = useMemo(() => {
        if (!Array.isArray(referralsData)) return [];
        // CRM API already filters by user, so we just return the data
        return referralsData;
    }, [referralsData]);

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = referrals.slice(firstItemIndex, lastItemIndex);
    const totalPages = Math.ceil(referrals.length / itemsPerPage);

    const handleCopyLink = () => {
        if (userData?.referralCode) {
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

    const roleContent = getRoleContent(role || 'vendor');
    
    if (isAuthLoading || isReferralsLoading || isSettingsLoading) {
        return <ReferralSkeletonLoader />;
    }
    
    if (isError) {
        return <div className="p-8 text-center text-destructive">Failed to load referral data. Please try again.</div>
    }

    const totalBonusEarned = referrals.filter((r: Referral) => r.status === 'Bonus Paid').reduce((acc, r) => acc + (Number(r.bonus) || 0), 0);
    const successfulReferrals = referrals.filter(r => r.status !== 'Pending').length;
    
    const referrerBonus = settingsData?.referrerBonus?.bonusValue || 0;
    const refereeBonusEnabled = settingsData?.refereeBonus?.enabled;
    const refereeBonus = settingsData?.refereeBonus?.bonusValue || 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header Section */}
                <HeaderSection title={roleContent.title} description={roleContent.description} />

                {/* Hero Section */}
                <HeroSection 
                    roleContent={roleContent} 
                    referrerBonus={referrerBonus} 
                    refereeBonusEnabled={refereeBonusEnabled} 
                    refereeBonus={refereeBonus} 
                />
                
                {/* How It Works Section */}
                <HowItWorksSection 
                    roleContent={roleContent} 
                    refereeBonusEnabled={refereeBonusEnabled} 
                    refereeBonus={refereeBonus} 
                    referrerBonus={referrerBonus} 
                />

                {/* Referral Link Card */}
                <ReferralLinkCard 
                    referralLink={referralLink} 
                    userReferralCode={userData?.referralCode} 
                    onCopyLink={handleCopyLink} 
                />

                {/* Referral Stats Cards */}
                <ReferralStatsCards 
                    totalReferrals={referrals.length} 
                    successfulReferrals={successfulReferrals} 
                    totalBonusEarned={totalBonusEarned}
                    roleContent={roleContent}
                />
                
                {/* Referral History Table */}
                <div className="flex-1 flex flex-col min-h-0">
                    <Card className="flex-1 flex flex-col min-h-0">
                        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                            <ReferralTable 
                                currentItems={currentItems} 
                                getStatusColor={getStatusColor} 
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Pagination Controls */}
                <ReferralPaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={referrals.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </div>
    );
}
