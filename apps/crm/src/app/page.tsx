
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { FaArrowRight, FaBook, FaCalendarCheck, FaChartLine, FaComments, FaCreditCard, FaCut, FaQuestionCircle, FaRocket, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{children}</p>
    </CardContent>
  </Card>
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
                Get Started <FaArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 text-center bg-background">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight mb-4">
              Elevate Your Salon Business
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The all-in-one CRM designed for modern salons and stylists. Manage your clients, bookings, and payments seamlessly.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard <FaRocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Powerful Features, Effortless Control</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Everything you need to manage and grow your salon, all in one place.
            </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={<FaBook className="h-6 w-6 text-primary" />} title="Client Management">
                Keep track of all your client details, history, and preferences in one organized place.
              </FeatureCard>
              <FeatureCard icon={<FaCalendarCheck className="h-6 w-6 text-primary" />} title="Smart Booking">
                An intuitive calendar to manage appointments, reduce no-shows, and handle rescheduling with ease.
              </FeatureCard>
              <FeatureCard icon={<FaCreditCard className="h-6 w-6 text-primary" />} title="Seamless Payments">
                Integrate payments directly into your workflow. Handle transactions, invoices, and payouts effortlessly.
              </FeatureCard>
              <FeatureCard icon={<FaCut className="h-6 w-6 text-primary" />} title="Service Management">
                Define and manage your service offerings, durations, and pricing with a flexible system.
              </FeatureCard>
              <FeatureCard icon={<FaChartLine className="h-6 w-6 text-primary" />} title="Business Analytics">
                Gain valuable insights into your revenue, client growth, and top-performing services with visual reports.
              </FeatureCard>
              <FeatureCard icon={<FaComments className="h-6 w-6 text-primary" />} title="Team Collaboration">
                Keep your team in sync with internal chat, shared notes, and a collaborative to-do list.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-secondary/50">
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
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-3"><FaQuestionCircle className="text-primary"/> Is my data secure?</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Yes, we use industry-standard encryption and security practices to keep your business and client data safe.</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-3"><FaQuestionCircle className="text-primary"/> Can I use this on multiple devices?</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Absolutely. Our CRM is fully responsive and works beautifully on desktops, tablets, and smartphones.</p></CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold font-headline mb-4">Ready to Grow Your Business?</h2>
                <p className="text-muted-foreground mb-8">Join hundreds of successful salons. Get started today.</p>
                <Button size="lg" asChild>
                    <Link href="/login">Sign Up Now <FaUserPlus className="ml-2 h-4 w-4"/></Link>
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
