"use client";

import { Suspense, useState } from "react";
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';

// Custom menu items for doctors pages
const doctorsMenuItems = [
  { label: "Consult", href: "/doctors/consult" },
  { label: "Find Doctor", href: "/doctors/find-doctor" },
  { label: "Video Consultation", href: "/doctors/video-consultation" },
];

function DoctorsLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <MarketingHeader 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu}
        isHomePage={false}
        customMenuItems={doctorsMenuItems}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div>Loading doctors...</div>}>
            <DoctorsLayoutContent>
                {children}
            </DoctorsLayoutContent>
        </Suspense>
    )
}