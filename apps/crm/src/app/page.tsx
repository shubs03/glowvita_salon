
"use client";

import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { ArrowRight, Book, CalendarCheck, LineChart, Check, CheckCircle, MessageSquare, CreditCard, Scissors, HelpCircle, Rocket, LogIn, UserPlus, Users, Shield, Settings, Plus, Star, Phone, Download } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const FeatureItem = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="flex gap-4 items-start p-4 rounded-lg transition-all duration-300 hover:bg-secondary">
    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full text-primary">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
  </div>
);

const BenefitItem = ({ icon, title, children, features }: { icon: React.ReactNode, title: string, children: React.ReactNode, features: string[] }) => (
    <div className="group relative p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-primary/10 h-12 w-12 flex items-center justify-center rounded-lg text-primary">
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{children}</p>
            </div>
        </div>
        <ul className="space-y-2 text-sm mt-4">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

const MarqueeItem = ({ icon, text }: { icon: React.ReactNode, text: React.ReactNode }) => (
    <div className="flex items-center gap-3 mx-6">
        <div className="flex-shrink-0 bg-secondary p-2 rounded-full">
            {icon}
        </div>
        <p className="text-sm text-muted-foreground">{text}</p>
    </div>
);

const ActivityMarquee = () => (
    <div className="relative w-full py-4 bg-background border-y overflow-hidden">
        <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]"></div>
        <div className="flex animate-marquee whitespace-nowrap">
            <MarqueeItem icon={<CheckCircle className="h-4 w-4 text-green-500"/>} text={<><span className="font-semibold text-foreground">Glamour Salon</span> just got a new 5-star review.</>} />
            <MarqueeItem icon={<CalendarCheck className="h-4 w-4 text-blue-500"/>} text={<><span className="font-semibold text-foreground">Modern Cuts</span> has a new booking for 2:30 PM.</>} />
            <MarqueeItem icon={<Plus className="h-4 w-4 text-purple-500"/>} text={<><span className="font-semibold text-foreground">Style Hub</span> added a new service: "Keratin Treatment".</>} />
            <MarqueeItem icon={<UserPlus className="h-4 w-4 text-indigo-500"/>} text={<><span className="font-semibold text-foreground">Beauty Bliss</span> has 5 new clients this week.</>} />
            <MarqueeItem icon={<CreditCard className="h-4 w-4 text-pink-500"/>} text={<><span className="font-semibold text-foreground">The Barber Shop</span> processed a payment of ₹1,500.</>} />
        </div>
        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-4">
            <MarqueeItem icon={<CheckCircle className="h-4 w-4 text-green-500"/>} text={<><span className="font-semibold text-foreground">Glamour Salon</span> just got a new 5-star review.</>} />
            <MarqueeItem icon={<CalendarCheck className="h-4 w-4 text-blue-500"/>} text={<><span className="font-semibold text-foreground">Modern Cuts</span> has a new booking for 2:30 PM.</>} />
            <MarqueeItem icon={<Plus className="h-4 w-4 text-purple-500"/>} text={<><span className="font-semibold text-foreground">Style Hub</span> added a new service: "Keratin Treatment".</>} />
            <MarqueeItem icon={<UserPlus className="h-4 w-4 text-indigo-500"/>} text={<><span className="font-semibold text-foreground">Beauty Bliss</span> has 5 new clients this week.</>} />
            <MarqueeItem icon={<CreditCard className="h-4 w-4 text-pink-500"/>} text={<><span className="font-semibold text-foreground">The Barber Shop</span> processed a payment of ₹1,500.</>} />
        </div>
    </div>
);

const AdvantageCard = ({ stat, title, description, icon }: { stat: string, title: string, description: string, icon: React.ReactNode }) => (
    <div className="flex-shrink-0 w-80 h-96 bg-background rounded-lg shadow-lg p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-primary/5 text-[120px]">
            {icon}
        </div>
        <div className="relative z-10">
            <p className="text-6xl font-bold text-primary">{stat}</p>
            <h3 className="text-xl font-semibold mt-2">{title}</h3>
        </div>
        <p className="text-muted-foreground relative z-10">{description}</p>
    </div>
);


