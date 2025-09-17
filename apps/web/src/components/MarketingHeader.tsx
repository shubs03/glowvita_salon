
"use client";

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface MarketingHeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export function MarketingHeader({ isMobileMenuOpen, toggleMobileMenu }: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50 before:absolute before:inset-0 before:bg-background/10 before:backdrop-blur-xl before:backdrop-saturate-150 before:z-[-1] before:border-b before:border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        <Link
          href="/"
          className="font-bold text-xl font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent after:absolute after:inset-0 after:bg-gradient-to-r after:from-primary/5 after:to-transparent after:blur-2xl after:z-[-1] hover:opacity-80 transition-opacity"
        >
          Monorepo Maestro
        </Link>
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" className="hover:bg-primary/10" asChild>
            <Link href="/apps">App links</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10" asChild>
            <Link href="/about">About Us</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <Button variant="ghost" className="hover:bg-primary/10" asChild>
            <Link href="/support">Support</Link>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" className="hover:bg-primary/10" asChild>
            <Link href="/client-login">Login</Link>
          </Button>
          <Button
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            asChild
          >
            <Link href="/client-register">
              Sign Up{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </nav>
        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 absolute top-16 left-0 w-full z-30">
          <nav className="flex flex-col items-center gap-2 p-4">
            <Button variant="ghost" className="w-full" asChild><Link href="/apps">App links</Link></Button>
            <Button variant="ghost" className="w-full" asChild><Link href="/pricing">Pricing</Link></Button>
            <Button variant="ghost" className="w-full" asChild><Link href="/about">About Us</Link></Button>
            <Button variant="ghost" className="w-full" asChild><Link href="/contact">Contact</Link></Button>
            <Button variant="ghost" className="w-full" asChild><Link href="/support">Support</Link></Button>
            <Button variant="ghost" className="w-full" asChild><Link href="/client-login">Login</Link></Button>
            <Button className="w-full mt-2" asChild><Link href="/client-register">Sign Up</Link></Button>
          </nav>
        </div>
      )}
    </header>
  );
}
