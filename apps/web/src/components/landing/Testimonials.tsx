
import Image from 'next/image';
import { Star, PlayCircle } from 'lucide-react';
import { Button } from '@repo/ui/button';

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
    <div className="flex h-[380px] flex-col items-start gap-3 overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/80 p-8 text-muted-foreground shadow-lg group-hover:shadow-xl transition-all duration-300 border border-border/50">
      <div className="flex h-5 gap-2 text-yellow-400">
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
          <p className="text-[17px] leading-6 group-hover:text-foreground transition-colors duration-300">
            {review}
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <p className="text-[17px] font-medium leading-[24px] text-foreground">
            {author}
          </p>
          <p className="truncate text-[15px] leading-[20px] text-muted-foreground">
            {role}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const VideoTestimonialCard = () => (
  <div className="h-[380px] w-[80vw] shrink-0 snap-center overflow-hidden laptop:w-[853px] group">
    <div className="relative size-full overflow-hidden rounded-lg shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
      <Image
        src="https://placehold.co/853x480.png"
        alt="Testimonial video poster"
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-500 group-hover:scale-105"
        data-ai-hint="salon professional"
      />
      <div className="absolute inset-0 z-10 flex h-full max-w-full flex-col justify-end rounded-xl text-white bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div className="mx-6 flex items-center justify-between gap-2 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full border-2 border-white/80">
              <Image
                src="https://placehold.co/40x40.png"
                alt="Chris Ward"
                width={40}
                height={40}
                data-ai-hint="portrait man"
              />
            </div>
            <div>
              <p className="text-[17px] font-medium">Chris Ward</p>
              <p className="text-[15px] opacity-80">Founder of HUCKLE</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-0 h-12 w-12 hover:scale-110 transition-all duration-200"
          >
            <PlayCircle className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export function Testimonials() {
  return (
    <section className="py-16 md:py-20 bg-secondary/30 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-primary font-headline mb-6">
            Loved by Professionals
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
            Our dedication to building the best-in-class booking software
            and delivering exceptional customer experience continues to be
            recognized time and time again.
            </p>
        </div>
        <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-secondary/30 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-secondary/30 to-transparent z-10 pointer-events-none"></div>
            <div
            className="flex snap-x snap-mandatory gap-6 md:gap-8 overflow-x-auto scroll-smooth px-5 pb-4"
            style={{ scrollbarWidth: "none" }}
            >
            <div className="flex gap-6 md:gap-8">
                <VideoTestimonialCard />
                <TestimonialCard
                author="Pamela B"
                role="Salon owner, NYC"
                rating={5}
                review="I work with booth renters at my top-rated salon in Manhattan. I love this CRM because it offers my clients a professional appointment booking experience with seamless online booking features, automated reminders, and the best payment processing rates."
                />
                <TestimonialCard
                author="Alex E"
                role="Hair stylist and owner"
                rating={5}
                review="This appointment scheduling software is very user friendly and it's incredibly powerful! I decided to give it a go and was utterly surprised as it had more functionality than previous software I was using. The marketplace has been incredible for our salon business too."
                />
            </div>
            </div>
        </div>
        </div>
    </section>
  )
}
