import React from 'react';
import HeroSection from './components/HeroSection';
import WhereToGo from '@/components/landing/WhereToDo';
import RecentlyJoinedSalon from './components/RecentlyJoinedSalon';
import DownloadApp from '@/components/landing/DownloadApp';
import CTASection from './components/CTASection';

const SalonsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <RecentlyJoinedSalon />
      <WhereToGo maxSalons={Infinity} showViewAllButton={false} />
      <DownloadApp />
      <CTASection/>
    </div>
  );
};

export default SalonsPage;