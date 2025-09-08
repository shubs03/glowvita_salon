
"use client";

import Link from 'next/link';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { 
  Check, 
  HelpCircle, 
  Shield, 
  Star, 
  Award, 
  Clock, 
  UserPlus, 
  Phone, 
  Calendar, 
  Users, 
  BarChart, 
  MessageSquare, 
  Lock,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

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
      <section className="py-20 text-center bg-gradient-to-br from-secondary/50 via-secondary/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            Trusted by 10,000+ Salons
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that's right for your business. No hidden fees, cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>14-day money back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>24/7 support included</span>
            </div>
          </div>
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
      <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Frequently Asked Questions
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Have questions? We've got answers. Here are the most common
                questions about our platform.
              </p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded group-hover:scale-110 transition-transform duration-200">
                      <Shield className="h-5 w-5" />
                    </div>
                    Can I change my plan later?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings. We believe in flexibility to match your business needs as they evolve.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-green-100 text-green-600 p-2 rounded group-hover:scale-110 transition-transform duration-200">
                      <Clock className="h-5 w-5" />
                    </div>
                    What happens after my free trial ends?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    After your 7-day free trial, you will be prompted to choose a paid plan to continue using the service. All your data and settings will be saved, so you can pick up right where you left off.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md group border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded group-hover:scale-110 transition-transform duration-200">
                     <HelpCircle className="h-5 w-5" />
                    </div>
                    Do you offer support if I get stuck?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    Absolutely! All our plans come with comprehensive email support. The Pro plan includes priority phone and email support to ensure you get the help you need, when you need it.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      {/* Section 5: CTA */}
      <section className="py-16 md:py-20 text-center bg-gradient-to-br from-background via-primary/10 to-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <UserPlus className="h-4 w-4" />
                Get Started Today
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold font-headline mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
                Ready to Grow Your Business?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of successful salons worldwide. Transform your
                business today with our powerful, easy-to-use CRM platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-8">
                <Button
                  size="lg"
                  className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  asChild
                >
                  <Link href="/login">
                    Start 7-Day Free Trial{" "}
                    <UserPlus className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
                  asChild
                >
                  <Link href="#">
                    Schedule Demo <Phone className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
