
"use client";

import Image from 'next/image';
import { Badge } from '@repo/ui/badge';
import { ArrowRight, BarChart3, Package, Users, Calendar, Mail, DollarSign } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { ModernCard } from '@repo/ui/modern-card';
import { cn } from '@repo/ui/cn';

const integrations = [
  { 
    name: 'Advanced Analytics', 
    category: 'Business Intelligence', 
    icon: BarChart3,
    description: 'Deep insights into your salon performance, revenue trends, and client behavior patterns.',
    features: ['Real-time performance metrics', 'Revenue forecasting', 'Client retention analysis', 'Staff productivity reports'],
    highlight: 'Increase revenue by 25%',
    color: 'text-blue-600',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  { 
    name: 'Smart Inventory', 
    category: 'Inventory Management', 
    icon: Package,
    description: 'Automated product tracking with low-stock alerts and supplier management.',
    features: ['Auto-reorder notifications', 'Supplier integration', 'Product usage tracking', 'Cost optimization'],
    highlight: 'Reduce waste by 30%',
    color: 'text-green-600',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  { 
    name: 'Client Profiles', 
    category: 'Customer Management', 
    icon: Users,
    description: 'Comprehensive client histories, preferences, and personalized service recommendations.',
    features: ['Service history tracking', 'Preference management', 'Allergy alerts', 'Appointment reminders'],
    highlight: '40% better retention',
    color: 'text-purple-600',
    gradient: 'from-purple-500/20 to-indigo-500/20'
  },
  { 
    name: 'Staff Scheduling', 
    category: 'Workforce Management', 
    icon: Calendar,
    description: 'Intelligent staff scheduling based on skills, availability, and client preferences.',
    features: ['Skill-based matching', 'Availability optimization', 'Overtime tracking', 'Performance analytics'],
    highlight: 'Save 10 hours/week',
    color: 'text-orange-600',
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  { 
    name: 'Marketing Automation', 
    category: 'Marketing', 
    icon: Mail,
    description: 'Automated email campaigns, promotional offers, and client retention strategies.',
    features: ['Email campaign builder', 'Social media integration', 'Loyalty programs', 'Referral tracking'],
    highlight: '50% more bookings',
    color: 'text-pink-600',
    gradient: 'from-pink-500/20 to-rose-500/20'
  },
  { 
    name: 'Financial Reporting', 
    category: 'Financial Management', 
    icon: DollarSign,
    description: 'Real-time financial insights, profit analysis, and tax-ready reporting.',
    features: ['Profit & loss tracking', 'Tax reporting', 'Payment processing', 'Financial forecasting'],
    highlight: 'Streamline accounting',
    color: 'text-teal-600',
    gradient: 'from-teal-500/20 to-cyan-500/20'
  },
];

export function Integrations() {
  return (
    <section className="py-20 md:py-28 bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-5 mb-10 md:mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
            Powerful Features That Drive Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage, grow, and optimize your salon business in one comprehensive platform designed for beauty professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {integrations.map((integration, index) => (
            <a href="#" key={index} className="group block">
              <ModernCard 
                variant="glassmorphism" 
                hover
                className="h-full flex flex-col p-6 lg:p-8 transition-all duration-300 ease-in-out group-hover:border-primary/40 group-hover:shadow-primary/20 group-hover:shadow-2xl relative overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Header with icon and title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20 transition-all duration-500 relative overflow-hidden",
                      "bg-gradient-to-br from-background to-primary/5",
                      "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl",
                      integration.color
                    )}>
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        integration.gradient
                      )}></div>
                      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                        <integration.icon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                        {integration.name}
                      </h3>
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
                        {integration.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                    {integration.description}
                  </p>

                  {/* Features list */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {integration.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="group-hover:text-foreground/70 transition-colors duration-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Highlight badge */}
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {integration.highlight}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <div className={cn(
                        "inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-300 cursor-pointer",
                        "group-hover:bg-primary/10 group-hover:px-4 group-hover:py-2 group-hover:rounded-full group-hover:shadow-md"
                    )}>
                        <span>Explore Feature</span>
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </ModernCard>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
