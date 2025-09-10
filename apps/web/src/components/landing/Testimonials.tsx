
import Image from 'next/image';
import { Star } from 'lucide-react';
import { ModernCard } from '@repo/ui/modern-card';

const TestimonialCard = ({
  review,
  author,
  role,
  rating,
}: {
  review: string;
  author: string;
  role: string;
  rating: number;
}) => (
  <div
    className="shrink-0 snap-center overflow-hidden group"
    style={{ width: "300px" }}
  >
    <ModernCard variant="glassmorphism" padding="lg" className="h-[380px] flex flex-col">
      <div className="flex h-5 gap-1 text-yellow-400 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="h-5 w-5 hover:scale-110 transition-transform duration-200"
            fill="currentColor"
          />
        ))}
        {[...Array(5 - rating)].map((_, i) => (
          <Star key={i + rating} className="h-5 w-5" />
        ))}
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="h-full overflow-hidden">
          <p className="text-sm leading-6 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            "{review}"
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2 pt-4 border-t border-border/20 mt-4">
        <div className="flex min-w-0 flex-col">
          <p className="text-sm font-medium leading-tight text-foreground">
            {author}
          </p>
          <p className="truncate text-xs leading-tight text-muted-foreground mt-1">
            {role}
          </p>
        </div>
      </div>
    </ModernCard>
  </div>
);


export function Testimonials() {
  const testimonials = [
      {
        review: "I work with booth renters at my top-rated salon in Manhattan. I love this CRM because it offers my clients a professional appointment booking experience with seamless online booking features, automated reminders, and the best payment processing rates.",
        author: "Pamela B",
        role: "Salon owner, NYC",
        rating: 5
      },
      {
        review: "This appointment scheduling software is very user friendly and it's incredibly powerful! I decided to give it a go and was utterly surprised as it had more functionality than previous software I was using. The marketplace has been incredible for our salon business too.",
        author: "Alex E",
        role: "Hair stylist and owner",
        rating: 5
      },
       {
        review: "The mobile app has been a game-changer for my salon. I can manage everything on the fly, and my clients love how easy it is to book appointments.",
        author: "Jane D.",
        role: "Owner, The Style Hub",
        rating: 5
      },
      {
        review: "Finally, a CRM that understands the beauty industry. The analytics are powerful and the client management features are top-notch.",
        author: "Michael S.",
        role: "Lead Stylist, Urban Shears",
        rating: 5
      }
  ];

  return (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
      <div className="flex w-fit items-start animate-slide hover:[animation-play-state:paused]">
        {[...testimonials, ...testimonials].map((testimonial, i) => (
          <div key={i} className="mx-4">
            <TestimonialCard {...testimonial} />
          </div>
        ))}
      </div>
    </div>
  )
}
