
"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { CheckCircle, Download, Shield, BarChart, Users, Star } from 'lucide-react';
import Image from 'next/image';

const AppFeature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">{icon}</div>
    <div>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

const AppStoreButtons = () => (
  <div className="flex flex-col sm:flex-row gap-4 mt-6">
    <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-black/80 text-white">
      <Download className="mr-2 h-5 w-5" /> Download on the App Store
    </Button>
    <Button size="lg" variant="outline" className="w-full sm:w-auto">
      <Download className="mr-2 h-5 w-5" /> Get it on Google Play
    </Button>
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
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">GlowVita Salon App (For Clients)</h2>
            <p className="text-muted-foreground mb-6">Empower your clients with a seamless booking experience. Our client-facing app makes it easy for them to book appointments, view your services, and stay connected.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Easy appointment booking & rescheduling</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>View service catalog and pricing</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Receive appointment reminders</span></li>
            </ul>
            <AppStoreButtons />
          </div>
          <div>
            <Image src="https://placehold.co/600x400.png" alt="GlowVita Salon App" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="app booking screen" />
          </div>
        </div>
      </section>

      {/* Section 3: CRM App */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vendor CRM App (For Your Business)</h2>
            <p className="text-muted-foreground mb-6">Manage your entire salon from the palm of your hand. Our vendor app gives you the power to run your business from anywhere, at any time.</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Manage your calendar and appointments</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Access client information and history</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /><span>Track sales and performance</span></li>
            </ul>
            <AppStoreButtons />
          </div>
          <div className="md:order-1">
             <Image src="https://placehold.co/600x400.png" alt="Vendor CRM App" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="app dashboard screen" />
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
            <Card>
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
      
      {/* Section 7, 8, 9, 10 would follow a similar pattern */}
      <section className="py-20 bg-secondary/50 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">And so much more...</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">This is just a glimpse. Download the apps to explore all the features designed to help your business thrive.</p>
          </div>
      </section>

    </div>
  );
}
