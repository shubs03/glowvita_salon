
"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { CheckCircle, Download, Shield, BarChart, Users, Star, ArrowRight, Video, Calendar, ShoppingBag, Settings, User, Box } from 'lucide-react';
import Image from 'next/image';

const AppFeature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="text-center p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-secondary/50 hover:bg-background h-full flex flex-col">
    <div className="flex justify-center mb-4">
        <div className="flex-shrink-0 bg-primary/10 text-primary p-4 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">{icon}</div>
    </div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-muted-foreground text-sm flex-grow">{description}</p>
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

const PhoneCard = ({ imageUrl, alt, hint, rotation, position }: { imageUrl: string, alt: string, hint: string, rotation: string, position: string }) => (
    <div 
        className={`absolute w-full h-full group transition-all duration-500 ease-in-out hover:z-20 hover:scale-105 ${rotation} ${position}`}
        style={{ transformOrigin: 'bottom center' }}
    >
        <div className="w-full h-full bg-slate-900 shadow-2xl overflow-hidden rounded-xl" style={{ clipPath: 'polygon(0 1%, 1% 0, 99% 0, 100% 1%, 100% 99%, 99% 100%, 1% 100%, 0 99%)' }}>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-600 rounded-full"></div>
            <div className="mt-6 h-full p-2">
                <div className="w-full h-full rounded-sm overflow-hidden relative">
                    <Image
                        alt={alt}
                        data-ai-hint={hint}
                        src={imageUrl}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
            </div>
        </div>
    </div>
);


