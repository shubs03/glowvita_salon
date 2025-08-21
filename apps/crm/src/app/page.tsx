
"use client";

import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@repo/ui/card';
import { ArrowRight, Book, CalendarCheck, LineChart, Check, CheckCircle, MessageSquare, CreditCard, Scissors, HelpCircle, Rocket, LogIn, UserPlus, Users, Shield, Settings, Plus, Star, Phone, Download, Clock, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <div className="group relative p-8 bg-background rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden text-left border">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
        <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 bg-primary/10 h-12 w-12 flex items-center justify-center rounded-lg text-primary">
                {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-6">{children}</p>
        <ul className="space-y-3 text-sm">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
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

const TestimonialCard = ({ review, author, role, rating }: { review: string, author: string, role: string, rating: number }) => (
    <div className="shrink-0 snap-center overflow-hidden" style={{width: '300px'}}>
        <div className="flex h-[480px] flex-col items-start gap-3 overflow-hidden rounded-xl bg-muted p-8 text-muted-foreground">
            <div className="flex h-5 gap-2 text-yellow-400">
                {[...Array(rating)].map((_, i) => <Star key={i} className="h-5 w-5" fill="currentColor"/>)}
                {[...Array(5 - rating)].map((_, i) => <Star key={i+rating} className="h-5 w-5"/>)}
            </div>
            <div className="relative flex-1 overflow-hidden">
                <div className="h-full overflow-hidden">
                    <p className="text-[17px] leading-6">{review}</p>
                </div>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                    <p className="text-[17px] font-medium leading-[24px] text-foreground">{author}</p>
                    <p className="truncate text-[15px] leading-[20px] text-muted-foreground">{role}</p>
                </div>
            </div>
        </div>
    </div>
);

const VideoTestimonialCard = () => (
     <div className="h-[480px] w-[80vw] shrink-0 snap-center overflow-hidden laptop:w-[853px]">
        <div className="relative size-full overflow-hidden rounded-xl group">
            <Image 
                src="https://placehold.co/853x480.png"
                alt="Testimonial video poster"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="salon professional"
            />
            <div className="absolute inset-0 z-10 flex h-full max-w-full flex-col justify-end rounded-xl text-white bg-gradient-to-t from-black/60 to-transparent">
                <div className="mx-6 flex items-center justify-between gap-2 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full border border-white">
                            <Image src="https://placehold.co/40x40.png" alt="Chris Ward" width={40} height={40} data-ai-hint="portrait man" />
                        </div>
                        <div>
                            <p className="text-[17px] font-medium">Chris Ward</p>
                            <p className="text-[15px] opacity-80">Founder of HUCKLE</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white rounded-full p-0 h-12 w-12">
                        <PlayCircle className="h-8 w-8" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

const PlatformForCard = ({ title, imageUrl, hint }: { title: string; imageUrl: string; hint: string }) => (
    <a className="relative inline-block h-[194px] w-[309px] shrink-0 overflow-hidden rounded-lg transition-shadow hover:shadow-xl group" href="#">
      <Image
        className="size-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        src={imageUrl}
        alt={title}
        width={309}
        height={194}
        data-ai-hint={hint}
      />
      <div className="absolute inset-0 z-10 flex w-full flex-col justify-end bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex flex-row items-center justify-between gap-2 p-4">
          <div className="text-[20px] font-semibold leading-[28px] text-white">{title}</div>
          <Button
            size="icon"
            className="bg-secondary text-secondary-foreground rounded-full opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
            aria-label={title}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </a>
  );
  
const PlatformForMarquee = ({ rtl = false }: { rtl?: boolean }) => {
    const items = [
      { title: 'Hair Salon', imageUrl: 'https://placehold.co/309x194.png', hint: 'hair salon'},
      { title: 'Nail Salon', imageUrl: 'https://placehold.co/309x194.png', hint: 'nail salon'},
      { title: 'Barbers', imageUrl: 'https://placehold.co/309x194.png', hint: 'barber shop'},
      { title: 'Waxing Salon', imageUrl: 'https://placehold.co/309x194.png', hint: 'waxing salon' },
      { title: 'Medspa', imageUrl: 'https://placehold.co/309x194.png', hint: 'spa' },
      { title: 'Eyebrow Bar', imageUrl: 'https://placehold.co/309x194.png', hint: 'eyebrows' },
    ];
    return (
      <div className="w-full overflow-hidden">
        <div className={`flex w-fit items-start space-x-8 ${rtl ? 'animate-slide-rtl' : 'animate-slide'} hover:[animation-play-state:paused]`}>
            {[...items, ...items].map((item, index) => (
                <PlatformForCard key={`${item.title}-${index}`} title={item.title} imageUrl={item.imageUrl} hint={item.hint} />
            ))}
        </div>
      </div>
    );
};

const AppPromotionSection = ({ appName, title, description, features, appStoreUrl, googlePlayUrl, imageUrl, imageHint, reverse = false }) => (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
          <div className={`lg:text-left ${reverse ? 'lg:col-start-2' : ''}`}>
            <h2 className="text-3xl font-bold font-headline mb-2">{appName}</h2>
            <p className="text-muted-foreground mb-6">{description}</p>
            <ul className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="flex gap-4 lg:justify-start">
              <Button size="lg" asChild><Link href={appStoreUrl}><Download className="mr-2 h-4 w-4" /> App Store</Link></Button>
              <Button size="lg" asChild><Link href={googlePlayUrl}><Download className="mr-2 h-4 w-4" /> Google Play</Link></Button>
            </div>
          </div>
          <div className={`relative flex justify-center ${reverse ? 'lg:col-start-1' : ''}`}>
            <div className="relative w-80 h-[550px] bg-gray-800 rounded-[40px] border-8 border-gray-900 overflow-hidden shadow-2xl">
              <Image src={imageUrl} alt={`${appName} screenshot`} layout="fill" objectFit="cover" data-ai-hint={imageHint} />
            </div>
          </div>
        </div>
      </div>
    </section>
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
            <Button variant="ghost" asChild><Link href="#">App Links</Link></Button>
            <ThemeToggle />
            <Button variant="ghost" asChild><Link href="#">Support</Link></Button>
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

        {/* Why Choose Us */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold font-headline">Why Choose Our CRM?</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        We provide the tools to not just manage, but to grow your business.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <BenefitItem 
                        icon={<Rocket className="h-6 w-6" />} 
                        title="Boost Efficiency"
                        features={["Automated appointment reminders", "Quick client check-in & check-out", "Staff scheduling & payroll reports", "Centralized client communication logs"]}
                    >
                        Reduce administrative tasks and paperwork by up to 40%. Focus on what you do best: making your clients look and feel amazing.
                    </BenefitItem>
                    <BenefitItem 
                        icon={<Users className="h-6 w-6" />} 
                        title="Enhance Client Loyalty"
                        features={["Detailed client profiles & history", "Personalized birthday & loyalty rewards", "Targeted marketing campaigns", "Post-visit feedback collection"]}
                    >
                        Keep your clients coming back for more. Remember their preferences and provide a personalized, high-touch experience every time.
                    </BenefitItem>
                     <BenefitItem 
                        icon={<LineChart className="h-6 w-6" />} 
                        title="Increase Revenue"
                        features={["Service & product sales analytics", "Client spend tracking & segmentation", "Smart upselling suggestions", "Online booking to capture new clients 24/7"]}
                    >
                        Make data-driven decisions. Identify your most popular services, understand client spending habits, and create effective marketing campaigns.
                    </BenefitItem>
                </div>
            </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-headline">Simple Plans for Every Stage</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Transparent pricing that scales as your business grows. No hidden fees.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                     <Card className="flex flex-col text-left h-full bg-background/70 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Basic Plan</CardTitle>
                            <CardDescription>Perfect for new and growing salons.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-4xl font-bold">₹500<span className="text-base font-normal text-muted-foreground">/ 2 months</span></p>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span><span className="font-semibold text-foreground">Core CRM Features:</span> Client profiles, appointment booking, and basic reporting.</span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Up to 500 Active Clients</span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Standard Email Support</span></li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full" variant="outline">Choose Basic Plan</Button>
                        </CardFooter>
                    </Card>
                    
                    <Card className="border-2 border-primary flex flex-col shadow-2xl relative h-full bg-background">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">MOST POPULAR</div>
                        </div>
                        <CardHeader className="text-left">
                            <CardTitle className="text-lg font-semibold">Pro Plan</CardTitle>
                            <CardDescription>For established salons ready to scale.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-4xl font-bold">₹1000<span className="text-base font-normal text-muted-foreground">/ 5 months</span></p>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span><span className="font-semibold text-foreground">Everything in Basic, plus:</span></span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Unlimited Clients & Bookings</span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Advanced Analytics & Reporting</span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Email & SMS Marketing Tools</span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Priority Phone & Email Support</span></li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full">Choose Pro Plan</Button>
                        </CardFooter>
                    </Card>
                    
                    <Card className="flex flex-col text-left h-full bg-background/70 border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Free Trial</CardTitle>
                            <CardDescription>Explore all Pro features, no credit card required.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                             <p className="text-4xl font-bold">7<span className="text-base font-normal text-muted-foreground"> Days Free</span></p>
                             <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Full access to all Pro Plan features.</span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Onboard your team and clients.</span></li>
                                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-1 text-green-500" /> <span>Experience the growth potential firsthand.</span></li>
                             </ul>
                        </CardContent>
                        <CardFooter>
                           <Button className="w-full" variant="outline">Start Free Trial</Button>
                        </CardFooter>
                    </Card>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Looking for more? Check out our <Link href="#" className="underline text-primary">Enterprise solutions</Link>.
                </p>
            </div>
        </section>

        {/* Everything you need section */}
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="md:text-right">
                         <h2 className="text-4xl md:text-5xl font-bold font-headline text-pretty">Everything you need to run your business</h2>
                         <p className="mt-4 max-w-xl md:ml-auto text-muted-foreground">
                            Our platform offers innovative features that bring convenience, efficiency, and an improved experience for both your team members and clients.
                         </p>
                    </div>
                     <div className="space-y-6">
                        <Card className="bg-secondary/50 border-l-4 border-primary">
                            <CardHeader>
                                <CardTitle>Manage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Manage bookings, sales, clients, locations, and team members. Analyse your business with advanced reporting and analytics.</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-secondary/50 border-l-4 border-primary">
                            <CardHeader>
                                <CardTitle>Grow</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Win new clients on the world’s largest beauty and wellness marketplace. Keep them coming back with powerful marketing features.</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-secondary/50 border-l-4 border-primary">
                            <CardHeader>
                                <CardTitle>Get Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Get paid fast with seamless payment processing. Reduce no-shows with upfront payments and simplify checkout for clients.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>

        {/* Mobile App Promotion Section */}
        <AppPromotionSection
          appName="For Your Clients"
          title="GlowVita Salon App"
          description="Empower your clients with a seamless booking experience."
          features={["Book appointments 24/7", "Reschedule with ease", "View past & upcoming bookings", "Receive exclusive offers"]}
          appStoreUrl="#"
          googlePlayUrl="#"
          imageUrl="https://placehold.co/375x812.png"
          imageHint="mobile app screenshot booking"
        />

        <AppPromotionSection
          appName="For Your Business"
          title="Vendor CRM App"
          description="Manage your salon on the go."
          features={["Manage your calendar", "View client information", "Track your performance", "Access business reports"]}
          appStoreUrl="#"
          googlePlayUrl="#"
          imageUrl="https://placehold.co/375x812.png"
          imageHint="mobile crm dashboard"
          reverse={true}
        />

        {/* CRM Advantages Section */}
        <section className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-headline">Unlock Your Potential</h2>
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
        
        {/* Top-rated by the industry Section */}
        <section className="py-20 bg-secondary/50">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl font-bold leading-tight text-primary font-headline">Top-Rated by the Industry</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Our dedication to building the best-in-class booking software and delivering exceptional customer experience continues to be recognised time and time again.
                    </p>
                </div>
                <div className="relative">
                    <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-4" style={{ scrollbarWidth: 'none' }}>
                        <div className="flex gap-6">
                            <VideoTestimonialCard />
                            <TestimonialCard author="Pamela B" role="Salon owner, NYC" rating={5} review="I work with booth renters at my top-rated salon in Manhattan. I love Fresha because it offers my clients a professional appointment booking experience with seamless online booking features, automated reminders, and the best payment processing rates." />
                            <TestimonialCard author="Alex E" role="Hair stylist and owner" rating={5} review="This appointment scheduling software is very user friendly and it's free! I decided to give it a go and was utterly surprised as it had more functionality than previous software I was using. The Fresha marketplace has been incredible for our salon business too."/>
                            <TestimonialCard author="Gayle S" role="Business owner" rating={5} review="Coming from a much more complicated system, this was so wonderfully easy to figure out and implement. Customer service has always been so kind and responsive. It's a truly fantastic product, and hands down the best salon scheduling system I've seen."/>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Platform for all section */}
        <section className="py-20 bg-background">
            <div className="mx-auto max-w-[2000px] space-y-8">
                <h2 className="px-5 text-center text-4xl font-bold leading-tight laptop:text-left laptop:text-5xl laptop:leading-tight font-headline">A platform suitable for all</h2>
                <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                    <PlatformForMarquee />
                </div>
                <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                    <PlatformForMarquee rtl={true} />
                </div>
            </div>
        </section>


        {/* FAQ Section */}
        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 font-headline">Frequently Asked Questions</h2>
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
                <h2 className="text-4xl font-bold font-headline mb-4">Ready to Grow Your Business?</h2>
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
