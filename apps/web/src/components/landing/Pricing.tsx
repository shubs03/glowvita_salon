
"use client";

import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { Check, Star, Shield, HelpCircle, Phone, Clock, UserPlus } from "lucide-react";

const FeatureCheck = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

export function Pricing() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your salon's needs. All plans include our core features.
          </p>
        </div>
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
  );
}
