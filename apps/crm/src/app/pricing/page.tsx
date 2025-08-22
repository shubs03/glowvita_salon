
"use client";

import Link from 'next/link';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { Check, HelpCircle, Shield, Star, Award, Clock } from 'lucide-react';

const FeatureCheck = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

export default function PricingPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that's right for your business. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Section 2: Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
             <Card className="flex flex-col text-left h-full shadow-lg hover:shadow-2xl transition-all duration-300 rounded-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Free Trial</CardTitle>
                  <CardDescription className="text-base">Explore all Pro features, no credit card required.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">7</p>
                    <span className="text-lg font-normal text-muted-foreground">Days Free</span>
                  </div>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    <FeatureCheck>Full access to all Pro Plan features.</FeatureCheck>
                    <FeatureCheck>Onboard your team and clients.</FeatureCheck>
                    <FeatureCheck>Experience the growth potential firsthand.</FeatureCheck>
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button className="w-full" variant="outline">Start Free Trial</Button>
                </CardFooter>
              </Card>

            <Card className="border-2 border-primary flex flex-col shadow-2xl relative h-full">
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-primary text-primary-foreground text-sm font-bold px-6 py-2 rounded-full shadow-lg">MOST POPULAR</div>
              </div>
              <CardHeader className="text-left pt-8 pb-4">
                <CardTitle className="text-xl font-bold">Pro Plan</CardTitle>
                <CardDescription className="text-base">For established salons ready to scale.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold">₹1000</p>
                  <span className="text-lg font-normal text-muted-foreground">/ 5 months</span>
                </div>
                <ul className="space-y-4 text-sm text-muted-foreground">
                    <FeatureCheck>Unlimited Clients & Bookings</FeatureCheck>
                    <FeatureCheck>Advanced Analytics & Reporting</FeatureCheck>
                    <FeatureCheck>Email & SMS Marketing Tools</FeatureCheck>
                    <FeatureCheck>Priority Phone & Email Support</FeatureCheck>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button className="w-full">Choose Pro Plan</Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col text-left h-full shadow-lg hover:shadow-2xl transition-all duration-300 rounded-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Basic Plan</CardTitle>
                <CardDescription className="text-base">Perfect for new and growing salons.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold">₹500</p>
                    <span className="text-lg font-normal text-muted-foreground">/ 2 months</span>
                </div>
                <ul className="space-y-4 text-sm text-muted-foreground">
                    <FeatureCheck>Core CRM Features</FeatureCheck>
                    <FeatureCheck>Up to 500 Active Clients</FeatureCheck>
                    <FeatureCheck>Standard Email Support</FeatureCheck>
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button className="w-full" variant="outline">Choose Basic Plan</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Section 3: Feature Comparison */}
      <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4">
               <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Compare Plans</h2>
               <div className="overflow-x-auto">
                   <table className="w-full text-left">
                       <thead>
                           <tr className="border-b">
                               <th className="p-4 w-1/3">Feature</th>
                               <th className="p-4 text-center">Basic</th>
                               <th className="p-4 text-center">Pro</th>
                               <th className="p-4 text-center">Free Trial</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr className="border-b"><td className="p-4 font-medium">Client Management</td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td></tr>
                           <tr className="border-b bg-secondary/50"><td className="p-4 font-medium">Appointment Booking</td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td></tr>
                           <tr className="border-b"><td className="p-4 font-medium">Analytics</td><td className="p-4 text-center">Basic</td><td className="text-center p-4">Advanced</td><td className="text-center p-4">Advanced</td></tr>
                           <tr className="border-b bg-secondary/50"><td className="p-4 font-medium">SMS Marketing</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td></tr>
                           <tr className="border-b"><td className="p-4 font-medium">Priority Support</td><td className="text-center p-4 text-muted-foreground">-</td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td><td className="text-center p-4"><Check className="text-green-500 mx-auto"/></td></tr>
                       </tbody>
                   </table>
               </div>
          </div>
      </section>

      {/* Section 4: FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
                <Card><CardHeader><CardTitle>Can I change my plan later?</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.</p></CardContent></Card>
                <Card><CardHeader><CardTitle>What happens after my free trial ends?</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">You will be prompted to choose a paid plan to continue using the service. Your data will be saved.</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Do you offer support?</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Yes, all plans come with email support. The Pro plan includes priority phone and email support.</p></CardContent></Card>
            </div>
        </div>
      </section>

      {/* Section 5: CTA */}
      <section className="py-20 bg-secondary/50 text-center">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">Start your 7-day free trial today. No credit card required.</p>
            <Button size="lg">Start Free Trial</Button>
        </div>
      </section>
      
      {/* Sections 6, 7, 8, 9, 10 would follow a similar pattern */}
      <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <Award className="h-12 w-12 mx-auto text-primary mb-4"/>
            <h2 className="text-2xl font-bold">Industry Recognized</h2>
            <p className="text-muted-foreground mt-2">Awarded for best usability and customer support.</p>
          </div>
      </section>
    </div>
  );
}
