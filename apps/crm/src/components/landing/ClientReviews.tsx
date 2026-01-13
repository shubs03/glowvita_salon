import { Star } from "lucide-react";
import { ModernCard } from "@repo/ui/modern-card";
import { Button } from "@repo/ui/button";
import { PlayCircle } from "lucide-react";
import Image from "next/image";

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
  <div className="shrink-0 snap-center" style={{ width: "300px" }}>
    <ModernCard variant="glassmorphism" padding="lg" className="h-[480px] flex flex-col">
      <div className="flex h-5 gap-1 text-yellow-400 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4"
            fill="currentColor"
          />
        ))}
        {[...Array(5 - rating)].map((_, i) => (
          <Star key={i + rating} className="h-4 w-4 text-muted-foreground" />
        ))}
      </div>
      
      <div className="flex-1 mb-4">
        <p className="text-sm leading-6 text-foreground">
          {review}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <p className="font-medium text-foreground">
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

const VideoTestimonialCard = () => (
  <div className="h-[480px] w-[80vw] shrink-0 snap-center overflow-hidden laptop:w-[853px] group">
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

const ClientReviews = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-current" />
            Client Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-primary font-headline mb-6">
            Top-Rated by the Industry
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our dedication to building the best-in-class booking software
            and delivering exceptional customer experience continues to be
            recognized time and time again.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-r from-secondary/20 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-20 bg-gradient-to-l from-secondary/20 to-transparent z-10 pointer-events-none"></div>
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
  );
};

export default ClientReviews;