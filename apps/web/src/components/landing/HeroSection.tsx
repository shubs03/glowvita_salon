
"use client";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import Link from 'next/link';
import { Shield, TrendingUp, Lock } from 'lucide-react';

const StatCard = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="space-y-1 text-center">
    <div className="2xl:size-16 xl:size-14 size-12 mx-auto flex items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <p className="text-foreground/80 font-normal text-sm">
      {label}
    </p>
  </div>
);

const TrustReviewCard = () => (
  <figure className="flex items-center justify-between gap-4 bg-background border border-border/50 rounded-full p-4 sm:p-5 shadow-sm">
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <p className="text-foreground text-2xl font-bold">5.0</p>
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
          <path d="M12.9135 18.3812L17.6419 21.3769C18.2463 21.7598 18.9967 21.1903 18.8173 20.4848L17.4512 15.1108C17.4127 14.9611 17.4173 14.8036 17.4643 14.6564C17.5114 14.5092 17.5991 14.3783 17.7172 14.2787L21.9573 10.7496C22.5144 10.2859 22.2269 9.36127 21.5111 9.31481L15.9738 8.95544C15.8247 8.94479 15.6816 8.89198 15.5613 8.80317C15.441 8.71437 15.3484 8.59321 15.2943 8.45382L13.2292 3.25323C13.173 3.10528 13.0732 2.9779 12.943 2.88802C12.8127 2.79814 12.6582 2.75 12.5 2.75C12.3418 2.75 12.1873 2.79814 12.057 2.88802C11.9268 2.9779 11.827 3.10528 11.7708 3.25323L9.70568 8.45382C9.65157 8.59321 9.55897 8.71437 9.43868 8.80317C9.31838 8.89198 9.17533 8.94479 9.02618 8.95544L3.48894 9.31481C2.77315 9.36127 2.4856 10.2859 3.04272 10.7496L7.28278 14.2787C7.40095 14.3783 7.4886 14.5092 7.53566 14.6564C7.58272 14.8036 7.58727 14.9611 7.5488 15.1108L6.28188 20.0945C6.06667 20.9412 6.96715 21.6246 7.69243 21.1651L12.0865 18.3812C12.21 18.3025 12.3535 18.2607 12.5 18.2607C12.6465 18.2607 12.79 18.3025 12.9135 18.3812Z" fill="#FBBF24"></path>
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">4k users reviews</p>
    </div>
  </figure>
);

export function HeroSection() {
  return (
    <section className="relative bg-background py-[60px] sm:py-[100px] z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 -z-10"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-[600px] rounded-4xl bg-background/50 backdrop-blur-md border border-border/20 p-6 pt-[80px] sm:p-10 sm:pt-[120px] shadow-lg">
          <div className="relative z-10 mx-auto space-y-10 lg:space-y-16">
            <div className="relative z-10">
              <div className="space-y-5 text-center">
                <Badge variant="secondary" className="bg-green-100 text-green-700">Keep an eye on your finances</Badge>
                <div className="space-y-4 max-w-[690px] mx-auto">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                    Cyber security for a safer tomorrow
                  </h1>
                  <p className="text-muted-foreground">
                    Experience AI-powered cybersecurity designed for a safer tomorrow, delivering advanced
                    protection against modern cyber threats with unmatched precision.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 lg:mt-14">
                  <Button size="lg" className="w-full sm:w-auto">
                    Request business call
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    14-Days free trial
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <div className="space-y-5 w-full sm:w-auto">
                  <figure className="flex items-center justify-center gap-4 rounded-full border border-border/30 bg-background/80 p-4 shadow-sm">
                    <StatCard icon={<Shield className="text-primary"/>} label="Data protection" />
                    <StatCard icon={<TrendingUp className="text-primary"/>} label="Access control" />
                    <StatCard icon={<Lock className="text-primary"/>} label="ID security" />
                  </figure>
                  <TrustReviewCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
