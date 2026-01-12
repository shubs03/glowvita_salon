import { Star } from "lucide-react";

interface TestimonialCardProps {
  review: string;
  author: string;
  role: string;
  rating: number;
}

const TestimonialCard = ({
  review,
  author,
  role,
  rating,
}: TestimonialCardProps) => (
  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-primary/50">
    <div className="flex items-center gap-4">
      <div className="bg-primary/10 text-primary p-3 rounded-2xl flex-shrink-0">
        <Star className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="font-bold text-card-foreground text-lg items-center leading-tight">
          {author}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {role}
        </p>
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1 mb-2">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      ))}
      {[...Array(5 - rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
    <p className="text-muted-foreground text-sm leading-relaxed">
      "{review}"
    </p>
  </div>
);

export default TestimonialCard;