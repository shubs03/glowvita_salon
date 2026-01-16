import React from 'react';
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { Check } from 'lucide-react';

const FeatureCheck = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <Check className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
    <span className="text-sm text-muted-foreground">{children}</span>
  </li>
);

const Pricing = () => {
  return (
    <section id="pricing-plans" className="py-10 px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-foreground inline-block pb-4">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-2xl mx-auto">
          Select the perfect plan for your salon's needs. All plans include our core features.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-start mt-8">
        <Card className="flex flex-col text-left h-full bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-card-foreground">Basic Plan</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Perfect for new and growing salons.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold">₹500</p>
              <span className="text-base font-normal text-muted-foreground">/ 2 months</span>
            </div>
            <ul className="space-y-3">
              <FeatureCheck>Core CRM Features</FeatureCheck>
              <FeatureCheck>Up to 500 Active Clients</FeatureCheck>
              <FeatureCheck>Standard Email Support</FeatureCheck>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full" variant="outline">Choose Basic Plan</Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col text-left h-full bg-card border-2 border-primary rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative group hover:border-primary/50">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md">MOST POPULAR</div>
          </div>
          <CardHeader className="pt-8 pb-4">
            <CardTitle className="text-xl font-bold text-card-foreground">Pro Plan</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">For established salons ready to scale.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold">₹1000</p>
              <span className="text-base font-normal text-muted-foreground">/ 5 months</span>
            </div>
            <ul className="space-y-3">
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

        <Card className="flex flex-col text-left h-full bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-card-foreground">Enterprise Plan</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">For large businesses with advanced needs.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold">₹1500</p>
              <span className="text-base font-normal text-muted-foreground">/ 6 months</span>
            </div>
            <ul className="space-y-3">
              <FeatureCheck>All Pro Plan features</FeatureCheck>
              <FeatureCheck>Custom integrations</FeatureCheck>
              <FeatureCheck>Dedicated account manager</FeatureCheck>
              <FeatureCheck>24/7 premium support</FeatureCheck>
            </ul>
          </CardContent>
          <CardFooter className="pt-4">
            <Button className="w-full" variant="outline">Contact Sales</Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default Pricing;