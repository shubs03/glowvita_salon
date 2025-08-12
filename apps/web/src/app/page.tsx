import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/card';
import { ArrowRight, Code, Rocket } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-headline">Monorepo Maestro</h1>
          <nav className="flex gap-4 items-center">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-32">
          <h2 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tighter">
            A New Era of Development
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Monorepo Maestro provides a powerful, scalable, and unified structure for your Next.js projects.
            Build, test, and deploy with confidence.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Get Started <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                View on GitHub <Code className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
        <section className="bg-secondary py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center font-headline mb-12">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Web Application</CardTitle>
                  <CardDescription>Public facing site for customers.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Engage with your audience through a fast, modern, and responsive website. Powered by Next.js and our shared UI library.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Vendor CRM</CardTitle>
                  <CardDescription>A portal for your vendors.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Empower your vendors with tools to manage products, orders, and view analytics, all in one place.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Admin Panel</CardTitle>
                  <CardDescription>Full control over the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>A comprehensive dashboard for administrators to manage users, content, and system settings securely.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Monorepo Maestro. All rights reserved.</p>
      </footer>
    </div>
  );
}
