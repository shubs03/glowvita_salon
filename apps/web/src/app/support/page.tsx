
"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { 
  Check, 
  Search, 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageSquare, 
  Phone, 
  LifeBuoy, 
  Mail,
  Clock,
  Zap,
  ThumbsUp,
  Sparkles,
  Activity,
  Server as ServerIcon,
  Globe,
  Database,
  Bell,
  ArrowRight
} from "lucide-react";
import Link from 'next/link';

const HelpTopic = ({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) => (
  <Card className="hover:shadow-lg transition-shadow group hover:-translate-y-1 transform duration-300 flex flex-col">
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="bg-primary/10 text-primary p-3 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">{icon}</div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
    <CardFooter>
        <Button variant="link" asChild className="p-0 h-auto">
            <Link href={link}>Learn More &rarr;</Link>
        </Button>
    </CardFooter>
  </Card>
);

export default function SupportPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 text-center bg-gradient-to-br from-secondary/50 via-secondary/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            24/7 Support
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">How can we help?</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Our support hub has everything you need to get the most out of our platform. Get instant answers or connect with our support team.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for help... (e.g., 'how to add a client')" 
              className="w-full h-14 text-lg pl-12 rounded-full shadow-lg border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Link href="#">Getting Started</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Link href="#">Billing</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Link href="#">Calendar Management</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
                <Link href="#">Client Profiles</Link>
              </Button>
          </div>
        </div>
      </section>

      {/* New Section: Quick Stats */}
      <section className="py-12 bg-gradient-to-br from-background via-primary/5 to-background border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group p-6 rounded-xl bg-background hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:scale-105 transition-transform">24/7</p>
              <p className="text-sm text-muted-foreground mt-1">Support Available</p>
            </div>
            <div className="group p-6 rounded-xl bg-background hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-blue-100/20">
              <div className="mb-3 w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform">&lt; 2min</p>
              <p className="text-sm text-muted-foreground mt-1">Average Response Time</p>
              <p className="text-xs text-blue-600/80 mt-2">Real-time chat support available</p>
            </div>
            <div className="group p-6 rounded-xl bg-background hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-blue-100/20">
              <div className="mb-3 w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <ThumbsUp className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform">98%</p>
              <p className="text-sm text-muted-foreground mt-1">Satisfaction Rate</p>
              <p className="text-xs text-blue-600/80 mt-2">Based on 10,000+ reviews</p>
            </div>
            <div className="group p-6 rounded-xl bg-background hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-blue-100/20">
              <div className="mb-3 w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform">1000+</p>
              <p className="text-sm text-muted-foreground mt-1">Help Articles</p>
              <p className="text-xs text-blue-600/80 mt-2">Updated weekly with new content</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Help Topics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Browse Help Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <HelpTopic icon={<HelpCircle />} title="Getting Started" description="Find everything you need to set up your account and get started with our platform." link="#" />
            <HelpTopic icon={<BookOpen />} title="User Guides" description="In-depth guides on all our features and functionalities to help you become a power user." link="#" />
            <HelpTopic icon={<Video />} title="Video Tutorials" description="Watch step-by-step tutorials to master our platform and its most powerful features." link="#" />
            <HelpTopic icon={<MessageSquare />} title="Billing & Payments" description="Manage your subscription, view invoices, and understand all aspects of billing." link="#" />
            <HelpTopic icon={<Phone />} title="Contact Support" description="Get in touch with our support team for personal assistance with any issue." link="#" />
            <HelpTopic icon={<LifeBuoy />} title="Troubleshooting" description="Find solutions to common issues and problems to get you back on track quickly." link="#" />
          </div>
        </div>
      </section>
      
      {/* Section 3: Contact Support */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Our dedicated support team is available around the clock to help you with any questions or issues you might have.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="text-left flex flex-col items-start hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex-row items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><Mail /></div>
                        <CardTitle className="text-xl">Email Support</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground mb-4">Best for non-urgent inquiries. We typically respond within a few hours.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild><Link href="mailto:support@example.com">Send us an Email</Link></Button>
                    </CardFooter>
                </Card>
                <Card className="text-left flex flex-col items-start hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex-row items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><Phone /></div>
                        <CardTitle className="text-xl">Phone Support</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground mb-4">Get immediate assistance for urgent issues. Available for Pro plan users.</p>
                    </CardContent>
                     <CardFooter>
                        <Button asChild><Link href="tel:+1234567890">Call Us Now</Link></Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </section>
    </div>
  );
}
