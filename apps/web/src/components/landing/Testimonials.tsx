import Image from 'next/image';
import { Star } from 'lucide-react';
import { ModernCard } from '@repo/ui/modern-card';

const TestimonialCard = ({
  review,
  author,
  role,
  rating,
  image,
  hint,
}: {
  review: string;
  author: string;
  role: string;
  rating: number;
  image: string;
  hint: string;
}) => (
  <div className="shrink-0 snap-center mx-4" style={{ width: "358px" }}>
    <ModernCard variant="elevated" padding="lg" hover className="h-full flex flex-col">
      <div className="flex-grow flex flex-col">
        <div className="flex h-5 gap-1 text-yellow-400 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < rating ? 'fill-current' : 'text-muted-foreground/30'}`}
            />
          ))}
        </div>
        
        <div className="flex-1 mb-6">
          <p className="text-lg leading-relaxed text-foreground/90">
            "{review}"
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex size-12 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
          <Image
            src={image}
            alt={author}
            width={48}
            height={48}
            data-ai-hint={hint}
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {author}
          </p>
          <p className="text-sm text-muted-foreground">
            {role}
          </p>
        </div>
      </div>
    </ModernCard>
  </div>
);

export function Testimonials() {
  const testimonials = [
    { author: "Sarah Johnson", role: "CEO, Nuvio", review: "Amazing customer support and powerful features—this has transformed the way we manage our workflows!", rating: 5, image: 'https://picsum.photos/seed/avatar1/48/48', hint: 'woman portrait' },
    { author: "Michael Chen", role: "CTO, Innovate Inc.", review: "A truly intuitive and powerful platform. The seamless integration capabilities have saved us countless hours.", rating: 5, image: 'https://picsum.photos/seed/avatar2/48/48', hint: 'man smiling' },
    { author: "Emily Rodriguez", role: "Marketing Director", review: "The best CRM we've ever used. The analytics are a game-changer for our campaign strategies.", rating: 5, image: 'https://picsum.photos/seed/avatar3/48/48', hint: 'woman professional' },
    { author: "David Kim", role: "Lead Designer", review: "A beautifully designed tool that is as functional as it is aesthetic. My team loves using it every day.", rating: 4, image: 'https://picsum.photos/seed/avatar4/48/48', hint: 'man glasses' },
    { author: "Rachel Thompson", role: "Operations Manager", review: "The efficiency gains are undeniable. Our team is more organized and productive than ever before.", rating: 5, image: 'https://picsum.photos/seed/avatar5/48/48', hint: 'woman outdoors' },
  ];

  return (
    <section className="py-20 md:py-28 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.03] dark:bg-grid-white/[0.03] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold font-headline mb-4">Hear From Our Customers</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
                Discover the impact we’ve made through their own words. From seamless onboarding to exceptional support and tangible results.
            </p>
        </div>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex w-fit animate-slide hover:[animation-play-state:paused]">
                {[...testimonials, ...testimonials].map((testimonial, i) => (
                    <div key={i} className="px-4">
                        <TestimonialCard {...testimonial} />
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}