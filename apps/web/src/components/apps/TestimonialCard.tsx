import { Star } from "lucide-react";

interface TestimonialCardProps {
  review: string;
  author: string;
  location: string;
  rating: number;
}

const TestimonialCard = ({
  review,
  author,
  location,
  rating,
}: TestimonialCardProps) => (
  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50 flex flex-col h-full">
    <div className="flex items-center gap-4 mb-4">
      <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
        <Star className="w-6 h-6" strokeWidth={2.5} fill="currentColor" />
      </div>
      <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
        {author}
      </h3>
    </div>
    <div className="flex mb-3">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground fill-muted-foreground'}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
    <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
      "{review}"
    </p>
    <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
      {location}
    </p>
  </div>
);

export default TestimonialCard;