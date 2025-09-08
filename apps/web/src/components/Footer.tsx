
import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-background via-secondary/10 to-background border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="font-bold text-xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Monorepo Maestro
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The ultimate monorepo solution for building scalable web applications with Next.js, Turborepo, and a shared component library.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block hover:text-primary transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/apps"
                className="block hover:text-primary transition-colors duration-200"
              >
                Mobile Apps
              </Link>
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                Integrations
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                About Us
              </Link>
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                Careers
              </Link>
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                Blog
              </Link>
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                Press
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link
                href="/support"
                className="block hover:text-primary transition-colors duration-200"
              >
                Help Center
              </Link>
              <Link
                href="/support"
                className="block hover:text-primary transition-colors duration-200"
              >
                Contact Us
              </Link>
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="block hover:text-primary transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Monorepo Maestro. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Built with passion and code</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
