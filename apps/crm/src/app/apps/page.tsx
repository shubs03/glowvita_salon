
"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { CheckCircle, Download, Shield, BarChart, Users, Star, ArrowRight, BookOpen, Video, MessageSquare, Phone, LifeBuoy, Settings, Clock, Check, Award, UserPlus } from 'lucide-react';
import Image from 'next/image';

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
  <div className="flex flex-col sm:flex-row gap-4 mt-8">
    <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-black/80 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
      <Download className="mr-2 h-5 w-5" /> Download on the App Store
    </Button>
    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all">
      <Download className="mr-2 h-5 w-5" /> Get it on Google Play
    </Button>
  </div>
);

const PhoneMockup = ({ imageUrl, alt, hint, className, style }: { imageUrl: string, alt: string, hint: string, className?: string, style?: React.CSSProperties }) => (
    <div 
        className={cn("w-full rounded-xl h-full bg-gradient-to-b from-slate-900 to-slate-900 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer", className)}
        style={{clipPath: 'polygon(0 1%, 1% 0, 92% 0, 100% 1%, 100% 99%, 99% 100%, 8% 100%, 0 99%)', ...style}}
    >
        <div className="absolute top-2 md:top-3 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-0.5 md:h-1 bg-slate-600 rounded-full"></div>
        <div className="mt-4 rounded-xl md:mt-6 h-full p-1 md:p-2">
            <div className="w-full h-96 bg-slate-100 rounded-sm overflow-hidden relative">
                <Image 
                    src={imageUrl} 
                    className="group-hover:scale-110 transition-transform duration-500" 
                    alt={alt} 
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={hint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
        </div>
    </div>
);

const AppPromotionSection = ({ title, description, features, images, reverse = false }: { title: string, description: string, features: string[], images: { src: string, hint: string }[], reverse?: boolean }) => {
    return (
        <section className="py-20 overflow-hidden relative bg-gradient-to-br from-background via-secondary/10 to-background">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900/50 dark:via-background dark:to-purple-900/20 opacity-30"></div>
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div className={cn("text-center md:text-left", reverse && "md:order-2")}>
                    <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 leading-tight">{title}</h2>
                    <p className="text-muted-foreground mb-6 text-lg">{description}</p>
                    <ul className="space-y-4">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>{feature}</span></li>
                        ))}
                    </ul>
                    <AppStoreButtons />
                </div>
                <div className={cn("relative h-[450px] flex items-center justify-center mt-12 md:mt-0", reverse && "md:order-1")}>
                    <div className="absolute w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-30 -translate-x-1/4 -translate-y-1/4"></div>
                    <div className="absolute w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 translate-x-1/4 translate-y-1/4"></div>
                    <div className="relative flex justify-center items-center h-full w-full">
                        <div className="absolute w-56 md:w-64 h-auto" style={{ zIndex: 10, transform: 'rotate(-10deg) translateX(-40%) translateY(5%)' }}>
                            <PhoneMockup imageUrl={images[0].src} alt={`${title} screenshot 1`} hint={images[0].hint} />
                        </div>
                        <div className="absolute w-56 md:w-64 h-auto" style={{ zIndex: 20, transform: 'rotate(0deg)' }}>
                            <PhoneMockup imageUrl={images[1].src} alt={`${title} screenshot 2`} hint={images[1].hint} />
                        </div>
                        <div className="absolute w-56 md:w-64 h-auto" style={{ zIndex: 10, transform: 'rotate(10deg) translateX(40%) translateY(5%)' }}>
                            <PhoneMockup imageUrl={images[2].src} alt={`${title} screenshot 3`} hint={images[2].hint} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TestimonialCard = ({ review, author, role, rating }: { review: string, author: string, role: string, rating: number }) => (
  <div className="w-[320px] h-[320px] shrink-0 snap-center p-8 flex flex-col justify-between bg-background rounded-lg shadow-lg border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
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
  </div>
);

const HowItWorksStep = ({ icon, title, description, step }: { icon: React.ReactNode, title: string, description: string, step: number }) => (
    <div className="relative pl-12">
        <div className="absolute left-0 top-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-lg border-2 border-primary/20">
            {step}
        </div>
        <div className="flex items-center gap-4 mb-2">
            {icon}
            <h4 className="text-xl font-semibold">{title}</h4>
        </div>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

export default function AppsPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Your Business, In Your Pocket</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage your salon and connect with your clients on the go with our powerful, intuitive mobile apps.
          </p>
        </div>
      </section>

      {/* Section 2: GlowVita Salon App */}
      <AppPromotionSection
        title="GlowVita Salon App (For Your Clients)"
        description="Empower your clients with a seamless booking experience. Our client-facing app makes it easy for them to discover, book, and manage their appointments."
        features={[
          "24/7 online booking & rescheduling",
          "Discover new services and view pricing",
          "Automated appointment reminders & notifications",
          "Securely manage payment methods",
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
            "Manage your calendar and appointments",
            "Access client information and history",
            "Track sales and business performance",
            "Handle staff schedules and payroll",
        ]}
        images={[
            { src: 'https://placehold.co/375x812.png', hint: 'app dashboard screen' },
            { src: 'https://placehold.co/375x812.png', hint: 'app calendar view' },
            { src: 'https://placehold.co/375x812.png', hint: 'app analytics chart' },
        ]}
        reverse={true}
      />
      
      {/* Section 4: Features Grid */}
      <section className="py-20">
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
      <section className="py-20 bg-secondary/50 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">Loved by Professionals</h2>
          <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto mb-12">See what salon owners and stylists are saying about our mobile apps.</p>
        </div>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-fit items-start animate-[slide_60s_linear_infinite] hover:[animation-play-state:paused]">
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
      <section className="py-20">
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
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border/80"></div>
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary/10 animate-pulse"></div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                      <HowItWorksStep step={1} icon={<Download className="h-6 w-6 text-primary" />} title="Download & Setup" description="Get your salon listed and set up your services, staff, and schedule in minutes."/>
                      <HowItWorksStep step={2} icon={<Users className="h-6 w-6 text-primary" />} title="Clients Book Online" description="Clients find your salon and book appointments 24/7 through the GlowVita app or your website."/>
                      <HowItWorksStep step={3} icon={<BarChart className="h-6 w-6 text-primary" />} title="Manage & Grow" description="Use the CRM app to manage bookings, process payments, and grow your business with marketing tools."/>
                  </div>
              </div>
          </div>
      </section>

       <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
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
                    <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 rounded-full blur-3xl opacity-40"></div>
                    <Shield className="relative z-10 h-48 w-48 text-green-500 drop-shadow-lg" />
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