export default function CrmHomePage() {
  const [advantageScroll, setAdvantageScroll] = useState(0);

  const scrollAdvantages = (direction: 'left' | 'right') => {
      const container = document.getElementById('advantages-container');
      if (container) {
          const scrollAmount = container.clientWidth / 2;
          container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl font-headline">Vendor CRM</div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Marquee moved under header */}
      <ActivityMarquee />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-24 bg-background overflow-hidden">
            {/* Water drop gradient */}
            <div className="absolute inset-0 opacity-15 [background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--primary))_40%,transparent_100%)]"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center">
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><Scissors className="h-6 w-6"/></div>
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><CalendarCheck className="h-6 w-6"/></div>
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><LineChart className="h-6 w-6"/></div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-4">
                      Elevate Your Salon Business
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                      The all-in-one CRM designed for modern salons and stylists. Manage your clients, bookings, and payments seamlessly to unlock your salon's full potential.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                          <Link href="/dashboard">
                            Go to Dashboard <Rocket className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                          <Link href="#">
                            Learn More
                          </Link>
                        </Button>
                    </div>
                    <div className="mt-16 text-center">
                        <p className="text-sm text-muted-foreground mb-4">Trusted by leading salons and stylists</p>
                        <div className="flex justify-center items-center gap-8 opacity-60">
                            <Users className="h-6 w-6" />
                            <Shield className="h-6 w-6" />
                            <Settings className="h-6 w-6" />
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-secondary/50 to-transparent"></div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold font-headline">Powerful Features, Effortless Control</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Everything you need to manage and grow your salon, all in one place.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative rounded-lg overflow-hidden shadow-2xl group">
                         <Image 
                            src="https://placehold.co/600x700.png" 
                            alt="CRM Dashboard Preview" 
                            width={600} 
                            height={700}
                            className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                            data-ai-hint="dashboard professional"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="space-y-6">
                         <FeatureItem icon={<Book className="h-6 w-6" />} title="Client Management">
                            Keep track of all your client details, history, and preferences in one organized place.
                         </FeatureItem>
                         <FeatureItem icon={<CalendarCheck className="h-6 w-6" />} title="Smart Booking">
                            An intuitive calendar to manage appointments, reduce no-shows, and handle rescheduling with ease.
                         </FeatureItem>
                         <FeatureItem icon={<CreditCard className="h-6 w-6" />} title="Seamless Payments">
                            Integrate payments directly into your workflow. Handle transactions, invoices, and payouts effortlessly.
                         </FeatureItem>
                         <FeatureItem icon={<Scissors className="h-6 w-6" />} title="Service Management">
                            Define and manage your service offerings, durations, and pricing with a flexible system.
                         </FeatureItem>
                         <FeatureItem icon={<LineChart className="h-6 w-6" />} title="Business Analytics">
                            Gain valuable insights into your revenue, client growth, and top-performing services with visual reports.
                         </FeatureItem>
                         <FeatureItem icon={<MessageSquare className="h-6 w-6" />} title="Team Collaboration">
                            Keep your team in sync with internal chat, shared notes, and a collaborative to-do list.
                         </FeatureItem>
                    </div>
                </div>
            </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Why Choose Our CRM?</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        We provide the tools to not just manage, but to grow your business.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <BenefitItem 
                        icon={<Rocket className="h-6 w-6" />} 
                        title="Boost Efficiency"
                        features={["Automated Reminders", "Quick Invoicing", "Staff Scheduling"]}
                    >
                        Reduce administrative tasks by up to 40% and focus on what you do best: making clients happy.
                    </BenefitItem>
                    <BenefitItem 
                        icon={<Users className="h-6 w-6" />} 
                        title="Enhance Client Loyalty"
                        features={["Detailed Client Profiles", "Purchase History", "Personalized Notes"]}
                    >
                        Keep your clients coming back by remembering their preferences and providing a personalized experience every time.
                    </BenefitItem>
                     <BenefitItem 
                        icon={<LineChart className="h-6 w-6" />} 
                        title="Increase Revenue"
                        features={["Service Analytics", "Client Spend Tracking", "Targeted Promotions"]}
                    >
                        Make data-driven decisions to identify your most popular services and create effective marketing campaigns.
                    </BenefitItem>
                </div>
            </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Get Started in 3 Simple Steps</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Launch your salon management to the next level in just a few minutes.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <Card className="bg-background">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 h-12 w-12 flex items-center justify-center rounded-full text-primary font-bold text-xl">1</div>
                            <CardTitle className="mt-4">Sign Up</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Create your account and set up your salon profile in minutes.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 h-12 w-12 flex items-center justify-center rounded-full text-primary font-bold text-xl">2</div>
                            <CardTitle className="mt-4">Add Your Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Easily add your services, pricing, and staff members.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 h-12 w-12 flex items-center justify-center rounded-full text-primary font-bold text-xl">3</div>
                            <CardTitle className="mt-4">Start Booking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Begin managing appointments and growing your client base immediately.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        {/* Salon Types Section */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Built for Every Beauty Business</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                       From solo artists to bustling barbershops, our platform is the perfect fit.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px] text-white font-bold">
                    <div className="relative rounded-lg overflow-hidden col-span-2 row-span-2 group">
                        <Image src="https://placehold.co/600x600.png" alt="Beauty Salon" layout="fill" className="object-cover group-hover:scale-105 transition-transform duration-500" data-ai-hint="beauty salon interior" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-4 text-2xl">Salons</h3>
                    </div>
                    <div className="relative rounded-lg overflow-hidden group">
                        <Image src="https://placehold.co/300x300.png" alt="Barber Shop" layout="fill" className="object-cover group-hover:scale-105 transition-transform duration-500" data-ai-hint="barber shop" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-4 text-xl">Barber Shops</h3>
                    </div>
                    <div className="relative rounded-lg overflow-hidden group">
                        <Image src="https://placehold.co/300x300.png" alt="Nail Studio" layout="fill" className="object-cover group-hover:scale-105 transition-transform duration-500" data-ai-hint="nail studio" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-4 text-xl">Nail Studios</h3>
                    </div>
                    <div className="relative rounded-lg overflow-hidden group">
                        <Image src="https://placehold.co/300x300.png" alt="Spa" layout="fill" className="object-cover group-hover:scale-105 transition-transform duration-500" data-ai-hint="spa wellness" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-4 text-xl">Spas</h3>
                    </div>
                     <div className="relative rounded-lg overflow-hidden group">
                        <Image src="https://placehold.co/300x300.png" alt="Parlor" layout="fill" className="object-cover group-hover:scale-105 transition-transform duration-500" data-ai-hint="beauty parlor" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-4 text-xl">Parlors</h3>
                    </div>
                </div>
            </div>
        </section>

        {/* Integration Showcase */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold font-headline mb-4">Connect Your Favorite Tools</h2>
                 <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Our CRM integrates with popular tools to streamline your workflow.
                 </p>
                 <div className="flex justify-center items-center gap-8 opacity-50">
                     <CalendarCheck className="h-10 w-10"/>
                     <CreditCard className="h-10 w-10"/>
                     <MessageSquare className="h-10 w-10"/>
                     <LineChart className="h-10 w-10"/>
                 </div>
            </div>
        </section>
        
        {/* New Certifications Section */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Recognized for Excellence</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Our commitment to quality and security is backed by industry certifications.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    <Card className="text-center">
                        <CardContent className="p-6">
                            <Image src="https://placehold.co/150x150.png" alt="Certificate 1" width={100} height={100} className="mx-auto mb-4" data-ai-hint="award badge" />
                            <h3 className="font-semibold">Top CRM Software 2024</h3>
                            <p className="text-sm text-muted-foreground">by TechReview</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="p-6">
                            <Image src="https://placehold.co/150x150.png" alt="Certificate 2" width={100} height={100} className="mx-auto mb-4" data-ai-hint="security certificate" />
                             <h3 className="font-semibold">Data Security Certified</h3>
                            <p className="text-sm text-muted-foreground">by SecureData Inc.</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="p-6">
                           <Image src="https://placehold.co/150x150.png" alt="Certificate 3" width={100} height={100} className="mx-auto mb-4" data-ai-hint="customer service award" />
                             <h3 className="font-semibold">Excellence in Support</h3>
                            <p className="text-sm text-muted-foreground">by ClientFirst Awards</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Simple Plans for Every Stage</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Transparent pricing that scales as your business grows. No hidden fees.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                    <Card className="flex flex-col text-left h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Free Trial</CardTitle>
                            <CardDescription>Explore all features, no credit card required.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                             <p className="text-4xl font-bold">7<span className="text-base font-normal text-muted-foreground"> Days Free</span></p>
                             <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Full feature access</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Up to 5 team members</li>
                             </ul>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full" variant="outline">Start Free Trial</Button>
                        </CardFooter>
                    </Card>
                    
                    <Card className="border-2 border-primary flex flex-col shadow-lg relative h-full">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">MOST POPULAR</div>
                        </div>
                        <CardHeader className="text-left">
                            <CardTitle className="text-lg font-semibold">Pro Plan</CardTitle>
                            <CardDescription>For established salons ready to scale.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-4xl font-bold">₹1000<span className="text-base font-normal text-muted-foreground">/ 5 months</span></p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Clients</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited Bookings</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Advanced Analytics</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Email & SMS Marketing</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority Support</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full">Choose Pro Plan</Button>
                        </CardFooter>
                    </Card>
                    
                     <Card className="flex flex-col text-left h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Basic Plan</CardTitle>
                            <CardDescription>Perfect for new and growing salons.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-4xl font-bold">₹500<span className="text-base font-normal text-muted-foreground">/ 2 months</span></p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Up to 500 Clients</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Basic Booking Tools</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Standard Reporting</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Community Support</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full" variant="outline">Choose Basic Plan</Button>
                        </CardFooter>
                    </Card>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Looking for more? Check out our <Link href="#" className="underline text-primary">Enterprise solutions</Link>.
                </p>
            </div>
        </section>

        {/* New "Everything you need" section */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline text-pretty">Everything you need to run your business</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
                        Our platform offers innovative features that bring convenience, efficiency, and an improved experience for both your team members and clients.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <Card className="bg-background/70 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Manage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Manage bookings, sales, clients, locations, and team members. Analyse your business with advanced reporting and analytics.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/70 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Grow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Win new clients on the world’s largest beauty and wellness marketplace. Keep them coming back with powerful marketing features.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/70 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Get Paid</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Get paid fast with seamless payment processing. Reduce no-shows with upfront payments and simplify checkout for clients.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* New Mobile App Promotion Section */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
                        <h2 className="text-3xl font-bold font-headline mb-2">For Your Clients</h2>
                        <p className="text-muted-foreground mb-6">Download the <span className="font-semibold text-primary">GlowVita Salon App</span></p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Book appointments 24/7</li>
                            <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> Reschedule with ease</li>
                            <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-500" /> View past & upcoming bookings</li>
                        </ul>
                         <div className="flex gap-4">
                            <Button size="lg"><Download className="mr-2 h-4 w-4"/> App Store</Button>
                            <Button size="lg"><Download className="mr-2 h-4 w-4"/> Google Play</Button>
                        </div>
                    </div>
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold font-headline mb-2">For Your Business</h2>
                        <p className="text-muted-foreground mb-6">Manage on the go with the <span className="font-semibold text-primary">Vendor CRM App</span></p>
                        <ul className="space-y-3 mb-6 inline-block text-left">
                            <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /> Manage your calendar</li>
                            <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /> View client information</li>
                            <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /> Track your performance</li>
                        </ul>
                        <div className="flex gap-4 justify-center lg:justify-start">
                             <Button size="lg" variant="outline"><Download className="mr-2 h-4 w-4"/> App Store</Button>
                             <Button size="lg" variant="outline"><Download className="mr-2 h-4 w-4"/> Google Play</Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

         {/* New CRM Advantages Section */}
        <section className="py-20 bg-secondary/50 relative overflow-hidden">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Unlock Your Potential</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        See the real-world impact of using our CRM.
                    </p>
                </div>

                <div id="advantages-container" className="flex gap-8 pb-8 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                    <AdvantageCard stat="40%" title="Increase in Bookings" description="Clients booking through our platform are more likely to commit." icon={<CalendarCheck/>}/>
                    <AdvantageCard stat="25%" title="More Repeat Clients" description="Build loyalty with detailed client profiles and personalized service." icon={<Users/>}/>
                    <AdvantageCard stat="15%" title="Higher Average Spend" description="Upsell services and products by understanding client history." icon={<LineChart/>}/>
                    <AdvantageCard stat="50%" title="Less Admin Time" description="Automate reminders and administrative tasks to focus on your craft." icon={<Clock/>}/>
                </div>
                
                <div className="flex justify-end mt-4">
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => scrollAdvantages('left')}><ArrowRight className="h-4 w-4 transform rotate-180" /></Button>
                        <Button variant="outline" size="icon" onClick={() => scrollAdvantages('right')}><ArrowRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-bold font-headline mb-4">Loved by Salon Owners</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Hear what our partners have to say about how our CRM has transformed their business.
            </p>
            <div className="max-w-md mx-auto">
                <Card className="bg-background">
                    <CardContent className="pt-6">
                        <blockquote className="text-lg">
                            "This CRM has been a game-changer for my salon. I'm more organized, my clients are happier, and my revenue has increased by 20% in just three months!"
                        </blockquote>
                        <footer className="mt-4">
                            <p className="font-semibold">— Sarah L., Owner of The Glamour Lounge</p>
                        </footer>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card className="bg-background">
                <CardHeader><CardTitle className="flex items-center gap-3"><HelpCircle className="text-primary"/> Is my data secure?</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Yes, we use industry-standard encryption and security practices to keep your business and client data safe.</p></CardContent>
              </Card>
              <Card className="bg-background">
                <CardHeader><CardTitle className="flex items-center gap-3"><HelpCircle className="text-primary"/> Can I use this on multiple devices?</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Absolutely. Our CRM is fully responsive and works beautifully on desktops, tablets, and smartphones.</p></CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center bg-background">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold font-headline mb-4">Ready to Grow Your Business?</h2>
                <p className="text-muted-foreground mb-8">Join hundreds of successful salons. Get started today.</p>
                <Button size="lg" asChild>
                    <Link href="/login">Sign Up Now <UserPlus className="ml-2 h-4 w-4"/></Link>
                </Button>
            </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Vendor CRM. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
