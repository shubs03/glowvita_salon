"use client";

import Image from 'next/image';
import { Star, PlayCircle, Shield, Lock, FileCheck, ShieldCheck, Check, CheckCircle2, Database } from 'lucide-react';
import { Button } from '@repo/ui/button';
import {Card, CardContent} from "@repo/ui/card";
import { ModernCard } from '@repo/ui/modern-card';

export const AdvantageCard = ({
  stat,
  title,
  description,
  icon,
}: {
  stat: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="flex-shrink-0 w-72 md:w-80 h-80 md:h-96 bg-gradient-to-br from-background via-background to-primary/5 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-3xl hover:shadow-primary/20 transition-all duration-700 border border-border/30 hover:border-primary/30 hover-lift">
    {/* Animated Background Elements */}
    <div className="absolute -top-12 -right-12 text-primary/5 text-[140px] md:text-[160px] group-hover:text-primary/15 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
      {icon}
    </div>
    
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    
    {/* Floating Particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float transition-all duration-700"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.2}s`
          }}
        ></div>
      ))}
    </div>
    
    {/* Content */}
    <div className="relative z-10">
      <div className="mb-4">
        <p className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:via-secondary group-hover:to-primary transition-all duration-500 leading-none">
          {stat}
        </p>
        <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full mt-3 group-hover:w-24 transition-all duration-500"></div>
      </div>
      <h3 className="text-xl md:text-2xl font-bold mt-4 group-hover:text-primary transition-colors duration-500 leading-tight">
        {title}
      </h3>
    </div>
    
    <div className="relative z-10">
      <p className="text-muted-foreground text-sm md:text-base group-hover:text-foreground transition-colors duration-500 leading-relaxed">
        {description}
      </p>
      
      {/* Progress indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-grow h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary w-0 group-hover:w-full transition-all duration-1000 ease-out"></div>
        </div>
        <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          Proven
        </span>
      </div>
    </div>
  </div>
);

const VideoTestimonialCard = () => (
  <div className="h-[480px] w-[80vw] shrink-0 snap-center overflow-hidden laptop:w-[853px] group">
    <div className="relative size-full overflow-hidden rounded-lg shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
      <Image
        src="https://picsum.photos/seed/video/853/480"
        alt="Testimonial video poster"
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-500 group-hover:scale-105"
        data-ai-hint="salon professional"
      />
      <div className="absolute inset-0 z-10 flex h-full max-w-full flex-col justify-end rounded-xl text-white bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div className="mx-6 flex items-center justify-between gap-2 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full border-2 border-white/80">
              <Image
                src="https://picsum.photos/seed/avatar1/40/40"
                alt="Chris Ward"
                width={40}
                height={40}
                data-ai-hint="portrait man"
              />
            </div>
            <div>
              <p className="text-[17px] font-medium">Chris Ward</p>
              <p className="text-[15px] opacity-80">Founder of HUCKLE</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-0 h-12 w-12 hover:scale-110 transition-all duration-200"
          >
            <PlayCircle className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export const VideoTestimonialSection = () => (
    <section className="py-20 md:py-28 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
                    Top-Rated by the Industry
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Our dedication to building the best-in-class booking software
                    and delivering exceptional customer experience continues to be
                    recognized time and time again.
                </p>
            </div>
            <div className="flex justify-center">
              <VideoTestimonialCard />
            </div>
        </div>
    </section>
);

const SecurityFeature = ({ icon: Icon, title, description, stat }: { icon: React.ElementType, title: string, description: string, stat: string }) => {
  return (
    <div className="group relative rounded-xl border border-border/30 bg-background/50 p-6 text-center transition-all duration-500 transform-style-3d hover:-translate-y-2 hover:rotate-x-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/30 border border-primary/20">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                <Icon className="h-8 w-8 text-primary transition-all duration-500 group-hover:scale-125" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground transition-colors duration-300 group-hover:text-primary">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80 mb-4">
                {description}
            </p>
            <div className="mt-auto px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                {stat}
            </div>
        </div>
    </div>
  );
};

export const SecuritySection = () => (
  <section className="py-20 md:py-28 bg-gradient-to-br from-background via-secondary/10 to-background relative">
    <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.05]"></div>
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-headline leading-tight">
            Enterprise-Grade Security You Can Trust
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We prioritize the security of your business and client data with industry-leading protection, so you can focus on what matters most.
          </p>
          <ul className="space-y-3">
              {[
                  "End-to-End Data Encryption",
                  "PCI-Compliant Payment Processing",
                  "Regular Security Audits & Updates",
                  "Granular Staff Access Control",
              ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span>{feature}</span>
                  </li>
              ))}
          </ul>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 perspective-1000">
          <SecurityFeature icon={Shield} title="256-bit SSL" description="Bank-level encryption for all data." stat="AES-256" />
          <SecurityFeature icon={Lock} title="GDPR Compliant" description="Full compliance with data privacy regulations." stat="Privacy First" />
          <SecurityFeature icon={FileCheck} title="Daily Backups" description="Automated data backups to prevent loss." stat="99.99% Uptime" />
          <SecurityFeature icon={Database} title="PCI DSS Level 1" description="Secure payment processing." stat="Service Provider" />
        </div>
      </div>
    </div>
  </section>
);
