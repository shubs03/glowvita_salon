"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
  size?: number;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  editable = false,
  size = 20
}: StarRatingProps) {
  const handleClick = (newRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`cursor-pointer ${
            editable ? 'hover:fill-yellow-400 hover:text-yellow-400' : ''
          } ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground"
          }`}
          style={{ width: size, height: size }}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
}