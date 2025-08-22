
"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { CheckCircle, Download, Shield, BarChart, Users, Star, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const AppFeature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="text-center p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-center mb-4">
        <div className="flex-shrink-0 bg-primary/10 text-primary p-4 rounded-full">{icon}</div>
    </div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-muted-foreground text-sm">{description}</p>
  </Card>
);

const AppStoreButtons = () => (
  <div className="flex flex-col sm:flex-row gap-4 mt-8">
    <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-black/80 text-white rounded-full">
      <Download className="mr-2 h-5 w-5" /> Download on the App Store
    </Button>
    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full">
      <Download className="mr-2 h-5 w-5" /> Get it on Google Play
    </Button>
  </div>
);

const PhoneMockup = ({ imageUrl, alt, hint }: { imageUrl: string, alt: string, hint: string }) => (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl group">
        <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-black">
            <Image 
                src={imageUrl} 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                alt={alt} 
                width={300} 
                height={600} 
                data-ai-hint={hint}
            />
        </div>
    </div>
);


export default function AppsPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Our Mobile Apps</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage your business and connect with your clients on the go.
          </p>
        </div>
      </section>

      {/* Section 2: GlowVita Salon App */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">GlowVita Salon App (For Clients)</h2>
            <p className="text-muted-foreground mb-6 text-lg">Empower your clients with a seamless booking experience. Our client-facing app makes it easy for them to book appointments, view your services, and stay connected.</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Easy appointment booking & rescheduling</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>View service catalog and pricing</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Receive appointment reminders</span></li>
            </ul>
            <AppStoreButtons />
          </div>
          <div>
            <PhoneMockup imageUrl="https://placehold.co/375x812.png" alt="GlowVita Salon App" hint="app booking screen" />
          </div>
        </div>
      </section>

      {/* Section 3: CRM App */}
      <section className="py-20 bg-secondary/50 overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vendor CRM App (For Your Business)</h2>
            <p className="text-muted-foreground mb-6 text-lg">Manage your entire salon from the palm of your hand. Our vendor app gives you the power to run your business from anywhere, at any time.</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Manage your calendar and appointments</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Access client information and history</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Track sales and performance</span></li>
            </ul>
            <AppStoreButtons />
          </div>
          <div className="md:order-1">
             <PhoneMockup imageUrl="https://placehold.co/375x812.png" alt="Vendor CRM App" hint="app dashboard screen" />
          </div>
        </div>
      </section>
      
      {/* Section 4: Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Features in Both Apps</h2>
            <p className="text-muted-foreground mt-2">Built to help you succeed.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AppFeature icon={<Shield size={24} />} title="Secure Payments" description="Process payments securely with our integrated system." />
            <AppFeature icon={<BarChart size={24} />} title="Business Analytics" description="Track your performance with insightful dashboards." />
            <AppFeature icon={<Users size={24} />} title="Client Management" description="Keep detailed records of all your clients and their history." />
          </div>
        </div>
      </section>

      {/* Section 5: Testimonials */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Professionals</h2>
          <div className="flex justify-center my-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />)}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            "The mobile app has been a game-changer for my salon. I can manage everything on the fly, and my clients love how easy it is to book appointments."
          </p>
          <p className="mt-4 font-semibold">- Jane Doe, Owner of The Style Hub</p>
        </div>
      </section>

      {/* Section 6: Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>App Features at a Glance</CardTitle>
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
                               <tr className="border-b"><td className="p-4">Book Appointments</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b bg-secondary/50"><td className="p-4">Manage Calendar</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b"><td className="p-4">View Service Menu</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td><td className="text-center p-4">-</td></tr>
                               <tr className="border-b bg-secondary/50"><td className="p-4">Process Payments</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                               <tr className="border-b"><td className="p-4">Client Profiles</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><CheckCircle className="text-green-500 mx-auto" /></td></tr>
                           </tbody>
                       </table>
                   </div>
                </CardContent>
            </Card>
        </div>
      </section>
      
      {/* Section 7: Final CTA */}
      <section className="py-20 bg-secondary/50 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to go mobile?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">Download the apps and take your business to the next level.</p>
            <AppStoreButtons />
          </div>
      </section>
    </div>
  );
}
