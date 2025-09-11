
"use client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

export function Blog() {
  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-5 mb-10 md:mb-16 text-center">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Journal
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold font-headline">
            Thoughts &amp; Ideas
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A collection of thoughts, experiments, and insights around design,
            technology, and creativity.
          </p>
        </div>
        <div>
          <div className="grid grid-cols-12 items-start lg:gap-8 gap-y-12">
            <div className="col-span-12 xl:col-span-6 lg:col-span-5 group">
              <div className="rounded-2xl overflow-hidden bg-background shadow-lg transition-all duration-500 group-hover:scale-[1.01] group-hover:shadow-xl">
                <figure className="aspect-video overflow-hidden">
                  <Image
                    src="https://picsum.photos/seed/blog1/627/260"
                    alt="Framer vs Webflow"
                    width={627}
                    height={260}
                    className="w-full h-full object-cover"
                    data-ai-hint="abstract design"
                  />
                </figure>
                <div className="p-8">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>14.05.2025</span>
                    </div>
                    <div className="w-px h-5 bg-border"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>1 min read</span>
                    </div>
                  </div>
                  <Link href="#" className="block mb-4">
                    <h3 className="text-xl md:text-2xl font-semibold line-clamp-2 hover:text-primary transition-colors">
                      Framer vs Webflow: Which One for Startups?
                    </h3>
                  </Link>
                  <p className="text-muted-foreground line-clamp-2 mb-8">
                    They captured every moment beautifully with creativity and
                    professionalism. Their attention to detail and seamless
                    process made it a joy to work with them.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="#">Read more</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-span-12 xl:col-span-6 lg:col-span-7 space-y-8">
              <div className="group flex sm:flex-row flex-col sm:gap-8 gap-4 items-center bg-background p-4 rounded-2xl shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-xl">
                <figure className="sm:w-1/3 w-full h-40 sm:h-auto sm:aspect-square shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src="https://picsum.photos/seed/blog2/298/260"
                    alt="Brand Identity"
                    width={298}
                    height={260}
                    className="w-full h-full object-cover"
                    data-ai-hint="logo design process"
                  />
                </figure>
                <div className="space-y-4 p-4 sm:p-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>14.05.2025</span>
                    </div>
                    <div className="w-px h-4 bg-border"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>1 min read</span>
                    </div>
                  </div>
                  <Link href="#" className="block">
                    <h3 className="text-lg md:text-xl font-semibold line-clamp-2 hover:text-primary transition-colors">
                      How I Designed a Brand Identity in 3 Days
                    </h3>
                  </Link>
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#">Read more</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="group flex sm:flex-row flex-col sm:gap-8 gap-4 items-center bg-background p-4 rounded-2xl shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-xl">
                <figure className="sm:w-1/3 w-full h-40 sm:h-auto sm:aspect-square shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src="https://picsum.photos/seed/blog3/298/260"
                    alt="Design Process"
                    width={298}
                    height={260}
                    className="w-full h-full object-cover"
                    data-ai-hint="ux design wireframe"
                  />
                </figure>
                <div className="space-y-4 p-4 sm:p-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>12.05.2025</span>
                    </div>
                    <div className="w-px h-4 bg-border"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>3 min read</span>
                    </div>
                  </div>
                  <Link href="#" className="block">
                    <h3 className="text-lg md:text-xl font-semibold line-clamp-2 hover:text-primary transition-colors">
                      Unlocking Creativity: A Guide to the Design Process
                    </h3>
                  </Link>
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="#">Read more</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 md:mt-16">
          <Button size="lg" variant="secondary">
            Visit our blog
          </Button>
        </div>
      </div>
    </section>
  );
}
