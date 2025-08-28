
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

      {/* New Section: Interactive Help Guide */}
      <section className="py-16 bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Interactive Learning
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Get Help Your Way
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from multiple learning formats designed to help you master our platform quickly and easily
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-blue-50/50 dark:to-blue-950/10 border border-blue-200/50 hover:border-blue-300 dark:hover:border-blue-800">
              <CardHeader>
                <div className="bg-blue-100/50 text-blue-600 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md relative after:absolute after:inset-0 after:bg-blue-500/5 after:blur-xl after:z-[-1]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  Step-by-Step Guides
                </CardTitle>
                <CardDescription>Master essential features with our comprehensive guides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Interactive walkthroughs customized for your learning style</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Interactive screenshots with annotations</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Detailed step-by-step instructions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Downloadable PDF resources</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Progress tracking & bookmarks</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mt-4">
                  View Guides
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-blue-50/50 dark:to-blue-950/10 border border-blue-200/50 hover:border-blue-300 dark:hover:border-blue-800">
              <CardHeader>
                <div className="bg-blue-100/50 text-blue-600 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md relative after:absolute after:inset-0 after:bg-blue-500/5 after:blur-xl after:z-[-1]">
                  <Video className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  Video Library
                </CardTitle>
                <CardDescription>Visual learning with expert-led tutorials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Professional video content at your fingertips</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>4K quality tutorials</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Real-world examples & demos</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Closed captions in 10+ languages</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Downloadable exercise files</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mt-4">
                  Browse Videos
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-blue-50/50 dark:to-blue-950/10 border border-blue-200/50 hover:border-blue-300 dark:hover:border-blue-800">
              <CardHeader>
                <div className="bg-blue-100/50 text-blue-600 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md relative after:absolute after:inset-0 after:bg-blue-500/5 after:blur-xl after:z-[-1]">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  Live Chat Support
                </CardTitle>
                <CardDescription>Direct assistance from certified experts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Get instant help from our experienced team</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>24/7 real-time assistance</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Interactive screen sharing</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Video & voice call support</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span>Chat history & follow-ups</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mt-4">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: Video Tutorial Spotlight */}
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Tutorials</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Master essential features with our curated video guides</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Master Your Calendar</h3>
              <p className="text-muted-foreground mb-6">Learn how to effectively manage your appointments, staff schedules, and bookings with our detailed video guide. This tutorial covers everything from creating a new appointment to handling reschedules and cancellations.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Appointment scheduling best practices</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Staff availability management</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Handling cancellations and reschedules</span>
                </div>
              </div>
              <Button className="mt-8">Watch More Tutorials</Button>
            </div>
            <div className="aspect-video rounded-lg shadow-xl overflow-hidden group">
              <iframe
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: Community Resources */}
      <section className="py-16 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Community Resources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Learn from and connect with other salon owners</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Community Forum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Connect with other users, share experiences, and get advice from the community.</p>
                <Button variant="outline" className="w-full">Visit Forum</Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Access our extensive library of articles, guides, and best practices.</p>
                <Button variant="outline" className="w-full">Browse Articles</Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Success Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Read how other salons achieved success using our platform.</p>
                <Button variant="outline" className="w-full">Read Stories</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New Section: System Status */}
      <section className="py-16 bg-gradient-to-br from-background via-secondary/5 to-background relative">
        <div className="absolute inset-0 bg-grid-black/[0.02] [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Activity className="h-4 w-4" />
            Live Status
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            System Status
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Monitor our system performance in real-time
          </p>
          
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 mb-12">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">All Systems Operational</span>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-900/10 border border-blue-100 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <ServerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-base font-medium mb-2">API Services</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">99.99% uptime</p>
                </div>
                <div className="mt-4 h-1 bg-blue-100 dark:bg-blue-900/50 rounded overflow-hidden">
                  <div className="h-full w-[99.99%] bg-gradient-to-r from-blue-500 to-blue-400 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-900/10 border border-blue-100 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-base font-medium mb-2">Web App</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">100% operational</p>
                </div>
                <div className="mt-4 h-1 bg-blue-100 dark:bg-blue-900/50 rounded overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-blue-500 to-blue-400 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-900/10 border border-blue-100 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-base font-medium mb-2">Database</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Normal</p>
                </div>
                <div className="mt-4 h-1 bg-blue-100 dark:bg-blue-900/50 rounded overflow-hidden">
                  <div className="h-full w-[98%] bg-gradient-to-r from-blue-500 to-blue-400 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-900/10 border border-blue-100 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="mb-4 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-base font-medium mb-2">Notifications</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Active</p>
                </div>
                <div className="mt-4 h-1 bg-blue-100 dark:bg-blue-900/50 rounded overflow-hidden">
                  <div className="h-full w-[97%] bg-gradient-to-r from-blue-500 to-blue-400 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            variant="outline" 
            className="mt-12 group border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
          >
            View Detailed Status 
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </section>
    </div>
  );
}
