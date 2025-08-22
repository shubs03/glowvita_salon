
"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Bell, CheckCircle, CalendarCheck, Download, Shield, BarChart, Users, Star, ArrowRight, BookOpen, Video, MessageSquare, Phone, LifeBuoy, Settings, Clock, Check, Award, UserPlus, PlayCircle, Rocket, TrendingUp, Heart, Globe, Menu, X, Scissors, LineChart } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@repo/ui/cn';
import Link from "next/link";
import { useState } from "react";

const FeatureCheck = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
      <Check className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
      <span className="text-muted-foreground">{children}</span>
    </li>
  );

const AppFeature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-left p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-secondary/50 hover:bg-background border border-transparent hover:border-primary/20">
       <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-1">{title}</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );


const AppStoreButtons = () => (
  <div className="flex justify-center flex-col sm:flex-row gap-4 mt-8">
    <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-black/80 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
      <Download className="mr-2 h-5 w-5" /> Download on the App Store
    </Button>
    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all">
      <Download className="mr-2 h-5 w-5" /> Get it on Google Play
    </Button>
  </div>
);

const PhoneMockup = ({ imageUrl, alt, hint, className }: { imageUrl: string, alt: string, hint: string, className?: string }) => (
    <div className={cn("relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-[2.5rem] h-[540px] w-[270px] shadow-xl", className)}>
        <div className="w-[125px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
        <div className="h-[40px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
        <div className="h-[40px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
        <div className="h-[56px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-black">
            <Image 
                src={imageUrl} 
                className="w-full h-full object-cover" 
                alt={alt} 
                width={270}
                height={540}
                data-ai-hint={hint}
            />
        </div>
    </div>
);


