
"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { Search, HelpCircle, BookOpen, Video, MessageSquare, Phone, LifeBuoy, Mail } from "lucide-react";
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
      <section className="py-20 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">How can we help?</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Our support hub has everything you need to get the most out of our platform.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for help... (e.g., 'how to add a client')" className="w-full h-14 text-lg pl-12 rounded-full shadow-md" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="sm" asChild><Link href="#">Getting Started</Link></Button>
              <Button variant="outline" size="sm" asChild><Link href="#">Billing</Link></Button>
              <Button variant="outline" size="sm" asChild><Link href="#">Calendar Management</Link></Button>
              <Button variant="outline" size="sm" asChild><Link href="#">Client Profiles</Link></Button>
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
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg"><Phone /></div>
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

      {/* Section 4: Video Tutorial Spotlight */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Master Your Calendar</h2>
            <p className="text-muted-foreground mb-6">Learn how to effectively manage your appointments, staff schedules, and bookings with our detailed video guide. This tutorial covers everything from creating a new appointment to handling reschedules and cancellations.</p>
            <Button variant="outline">Watch More Tutorials</Button>
          </div>
          <div className="aspect-video rounded-lg shadow-xl overflow-hidden group">
            <iframe
              className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Example video
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Sections 5-10 would be other support resources like Community Forum, System Status, etc. */}
      <section className="py-16 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold">Explore our Community Forum</h3>
            <p className="text-muted-foreground mt-2 mb-4">Connect with other users and share tips and tricks.</p>
            <Button variant="outline">Visit Forum</Button>
        </div>
      </section>
    </div>
  );
}
