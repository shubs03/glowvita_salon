
"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import { Search, HelpCircle, BookOpen, Video, MessageSquare, Phone, LifeBuoy } from "lucide-react";
import Link from 'next/link';

const HelpTopic = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="bg-primary/10 text-primary p-3 rounded-full">{icon}</div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function SupportPage() {
  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="py-20 text-center bg-secondary/50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">How can we help?</h1>
          <div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search for help..." className="w-full h-14 text-lg pl-12 rounded-full" />
          </div>
        </div>
      </section>

      {/* Section 2: Help Topics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Browse Help Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <HelpTopic icon={<HelpCircle />} title="Getting Started" description="Find everything you need to set up your account and get started." />
            <HelpTopic icon={<BookOpen />} title="User Guides" description="In-depth guides on all our features and functionalities." />
            <HelpTopic icon={<Video />} title="Video Tutorials" description="Watch step-by-step tutorials to master our platform." />
            <HelpTopic icon={<MessageSquare />} title="Billing & Payments" description="Manage your subscription and understand billing." />
            <HelpTopic icon={<Phone />} title="Contact Support" description="Get in touch with our support team for personal assistance." />
            <HelpTopic icon={<LifeBuoy />} title="Troubleshooting" description="Find solutions to common issues and problems." />
          </div>
        </div>
      </section>
      
      {/* Section 3: Contact Support */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground mb-8">Our support team is here to help you 24/7.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="text-left">
                    <CardHeader><CardTitle>Email Support</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Get a response within 24 hours.</p>
                        <Button asChild><Link href="mailto:support@example.com">Send us an Email</Link></Button>
                    </CardContent>
                </Card>
                <Card className="text-left">
                    <CardHeader><CardTitle>Phone Support</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Available for Pro plan users.</p>
                        <Button asChild><Link href="tel:+1234567890">Call Us Now</Link></Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </section>

      {/* Section 4: Video Tutorial Spotlight */}
      <section className="py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Master Your Calendar</h2>
            <p className="text-muted-foreground">Learn how to effectively manage your appointments, staff schedules, and bookings with our detailed video guide.</p>
          </div>
          <div className="aspect-video rounded-lg shadow-xl overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Example video
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Sections 5-10 would be other support resources like Community Forum, System Status, etc. */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold">Explore our Community Forum</h3>
            <p className="text-muted-foreground mt-2 mb-4">Connect with other users and share tips and tricks.</p>
            <Button variant="outline">Visit Forum</Button>
        </div>
      </section>
    </div>
  );
}
