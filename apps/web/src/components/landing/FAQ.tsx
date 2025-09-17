
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { HelpCircle, Shield, Settings, Clock } from 'lucide-react';

export function FAQ() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl pb-2 font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions? We've got answers. Here are the most common
            questions about our platform.
          </p>
        </div>
        <div className="space-y-4 md:space-y-6">
          <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group border border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Shield className="h-5 w-5" />
                </div>
                Is my data secure?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                Yes, we use industry-standard encryption and security
                practices to keep your business and client data safe. Your
                data is encrypted both in transit and at rest, and we comply
                with all major data protection regulations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group border border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Settings className="h-5 w-5" />
                </div>
                Can I use this on multiple devices?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                Absolutely. Our CRM is fully responsive and works
                beautifully on desktops, tablets, and smartphones. Your data
                syncs automatically across all devices, so you can manage
                your salon from anywhere.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg group border border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-4 text-lg md:text-xl group-hover:text-primary transition-colors duration-300">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Clock className="h-5 w-5" />
                </div>
                How quickly can I get started?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                You can be up and running in minutes! Our setup process is
                designed to be simple and intuitive, and our support team is
                available to help you migrate your existing data and train
                your staff.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