const AppPromotionSection = ({ title, description, features, images, reverse = false }: { title: string, description: string, features: { title: string, description: string, icon: React.ReactNode }[], images: { src: string, hint: string }[], reverse?: boolean }) => {
    return (
        <section className="py-20 md:py-32 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900/50 dark:via-background dark:to-purple-900/20 opacity-30"></div>
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div className={cn("text-center md:text-left", reverse && "md:order-2")}>
                    <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 leading-tight">{title}</h2>
                    <p className="text-muted-foreground mb-8 text-lg">{description}</p>
                    <div className="space-y-6">
                        {features.map((feature, i) => (
                           <div key={i} className="flex items-start gap-4">
                               <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                                   {feature.icon}
                               </div>
                               <div>
                                   <h4 className="font-semibold text-base">{feature.title}</h4>
                                   <p className="text-sm text-muted-foreground">{feature.description}</p>
                               </div>
                           </div>
                        ))}
                    </div>
                    <AppStoreButtons />
                </div>
                <div className={cn("relative h-[450px] flex items-center justify-center mt-12 md:mt-0", reverse && "md:order-1")}>
                     <div className="absolute w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30 -translate-x-1/4 -translate-y-1/4"></div>
                    <div className="absolute w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 translate-x-1/4 translate-y-1/4"></div>
                    <div className="relative w-full h-full flex justify-center items-center group">
                        <div className="absolute transition-all duration-500 group-hover:rotate-[-5deg] group-hover:-translate-x-4">
                            <PhoneMockup imageUrl={images[0].src} alt={`${title} screenshot 1`} hint={images[0].hint} className="w-[240px] h-[480px]"/>
                        </div>
                        <div className="absolute z-10 transition-all duration-500 group-hover:scale-105">
                            <PhoneMockup imageUrl={images[1].src} alt={`${title} screenshot 2`} hint={images[1].hint} />
                        </div>
                        <div className="absolute transition-all duration-500 group-hover:rotate-[5deg] group-hover:translate-x-4">
                            <PhoneMockup imageUrl={images[2].src} alt={`${title} screenshot 3`} hint={images[2].hint} className="w-[240px] h-[480px]"/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TestimonialCard = ({ review, author, role, rating }: { review: string, author: string, role: string, rating: number }) => (
    <Card className="w-[320px] h-[320px] shrink-0 snap-center p-8 flex flex-col justify-between bg-background rounded-lg shadow-lg border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
      <div>
        <div className="flex items-center gap-1 mb-4">
          {[...Array(rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
          {[...Array(5 - rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-gray-300" />)}
        </div>
        <p className="text-muted-foreground leading-relaxed">"{review}"</p>
      </div>
      <div>
        <p className="font-semibold text-foreground">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </Card>
);

const HowItWorksStep = ({ icon, title, description, step, reverse = false }: { icon: React.ReactNode, title: string, description: string, step: number, reverse?: boolean }) => {
  return (
    <div className="md:grid md:grid-cols-2 md:items-center md:gap-8">
      <div className={cn('relative mb-8 md:mb-0', reverse && 'md:order-2')}>
        {/* Step Card */}
        <div className="relative z-10 p-6 rounded-lg bg-background border shadow-lg group hover:border-blue-500/20 hover:shadow-2xl transition-all duration-300">
          {/* Caret pointing to the timeline */}
          <div className={cn(
            'absolute top-1/2 -mt-2 w-4 h-4 bg-background border transform rotate-45',
            reverse ? 'left-0 -ml-2 border-b-0 border-l-0' : 'right-0 -mr-2 border-t-0 border-r-0'
          )}></div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-shrink-0 bg-blue-500/10 text-blue-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <h4 className="text-2xl font-semibold">{title}</h4>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
        </div>
      </div>

      {/* This empty div is for spacing in the grid */}
      <div className={cn('hidden md:block', reverse && 'md:order-1')}></div>
    </div>
  );
};

export default function AppsPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-28 text-center bg-secondary/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900/50 dark:via-background dark:to-purple-900/20 opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Your Business, In Your Pocket</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Manage your salon and connect with your clients on the go with our powerful, intuitive mobile apps.
          </p>
           <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-4 text-muted-foreground">
                <span className="flex items-center gap-2"><Check className="h-5 w-5 text-blue-500" /> 24/7 Online Booking</span>
                <span className="flex items-center gap-2"><Check className="h-5 w-5 text-blue-500" /> Client Management</span>
                <span className="flex items-center gap-2"><Check className="h-5 w-5 text-blue-500" /> Business Analytics</span>
                <span className="flex items-center gap-2"><Check className="h-5 w-5 text-blue-500" /> Secure Payments</span>
          </div>
        </div>
      </section>

      {/* Section 2: GlowVita Salon App */}
      <AppPromotionSection
        title="GlowVita Salon App (For Your Clients)"
        description="Empower your clients with a seamless booking experience. Our client-facing app makes it easy for them to discover, book, and manage their appointments."
        features={[
            { icon: <CalendarCheck size={20} />, title: "24/7 Online Booking", description: "Accept bookings anytime, anywhere, reducing phone calls and manual entries." },
            { icon: <Star size={20} />, title: "Discover & Rate", description: "Allow clients to discover new services, read reviews, and leave their own feedback." },
            { icon: <Bell size={20} />, title: "Automated Reminders", description: "Reduce no-shows with automated appointment reminders and notifications." },
        ]}
        images={[
            { src: 'https://placehold.co/375x812.png', hint: 'app booking screen' },
            { src: 'https://placehold.co/375x812.png', hint: 'app services list' },
            { src: 'https://placehold.co/375x812.png', hint: 'app profile page' },
        ]}
      />
      
      {/* Section 3: CRM App */}
      <AppPromotionSection
        title="Vendor CRM App (For Your Business)"
        description="Manage your entire salon from the palm of your hand. Our vendor app gives you the power to run your business from anywhere, at any time."
        features={[
            { icon: <BarChart size={20} />, title: "Business Dashboard", description: "Track sales, appointments, and client growth with an at-a-glance dashboard." },
            { icon: <BookOpen size={20} />, title: "Calendar Management", description: "Effortlessly manage your team's schedule and view upcoming appointments." },
            { icon: <Users size={20} />, title: "Client Database", description: "Access client information, booking history, and personal notes on the go." },
        ]}
        images={[
            { src: 'https://placehold.co/375x812.png', hint: 'app dashboard screen' },
            { src: 'https://placehold.co/375x812.png', hint: 'app calendar view' },
            { src: 'https://placehold.co/375x812.png', hint: 'app analytics chart' },
        ]}
        reverse={true}
      />
      
      {/* Section 4: Features Grid */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-headline">Powerful Features in Both Apps</h2>
            <p className="text-muted-foreground mt-2 text-lg">Built to help you succeed, from day one.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <AppFeature icon={<Shield size={24} />} title="Secure Payments" description="Process payments securely with our integrated system, supporting multiple payment methods." />
            <AppFeature icon={<BarChart size={24} />} title="Business Analytics" description="Track your performance with insightful dashboards and detailed reports on sales, clients, and staff." />
            <AppFeature icon={<Users size={24} />} title="Client Management" description="Keep detailed records of all your clients, their history, preferences, and notes." />
            <AppFeature icon={<BookOpen size={24} />} title="Service Catalog" description="Easily manage and showcase your services with detailed descriptions and pricing."/>
            <AppFeature icon={<Video size={24} />} title="Video Consultations" description="Offer virtual consultations directly through the app for added convenience and revenue."/>
            <AppFeature icon={<MessageSquare size={24} />} title="In-App Messaging" description="Communicate directly with your clients for appointment updates and follow-ups."/>
          </div>
        </div>
      </section>

      {/* Section 5: Testimonials */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Loved by Professionals</h2>
          <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto mb-12">See what salon owners and stylists are saying about our mobile apps.</p>
        </div>
        <div className="relative pb-5 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-fit items-start animate-slide hover:[animation-play-state:paused]">
                {[
                    { review: "The mobile app has been a game-changer for my salon. I can manage everything on the fly, and my clients love how easy it is to book appointments.", author: 'Jane D.', role: 'Owner, The Style Hub', rating: 5 },
                    { review: "Finally, a CRM that understands the beauty industry. The analytics are powerful and the client management features are top-notch.", author: 'Michael S.', role: 'Lead Stylist, Urban Shears', rating: 5 },
                    { review: "My no-show rate has dropped significantly since using the automated reminders in the app. A must-have for any serious salon owner.", author: 'Jessica P.', role: 'Nail Artist & Owner', rating: 5 },
                    { review: "I love being able to check my schedule and sales from my phone. It gives me so much freedom and flexibility.", author: 'Chris T.', role: 'Barber, The Dapper Den', rating: 4 },
                    { review: "Our clients constantly compliment how professional and easy our booking app is. It has definitely elevated our brand.", author: 'Emily R.', role: 'Spa Manager, Serenity Now', rating: 5 },
                    // Duplicate for seamless loop
                    { review: "The mobile app has been a game-changer for my salon. I can manage everything on the fly, and my clients love how easy it is to book appointments.", author: 'Jane D.', role: 'Owner, The Style Hub', rating: 5 },
                    { review: "Finally, a CRM that understands the beauty industry. The analytics are powerful and the client management features are top-notch.", author: 'Michael S.', role: 'Lead Stylist, Urban Shears', rating: 5 },
                    { review: "My no-show rate has dropped significantly since using the automated reminders in the app. A must-have for any serious salon owner.", author: 'Jessica P.', role: 'Nail Artist & Owner', rating: 5 },
                ].map((testimonial, i) => (
                    <div key={i} className="mx-4">
                        <TestimonialCard {...testimonial} />
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Section 6: Feature Comparison */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold font-headline">App Features at a Glance</h2>
                <p className="text-muted-foreground mt-2 text-lg">Compare the features of our client and vendor apps.</p>
            </div>
            <Card className="max-w-4xl mx-auto shadow-lg border border-border/50">
                <CardContent className="p-0">
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm md:text-base">
                           <thead className="bg-secondary/50">
                               <tr className="border-b">
                                   <th className="text-left p-4 font-semibold">Feature</th>
                                   <th className="text-center p-4 font-semibold">Client App</th>
                                   <th className="text-center p-4 font-semibold">Vendor App</th>
                               </tr>
                           </thead>
                           <tbody>
                               <tr className="border-b"><td className="p-4">Book Appointments</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b bg-secondary/30"><td className="p-4">Manage Calendar & Staff</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b"><td className="p-4">View Service & Product Catalog</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b bg-secondary/30"><td className="p-4">Process Payments & Invoicing</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b"><td className="p-4">Client Profiles & History</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b bg-secondary/30"><td className="p-4">Inventory Management</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b"><td className="p-4">Business Analytics & Reports</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="bg-secondary/30"><td className="p-4">Marketing & Promotions</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                           </tbody>
                       </table>
                   </div>
                </CardContent>
            </Card>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">How It Works</h2>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto">A simple and intuitive process for both you and your clients.</p>
            </div>
            <div className="relative">
                {/* Central Timeline */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-100 rounded-full hidden md:block"></div>
                
                <div className="space-y-16 md:space-y-0">
                    {[
                        { icon: <Download className="h-7 w-7" />, title: "Download & Setup", description: "Get your salon listed and set up your services, staff, and schedule in minutes." },
                        { icon: <Users className="h-7 w-7" />, title: "Clients Book Online", description: "Clients find your salon and book appointments 24/7 through the GlowVita app or your website." },
                        { icon: <BarChart className="h-7 w-7" />, title: "Manage & Grow", description: "Use the CRM app to manage bookings, process payments, and grow your business with marketing tools." }
                    ].map((step, index) => (
                         <div key={index} className="relative">
                            <div className="md:grid md:grid-cols-2 md:gap-8 md:items-center">
                                {/* Step Bubble */}
                                <div className={cn("hidden md:flex justify-center", index % 2 === 0 ? 'md:order-2' : 'md:order-1')}>
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white font-bold text-3xl border-4 border-background shadow-lg z-10">
                                        {index + 1}
                                    </div>
                                </div>
                                
                                {/* Step Content */}
                                <div className={cn('relative', index % 2 === 0 ? 'md:order-1' : 'md:order-2')}>
                                    <div className="md:hidden flex items-center gap-4 mb-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-2xl border-4 border-background shadow-lg z-10">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="relative z-10 p-6 rounded-lg bg-background border shadow-lg group hover:border-blue-500/20 hover:shadow-2xl transition-all duration-300">
                                        <div className={cn("absolute top-1/2 -mt-2 w-4 h-4 bg-background border transform rotate-45 z-0",
                                            index % 2 === 0 ? 'md:-right-2 md:border-l-0 md:border-b-0' : 'md:-left-2 md:border-r-0 md:border-t-0'
                                        )}></div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="flex-shrink-0 bg-blue-500/10 text-blue-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                                {step.icon}
                                            </div>
                                            <h4 className="text-2xl font-semibold">{step.title}</h4>
                                        </div>
                                        <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>

       <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                          <Shield size={16}/>
                          Your Data is Safe
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Security You Can Trust</h2>
                      <p className="text-lg text-muted-foreground mb-6">We prioritize the security of your business and client data with enterprise-grade protection.</p>
                      <ul className="space-y-3 text-left">
                          <FeatureCheck><strong>Data Encryption:</strong> All data is encrypted in transit and at rest.</FeatureCheck>
                          <FeatureCheck><strong>Secure Payments:</strong> PCI-compliant payment processing to protect financial data.</FeatureCheck>
                          <FeatureCheck><strong>Regular Backups:</strong> Your data is backed up regularly to prevent loss.</FeatureCheck>
                          <FeatureCheck><strong>Access Control:</strong> Granular permissions to control what your staff can see and do.</FeatureCheck>
                      </ul>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-200 to-purple-200 rounded-full blur-3xl opacity-40"></div>
                    <Shield className="relative z-10 h-48 w-48 text-blue-500 drop-shadow-lg" />
                  </div>
              </div>
          </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 text-center bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">Ready to Go Mobile?</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Download the apps and take your business to the next level. Empower your team and delight your clients.
            </p>
            <AppStoreButtons />
          </div>
      </section>
    </div>
  );
}

