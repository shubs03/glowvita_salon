
"use client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "Framer vs Webflow: Which One for Startups?",
    category: "Design Tools",
    image: "https://picsum.photos/seed/blog1/800/600",
    hint: "abstract design comparison",
    date: "14.05.2025",
    readTime: "5 min read",
    excerpt: "In the world of no-code web design, two giants stand tall: Framer and Webflow. We dive deep into which platform is the ultimate choice for startups looking to build stunning, high-performance websites without writing a single line of code.",
    author: {
      name: "Alex Johnson",
      avatar: "https://picsum.photos/seed/author1/40/40",
      hint: "professional man"
    }
  },
  {
    title: "How I Designed a Brand Identity in 3 Days",
    category: "Branding",
    image: "https://picsum.photos/seed/blog2/400/300",
    hint: "logo design process",
    date: "12.05.2025",
    readTime: "3 min read",
    excerpt: "A behind-the-scenes look at a rapid brand identity project, from initial concept to final delivery.",
    author: {
        name: "Maria Garcia",
        avatar: "https://picsum.photos/seed/author2/40/40",
        hint: "creative woman"
    }
  },
  {
    title: "Unlocking Creativity: A Guide to the Design Process",
    category: "Creativity",
    image: "https://picsum.photos/seed/blog3/400/300",
    hint: "ux design wireframe",
    date: "10.05.2025",
    readTime: "7 min read",
    excerpt: "Stuck in a creative rut? This guide breaks down the design process into actionable steps to spark your next big idea.",
    author: {
        name: "David Chen",
        avatar: "https://picsum.photos/seed/author3/40/40",
        hint: "designer thinking"
    }
  },
  {
    title: "The Future of AI in Web Development",
    category: "Technology",
    image: "https://picsum.photos/seed/blog4/400/300",
    hint: "ai code generation",
    date: "08.05.2025",
    readTime: "6 min read",
    excerpt: "Explore how artificial intelligence is set to revolutionize the way we build and interact with websites.",
    author: {
        name: "Sophia Lee",
        avatar: "https://picsum.photos/seed/author4/40/40",
        hint: "tech professional"
    }
  }
];

export function Blog() {
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <section className="py-16 md:py-20 lg:py-24 xl:py-28 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-secondary/10 to-transparent"></div>
      <div className="absolute inset-0 bg-dots-grid opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-5 mb-10 md:mb-16 text-center">
          <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 shadow-sm">
            Journal
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Thoughts & Ideas
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A collection of thoughts, experiments, and insights around design,
            technology, and creativity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Featured Post */}
          <div className="group relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20">
            <Link href="#" className="block">
              <figure className="aspect-video">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={featuredPost.hint}
                />
              </figure>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                <Badge variant="secondary" className="mb-3 bg-white/20 text-white backdrop-blur-sm">
                  {featuredPost.category}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold line-clamp-2 mb-3 leading-tight group-hover:text-primary/90 transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="text-white/80 line-clamp-2 mb-4 hidden md:block">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Image src={featuredPost.author.avatar} alt={featuredPost.author.name} width={24} height={24} className="rounded-full border-2 border-white/50" data-ai-hint={featuredPost.author.hint} />
                    <span>{featuredPost.author.name}</span>
                  </div>
                  <div className="w-px h-5 bg-white/30"></div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Other Posts */}
          <div className="space-y-6">
            {otherPosts.map((post, index) => (
              <Link href="#" key={index} className="group flex flex-col sm:flex-row gap-4 items-start bg-background p-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 border border-border/50 hover:border-primary/30 overflow-hidden">
                <figure className="w-full sm:w-1/3 aspect-video sm:aspect-square shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint={post.hint}
                  />
                </figure>
                <div className="flex flex-col flex-1 justify-between h-full py-1">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-secondary text-secondary-foreground">{post.category}</Badge>
                    <h3 className="text-lg font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                    <div className="flex items-center gap-1.5">
                      <Image src={post.author.avatar} alt={post.author.name} width={20} height={20} className="rounded-full" data-ai-hint={post.author.hint} />
                      <span>{post.author.name}</span>
                    </div>
                    <span className="text-muted-foreground/50">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12 md:mt-16">
          <Button size="lg" variant="secondary" asChild>
            <Link href="#">Visit our blog <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