const AppPromotionSection = ({ title, description, features, images, reverse = false }: { title: string, description: string, features: string[], images: { src: string, hint: string }[], reverse?: boolean }) => (
    <section className={`py-20 overflow-hidden relative ${reverse ? 'bg-secondary/50' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900/50 dark:via-background dark:to-purple-900/20 opacity-50"></div>
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className={`text-center md:text-left ${reverse ? 'md:order-2' : ''}`}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{title}</h2>
            <p className="text-muted-foreground mb-6 text-lg">{description}</p>
            <ul className="space-y-4">
              {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>{feature}</span></li>
              ))}
            </ul>
            <AppStoreButtons />
          </div>
          <div className={`relative h-[600px] flex items-center justify-center ${reverse ? 'md:order-1' : ''}`}>
              <div className="w-full h-full relative flex items-center justify-center">
                  <PhoneCard imageUrl={images[0].src} alt={`${title} screenshot 1`} hint={images[0].hint} rotation="-rotate-6" position="translate-x-[-25%] translate-y-[-5%]" />
                  <PhoneCard imageUrl={images[1].src} alt={`${title} screenshot 2`} hint={images[1].hint} rotation="rotate-0" position="z-10 scale-105" />
                  <PhoneCard imageUrl={images[2].src} alt={`${title} screenshot 3`} hint={images[2].hint} rotation="rotate-6" position="translate-x-[25%] translate-y-[-5%]" />
              </div>
          </div>
        </div>
      </section>
);

const TestimonialCard = ({ review, author, role, rating }: { review: string, author: string, role: string, rating: number }) => (
    <div className="shrink-0 snap-center w-[300px] group">
        <div className="flex h-[320px] flex-col gap-4 overflow-hidden rounded-lg bg-background p-6 text-muted-foreground shadow-lg group-hover:shadow-xl transition-all duration-300 border">
            <div className="flex h-5 gap-1 text-yellow-400">
                {[...Array(rating)].map((_, i) => <Star key={i} className="h-5 w-5 hover:scale-110 transition-transform duration-200" fill="currentColor" />)}
                {[...Array(5 - rating)].map((_, i) => <Star key={i + rating} className="h-5 w-5" />)}
            </div>
            <div className="relative flex-1 overflow-hidden">
                <p className="text-base leading-relaxed group-hover:text-foreground transition-colors duration-300">{review}</p>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                    <p className="text-base font-medium leading-tight text-foreground">{author}</p>
                    <p className="truncate text-sm leading-tight text-muted-foreground">{role}</p>
                </div>
            </div>
        </div>
    </div>
);


export default function AppsPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline mb-4">Our Mobile Apps</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage your business and connect with your clients on the go.
          </p>
        </div>
      </section>

      {/* Section 2: GlowVita Salon App */}
       <AppPromotionSection
        title="GlowVita Salon App (For Your Clients)"
        description="Empower your clients with a seamless booking experience. Our client-facing app makes it easy for them to book appointments, view your services, and stay connected."
        features={[
            "Easy appointment booking & rescheduling",
            "View service catalog and pricing",
            "Receive appointment reminders",
            "Manage personal profile and payment methods"
        ]}
        images={[
            { src: "https://placehold.co/375x812.png", hint: "app booking screen" },
            { src: "https://placehold.co/375x812.png", hint: "app services list" },
            { src: "https://placehold.co/375x812.png", hint: "app profile page" }
        ]}
      />

      {/* Section 3: CRM App */}
       <AppPromotionSection
        title="Vendor CRM App (For Your Business)"
        description="Manage your entire salon from the palm of your hand. Our vendor app gives you the power to run your business from anywhere, at any time."
        features={[
            "Manage your calendar and appointments",
            "Access client information and history",
            "Track sales and performance",
            "Update services and staff schedules"
        ]}
        images={[
            { src: "https://placehold.co/375x812.png", hint: "app dashboard screen" },
            { src: "https://placehold.co/375x812.png", hint: "app calendar view" },
            { src: "https://placehold.co/375x812.png", hint: "app clients list" }
        ]}
        reverse
      />
      
      {/* Section 4: Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">Powerful Features in Both Apps</h2>
            <p className="text-muted-foreground mt-2">Built to help you succeed.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AppFeature icon={<Shield size={24} />} title="Secure Payments" description="Process payments securely with our integrated system, ensuring peace of mind for you and your clients." />
            <AppFeature icon={<BarChart size={24} />} title="Business Analytics" description="Track your performance with insightful dashboards and reports to make data-driven decisions." />
            <AppFeature icon={<Users size={24} />} title="Client Management" description="Keep detailed records of all your clients, their history, preferences, and notes in one place." />
          </div>
        </div>
      </section>

      {/* Section 5: Testimonials Marquee */}
      <section className="py-20 bg-secondary/50 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12">Loved by Professionals</h2>
        </div>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-fit items-start space-x-8 animate-slide hover:[animation-play-state:paused]">
                {[...Array(6)].map((_, i) => (
                    <TestimonialCard 
                        key={i}
                        review="The mobile app has been a game-changer for my salon. I can manage everything on the fly, and my clients love how easy it is to book appointments."
                        author="Jane Doe"
                        role="Owner, The Style Hub"
                        rating={5}
                    />
                ))}
            </div>
        </div>
      </section>

      {/* Section 6: Feature Comparison */}
      <section className="py-20">
        <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">App Features at a Glance</CardTitle>
                    <CardDescription>Compare the features of our client and vendor apps.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="overflow-x-auto">
                       <table className="w-full">
                           <thead>
                               <tr className="border-b">
                                   <th className="text-left p-4 font-semibold">Feature</th>
                                   <th className="text-center p-4 font-semibold">Client App</th>
                                   <th className="text-center p-4 font-semibold">Vendor App</th>
                               </tr>
                           </thead>
                           <tbody>
                               <tr className="border-b"><td className="p-4">Book Appointments</td><td className="text-center p-4"><Check className="text-green-500 mx-auto" /></td><td className="text-center p-4"><Check className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b bg-secondary/50"><td className="p-4">Manage Calendar</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><Check className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b"><td className="p-4">Staff Management</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><Check className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b bg-secondary/50"><td className="p-4">Inventory Control</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><Check className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b"><td className="p-4">Sales Analytics</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><Check className="text-green-500 mx-auto" /></td></tr>
                           </tbody>
                       </table>
                   </div>
                </CardContent>
            </Card>
        </div>
      </section>

      {/* Section 7: How It Works */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Dashed line connector for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px border-t-2 border-dashed border-primary/50" style={{transform: 'translateY(-1.5rem)'}}></div>
              <div className="relative flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold border-4 border-background z-10">1</div>
                  <h3 className="text-xl font-semibold mt-4 mb-2">Client Books</h3>
                  <p className="text-muted-foreground text-sm">Client finds your salon on the GlowVita app and books their desired service.</p>
              </div>
              <div className="relative flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold border-4 border-background z-10">2</div>
                  <h3 className="text-xl font-semibold mt-4 mb-2">You Manage</h3>
                  <p className="text-muted-foreground text-sm">You receive the booking instantly on your Vendor CRM app and manage your schedule.</p>
              </div>
              <div className="relative flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold border-4 border-background z-10">3</div>
                  <h3 className="text-xl font-semibold mt-4 mb-2">Grow Your Business</h3>
                  <p className="text-muted-foreground text-sm">Track your performance, re-engage clients, and watch your business thrive.</p>
              </div>
          </div>
        </div>
      </section>

       {/* Section 8: Built for your Business */}
       <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] md:h-[500px]">
            <Image src="https://placehold.co/600x400.png" alt="Stylist consulting with client" layout="fill" className="object-cover rounded-lg shadow-xl" data-ai-hint="stylist client consultation" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Built for Your Business</h2>
            <p className="text-muted-foreground mb-6 text-lg">From solo stylists to multi-location salons, our platform scales with you.</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-full text-primary"><User /></div>
                <div>
                  <h4 className="font-semibold">Independent Professionals</h4>
                  <p className="text-sm text-muted-foreground">Manage your personal brand and client base with ease.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-full text-primary"><ShoppingBag /></div>
                <div>
                  <h4 className="font-semibold">Boutique Salons</h4>
                  <p className="text-sm text-muted-foreground">A complete toolkit for your growing salon.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-full text-primary"><Box /></div>
                <div>
                  <h4 className="font-semibold">Multi-Location Chains</h4>
                  <p className="text-sm text-muted-foreground">Centralize your operations and maintain brand consistency.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Security */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
            <Shield className="h-12 w-12 mx-auto text-primary mb-4"/>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Security You Can Trust</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We take the security of your business and client data seriously. Our platform is built with enterprise-grade security features to ensure your peace of mind.</p>
        </div>
      </section>
      
      {/* Section 10: Final CTA */}
      <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Ready to go mobile?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">Download the apps and take your business to the next level.</p>
            <AppStoreButtons />
          </div>
      </section>
    </div>
  );
}
