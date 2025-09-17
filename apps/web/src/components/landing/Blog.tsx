
"use client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    title: "10 Hair Color Trends That Will Dominate 2025",
    category: "Hair Trends",
    image: "https://picsum.photos/seed/haircolor/800/600",
    hint: "colorful hair styling trends",
    date: "15.09.2025",
    readTime: "8 min read",
    excerpt: "From vibrant sunset hues to subtle balayage techniques, discover the hottest hair color trends that your clients will be asking for this year. Learn application tips, maintenance advice, and pricing strategies for maximum profitability.",
    author: {
      name: "Isabella Rodriguez",
      avatar: "https://picsum.photos/seed/haircolorist/40/40",
      hint: "professional hair colorist"
    },
    tags: ["Color Trends", "Client Demand", "Pricing"],
    views: "2.1k",
    comments: 47
  },
  {
    title: "Maximizing Salon Revenue: 5 Proven Strategies",
    category: "Business Growth",
    image: "https://picsum.photos/seed/revenue/400/300",
    hint: "salon business analytics dashboard",
    date: "12.09.2025",
    readTime: "6 min read",
    excerpt: "Boost your salon's profitability with these data-driven strategies that successful salon owners swear by.",
    author: {
        name: "Marcus Thompson",
        avatar: "https://picsum.photos/seed/business/40/40",
        hint: "salon business owner"
    },
    tags: ["Revenue", "Strategy", "Analytics"],
    views: "3.8k",
    comments: 89
  },
  {
    title: "The Art of Client Consultation: Building Trust & Loyalty",
    category: "Client Relations",
    image: "https://picsum.photos/seed/consultation/400/300",
    hint: "stylist consulting with client",
    date: "10.09.2025",
    readTime: "5 min read",
    excerpt: "Master the consultation process to understand your clients' needs, set proper expectations, and build lasting relationships.",
    author: {
        name: "Sarah Chen",
        avatar: "https://picsum.photos/seed/stylist/40/40",
        hint: "professional hair stylist"
    },
    tags: ["Consultation", "Client Care", "Communication"],
    views: "1.9k",
    comments: 32
  },
  {
    title: "Sustainable Salon Practices: Going Green in Beauty",
    category: "Sustainability",
    image: "https://picsum.photos/seed/eco/400/300",
    hint: "eco-friendly salon products",
    date: "08.09.2025",
    readTime: "7 min read",
    excerpt: "Learn how to implement eco-friendly practices that appeal to conscious consumers while reducing operational costs.",
    author: {
        name: "Emma Johnson",
        avatar: "https://picsum.photos/seed/eco/40/40",
        hint: "sustainability expert"
    },
    tags: ["Sustainability", "Eco-Friendly", "Cost Savings"],
    views: "1.5k",
    comments: 28
  }
];

export function Blog() {
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <section className="py-20 md:py-28 bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-secondary/10 to-transparent"></div>
      <div className="absolute inset-0 bg-dots-grid opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-5 mb-10 md:mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-6">
            Thoughts & Ideas
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Expert insights, industry trends, and practical tips to help you grow your salon business and master your craft.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Enhanced Featured Post */}
          <div className="group relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20">
            <Link href="#" className="block">
              <figure className="aspect-video relative">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  width={800}
                  height={450}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint={featuredPost.hint}
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge variant="secondary" className="bg-black/20 text-white backdrop-blur-sm border border-white/20">
                    {featuredPost.category}
                  </Badge>
                  <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                    <span>👁</span>
                    <span>{featuredPost.views}</span>
                  </div>
                </div>
              </figure>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                <div className="mb-3">
                  <p className="text-xs text-white/80 font-medium">
                    Trusted by salon professionals worldwide
                  </p>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold line-clamp-2 mb-3 leading-tight group-hover:text-primary/90 transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="text-white/80 line-clamp-3 mb-4 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Image src={featuredPost.author.avatar} alt={featuredPost.author.name} width={28} height={28} className="rounded-full border-2 border-white/50" data-ai-hint={featuredPost.author.hint} />
                      <span className="font-medium">{featuredPost.author.name}</span>
                    </div>
                    <div className="w-px h-5 bg-white/30"></div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="w-px h-5 bg-white/30"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <span>💬</span>
                    <span>{featuredPost.comments}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Enhanced Other Posts */}
          <div className="space-y-6">
            {otherPosts.map((post, index) => (
              <Link href="#" key={index} className="group flex flex-col sm:flex-row gap-4 items-start bg-background/80 backdrop-blur-sm p-5 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 border border-border/50 hover:border-primary/30 overflow-hidden">
                <figure className="w-full sm:w-1/3 aspect-video sm:aspect-square shrink-0 overflow-hidden rounded-lg relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint={post.hint}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                    <span>👁</span>
                    <span>{post.views}</span>
                  </div>
                </figure>
                <div className="flex flex-col flex-1 justify-between h-full py-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-primary/20">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>💬</span>
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground font-medium">
                        Trusted by salon professionals worldwide
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Image src={post.author.avatar} alt={post.author.name} width={20} height={20} className="rounded-full border border-primary/20" data-ai-hint={post.author.hint} />
                        <span className="font-medium">{post.author.name}</span>
                      </div>
                      <span className="text-muted-foreground/50">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="text-muted-foreground/70">
                      {post.date}
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
