
"use client";

import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/card';
import { Users, Globe, Target, Shield, Star, Sparkles, Heart, Award, ArrowRight, TrendingUp } from 'lucide-react';
import { PageContainer } from '@repo/ui/page-container';

const teamMembers = [
  { name: 'Alice Johnson', role: 'Founder & CEO', image: 'https://picsum.photos/seed/team1/400/400', hint: 'woman smiling' },
  { name: 'Bob Williams', role: 'Chief Technology Officer', image: 'https://picsum.photos/seed/team2/400/400', hint: 'man glasses' },
  { name: 'Charlie Brown', role: 'Head of Product', image: 'https://picsum.photos/seed/team3/400/400', hint: 'professional man' },
  { name: 'Diana Miller', role: 'Lead Designer', image: 'https://picsum.photos/seed/team4/400/400', hint: 'woman creative' },
];

const values = [
  { icon: <Heart className="h-8 w-8" />, title: 'Customer-Centric', description: 'Our customers are at the heart of everything we do. We listen, we learn, and we deliver excellence.' },
  { icon: <Sparkles className="h-8 w-8" />, title: 'Innovation', description: 'We relentlessly pursue innovation to solve problems and create value for the beauty industry.' },
  { icon: <Users className="h-8 w-8" />, title: 'Collaboration', description: 'We believe in the power of teamwork and partnership to achieve extraordinary results.' },
  { icon: <Shield className="h-8 w-8" />, title: 'Integrity', description: 'We operate with unwavering honesty, transparency, and respect in all our interactions.' },
];

const timelineEvents = [
  { year: '2020', title: 'The Spark', description: 'Our founders, a salon owner and a software engineer, conceptualize a better way to manage salon businesses.' },
  { year: '2021', title: 'Launch', description: 'GlowVita is born! We launch our initial platform with core booking and client management features.' },
  { year: '2022', title: 'Growth', description: 'Reached 1,000 active salons and introduced our powerful marketing suite.' },
  { year: '2023', title: 'Expansion', description: 'Launched our dedicated mobile apps for clients and vendors, expanding our reach globally.' },
  { year: '2024', title: 'Innovation', description: 'Integrated AI-powered analytics and introduced supplier marketplace features.' },
];

export default function AboutPage() {
  return (
    <PageContainer padding="none">
      {/* Section 1: Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Empowering Beauty & Wellness
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We are on a mission to revolutionize the salon and spa industry with technology that simplifies management, enhances client experiences, and fuels business growth.
          </p>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
      </section>

      {/* Section 2: Mission & Vision */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/mission/800/600" 
                alt="Our Mission" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="team working office"
              />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary"><Target className="h-6 w-6" /></div>
                  <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To provide beauty and wellness professionals with the most intuitive and powerful tools to manage their business, connect with clients, and achieve their growth ambitions.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-primary/10 rounded-full text-primary"><Globe className="h-6 w-6" /></div>
                  <h2 className="text-2xl md:text-3xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To be the global operating system for the beauty and wellness industry, fostering a connected community where professionals and clients thrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Our Story / Timeline */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Our Journey</h2>
            <p className="text-muted-foreground mt-2">From a simple idea to a global platform.</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-border"></div>
            {timelineEvents.map((event, index) => (
              <div key={index} className={`flex items-center w-full mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                  <p className="text-2xl font-bold text-primary">{event.year}</p>
                  <h3 className="text-xl font-semibold mt-1">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mt-2">{event.description}</p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-4 border-background"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Our Team */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Meet the Team</h2>
            <p className="text-muted-foreground mt-2">The passionate individuals behind GlowVita.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map(member => (
              <Card key={member.name} className="text-center group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      layout="fill" 
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={member.hint}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-primary">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Our Values */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Our Core Values</h2>
            <p className="text-muted-foreground mt-2">The principles that guide our work and our culture.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(value => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Stats & Figures */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-primary">10,000+</p>
              <p className="text-muted-foreground mt-2">Salons Powered</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary">5 Million+</p>
              <p className="text-muted-foreground mt-2">Appointments Booked Monthly</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary">4.9/5</p>
              <p className="text-muted-foreground mt-2">Average Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Awards */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Awards & Recognition</h2>
            <p className="text-muted-foreground mt-2">We're proud of the recognition we've received.</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-80">
            <div className="text-center">
              <Award className="h-16 w-16 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Best Salon Software 2023</p>
              <p className="text-sm text-muted-foreground">Tech Innovators Magazine</p>
            </div>
            <div className="text-center">
              <Star className="h-16 w-16 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Customer's Choice Award</p>
              <p className="text-sm text-muted-foreground">Beauty Tech Reviews</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-16 w-16 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Fastest Growing Platform</p>
              <p className="text-sm text-muted-foreground">Startup Weekly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Our Culture */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Life at GlowVita</h2>
            <p className="text-muted-foreground mt-2">It's more than just a job, it's a passion.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="aspect-video relative rounded-lg overflow-hidden"><Image src="https://picsum.photos/seed/culture1/600/400" alt="Team collaborating" layout="fill" objectFit="cover" data-ai-hint="team collaboration office" /></div>
            <div className="aspect-video relative rounded-lg overflow-hidden"><Image src="https://picsum.photos/seed/culture2/600/400" alt="Team event" layout="fill" objectFit="cover" data-ai-hint="company event fun" /></div>
            <div className="aspect-video relative rounded-lg overflow-hidden"><Image src="https://picsum.photos/seed/culture3/600/400" alt="Creative workspace" layout="fill" objectFit="cover" data-ai-hint="modern office workspace" /></div>
          </div>
        </div>
      </section>

      {/* Section 9: Careers */}
      <section className="py-16 md:py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-headline">Join Our Team</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              We're always looking for talented and passionate people to join us on our mission. If you're excited about technology and the beauty industry, we'd love to hear from you.
            </p>
            <Button size="lg">View Open Positions <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </section>
      
      {/* Section 10: Office Locations */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Our Offices</h2>
            <p className="text-muted-foreground mt-2">Find us at our locations around the world.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>New York, USA</CardTitle>
                <CardDescription>Headquarters</CardDescription>
              </CardHeader>
              <CardContent>
                <p>123 Tech Avenue, Suite 500, New York, NY 10001</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>London, UK</CardTitle>
                <CardDescription>EMEA Office</CardDescription>
              </CardHeader>
              <CardContent>
                <p>456 Innovation Road, London, EC1V 2NX, United Kingdom</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bangalore, India</CardTitle>
                <CardDescription>APAC Development Center</CardDescription>
              </CardHeader>
              <CardContent>
                <p>789 Silicon Drive, Electronic City, Bangalore, 560100</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
