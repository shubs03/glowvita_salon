"use client";

import Image from "next/image";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { ArrowRight, Calendar, User, Clock, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@repo/ui/cn";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
}

interface BlogSectionProps {
  mainPost: BlogPost;
  sidebarPosts: BlogPost[];
}

function MainBlogCard({ post }: { post: BlogPost }) {
  return (
    <div className="group relative overflow-hidden rounded-lg hover:shadow-md border bg-card transition-all duration-300 hover:-translate-y-1 h-full">
      {/* Image Section - Reduced height */}
      <div className="aspect-[3/2] relative w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          layout="fill"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 text-xs px-2 py-1 rounded-full font-medium">
          {post.category}
        </Badge>
      </div>

      {/* Content Section - Reduced padding */}
      <div className="p-4">
        {/* Meta Information - More compact */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Title - Smaller font */}
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {post.title}
        </h3>

        {/* Excerpt - Reduced to 2 lines */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Read More Button */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="transition-all duration-200"
        >
          <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
            Read More
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SidebarBlogCard({ post }: { post: BlogPost }) {
  return (
    <div className="group relative overflow-hidden rounded-lg hover:shadow-md border bg-card transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <div className="aspect-square w-20 h-20 relative overflow-hidden rounded-md flex-shrink-0">
          <Image
            src={post.image}
            alt={post.title}
            layout="fill"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h4>

          {/* Brief description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Category badge */}
          <Badge variant="outline" className="mt-2 text-xs px-2 py-0.5 h-auto">
            {post.category}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function BlogSection({ mainPost, sidebarPosts }: BlogSectionProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-headline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent pb-3 mb-4">
            Health Blog & News
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Stay informed with the latest health tips, medical breakthroughs,
            and wellness advice from our expert team
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Blog Card - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MainBlogCard post={mainPost} />
          </div>

          {/* Sidebar Blog Cards - Takes 1 column */}
          <div className="lg:col-span-1 space-y-4">
            {sidebarPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block">
                <SidebarBlogCard post={post} />
              </Link>
            ))}
          </div>
        </div>

        {/* View All Blogs Button */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Explore more insightful articles and stay updated with the Latest
            in Health and Wellness.
          </p>
          <Link
            href="/articles"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground",
              "rounded-md font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
            )}
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Default export with sample data for easy implementation
export default function BlogSectionWithData() {
  const mainPost: BlogPost = {
    id: "1",
    title:
      "The Future of Telemedicine: How Virtual Consultations Are Revolutionizing Healthcare",
    excerpt:
      "Explore how telemedicine is transforming patient care, making healthcare more accessible, convenient, and efficient. Learn about the latest technologies, benefits for patients and doctors, and what the future holds for virtual medical consultations.",
    image:
      "https://placehold.co/800x500/3B82F6/FFFFFF?text=Telemedicine+Future",
    author: "Dr. Sarah Johnson",
    date: "Oct 10, 2025",
    readTime: "5 min read",
    category: "Technology",
    slug: "future-of-telemedicine",
  };

  const sidebarPosts: BlogPost[] = [
    {
      id: "2",
      title: "10 Essential Health Checkups You Shouldn't Skip After 30",
      excerpt:
        "Discover the crucial health screenings and preventive care measures that become essential as you enter your thirties...",
      image: "https://placehold.co/200x200/10B981/FFFFFF?text=Health+Checkups",
      author: "Dr. Michael Chen",
      date: "Oct 8, 2025",
      readTime: "3 min read",
      category: "Prevention",
      slug: "essential-health-checkups-after-30",
    },
    {
      id: "3",
      title: "Mental Health in the Digital Age: Finding Balance",
      excerpt:
        "Understanding the impact of technology on mental wellness and strategies for maintaining psychological health...",
      image: "https://placehold.co/200x200/8B5CF6/FFFFFF?text=Mental+Health",
      author: "Dr. Emily Rodriguez",
      date: "Oct 5, 2025",
      readTime: "4 min read",
      category: "Mental Health",
      slug: "mental-health-digital-age",
    },
    {
      id: "4",
      title: "Nutrition Myths Debunked: What Science Really Says",
      excerpt:
        "Separating fact from fiction in the world of nutrition and diet advice based on the latest scientific research...",
      image: "https://placehold.co/200x200/F97316/FFFFFF?text=Nutrition+Facts",
      author: "Dr. Lisa Thompson",
      date: "Oct 3, 2025",
      readTime: "6 min read",
      category: "Nutrition",
      slug: "nutrition-myths-debunked",
    },
  ];

  return <BlogSection mainPost={mainPost} sidebarPosts={sidebarPosts} />;
}
