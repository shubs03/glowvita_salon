
"use client";

import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { ArrowRight, Book, CalendarCheck, LineChart, Check, MessageSquare, CreditCard, Scissors, HelpCircle, Rocket, LogIn, UserPlus, Users, Shield, Settings } from 'lucide-react';
import { FaRocket, FaBook, FaCalendarCheck, FaChartLine, FaCheck, FaComments, FaCreditCard, FaCut, FaQuestionCircle, FaSignInAlt, FaUserPlus, FaUsers, FaShieldAlt, FaCogs } from 'react-icons/fa';
import Image from 'next/image';

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

const BenefitItem = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="text-center p-6 bg-background rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="mx-auto bg-primary/10 h-12 w-12 flex items-center justify-center rounded-full text-primary mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{children}</p>
    </div>
);

const ActivityMarquee = () => (
    <div className="relative flex overflow-x-hidden border-t border-b bg-background mt-16 py-3">
        <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Glamour Salon</span> just got a new 5-star review.</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Modern Cuts</span> has a new booking for 2:30 PM.</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Style Hub</span> just added a new service: "Keratin Treatment".</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Beauty Bliss</span> has 5 new clients this week.</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">The Barber Shop</span> successfully processed a payment of ₹1,500.</p>
        </div>
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-12 items-center">
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Glamour Salon</span> just got a new 5-star review.</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Modern Cuts</span> has a new booking for 2:30 PM.</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Style Hub</span> just added a new service: "Keratin Treatment".</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Beauty Bliss</span> has 5 new clients this week.</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">The Barber Shop</span> successfully processed a payment of ₹1,500.</p>
        </div>
    </div>
);


export default function CrmHomePage() {
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

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-24 bg-background overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/30"></div>
            <div className="absolute inset-0 opacity-5 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start gap-4 mb-6">
                            <div className="bg-primary/10 p-3 rounded-full text-primary"><FaCut className="h-6 w-6"/></div>
                            <div className="bg-primary/10 p-3 rounded-full text-primary"><FaCalendarCheck className="h-6 w-6"/></div>
                            <div className="bg-primary/10 p-3 rounded-full text-primary"><FaChartLine className="h-6 w-6"/></div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tighter mb-4">
                        Elevate Your Salon Business
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                        The all-in-one CRM designed for modern salons and stylists. Manage your clients, bookings, and payments seamlessly to unlock your salon's full potential.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" asChild>
                            <Link href="/dashboard">
                                Go to Dashboard <FaRocket className="ml-2 h-5 w-5" />
                            </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                            <Link href="#">
                                Learn More
                            </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative hidden lg:block">
                        <Image 
                            src="https://placehold.co/800x600.png"
                            alt="CRM Dashboard Preview"
                            width={800}
                            height={600}
                            className="rounded-lg shadow-2xl transform transition-transform duration-500 hover:scale-105"
                            data-ai-hint="dashboard professional"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-lg"></div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto pt-8 border-t">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-primary">10K+</p>
                        <p className="text-muted-foreground">Happy Vendors</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-primary">40%</p>
                        <p className="text-muted-foreground">Growth in Bookings</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-primary">24/7</p>
                        <p className="text-muted-foreground">Instant Support</p>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-secondary/50 to-transparent"></div>
        </section>

        <ActivityMarquee/>

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
                    <BenefitItem icon={<Rocket className="h-6 w-6" />} title="Boost Efficiency">
                        Automate reminders, streamline bookings, and reduce administrative tasks by up to 40%.
                    </BenefitItem>
                    <BenefitItem icon={<Users className="h-6 w-6" />} title="Enhance Client Loyalty">
                        Personalize client experiences with detailed history and preferences, increasing retention.
                    </BenefitItem>
                     <BenefitItem icon={<LineChart className="h-6 w-6" />} title="Increase Revenue">
                        Utilize analytics to identify popular services and opportunities for growth.
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

        {/* Who it's for */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Designed For Every Salon</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                       Whether you're a solo artist or a multi-location chain, our CRM scales with you.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card><CardHeader><CardTitle>Individual Stylists</CardTitle></CardHeader><CardContent><p>Manage your personal brand and clients with ease.</p></CardContent></Card>
                    <Card><CardHeader><CardTitle>Small Salons</CardTitle></CardHeader><CardContent><p>A perfect fit for teams looking to grow and organize.</p></CardContent></Card>
                    <Card><CardHeader><CardTitle>Large Chains</CardTitle></CardHeader><CardContent><p>Robust features for multi-location management.</p></CardContent></Card>
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
                     <FaCalendarCheck className="h-10 w-10"/>
                     <FaCreditCard className="h-10 w-10"/>
                     <FaComments className="h-10 w-10"/>
                     <FaChartLine className="h-10 w-10"/>
                 </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Choose Your Plan</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Simple, transparent pricing that scales with your business.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Basic</CardTitle>
                            <CardDescription>Perfect for individual stylists or small salons.</CardDescription>
                            <p className="text-4xl font-bold pt-4">₹999<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Up to 50 Clients</p>
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Basic Booking</p>
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Email Support</p>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full" variant="outline">Choose Plan</Button>
                        </CardFooter>
                    </Card>
                     <Card className="border-primary flex flex-col shadow-lg">
                        <CardHeader>
                            <CardTitle>Pro</CardTitle>
                            <CardDescription>For growing businesses that need more power.</CardDescription>
                            <p className="text-4xl font-bold pt-4">₹2499<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Unlimited Clients</p>
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Advanced Booking & Analytics</p>
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Priority Email & Chat Support</p>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full">Choose Plan</Button>
                        </CardFooter>
                    </Card>
                     <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Enterprise</CardTitle>
                            <CardDescription>Tailored solutions for large-scale operations.</CardDescription>
                            <p className="text-4xl font-bold pt-4">Contact Us</p>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Multi-location Support</p>
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Custom Integrations</p>
                            <p className="flex items-center"><FaCheck className="text-green-500 mr-2"/> Dedicated Account Manager</p>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full" variant="outline">Contact Sales</Button>
                        </CardFooter>
                    </Card>
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
                <Card className="bg-secondary/50">
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
