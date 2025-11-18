"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Textarea } from "@repo/ui/textarea";
import { toast } from "sonner";
import { StarRating } from "./ui/star-rating";
import { useAuth } from "@/hooks/useAuth";

interface ReviewFormProps {
  entityId: string;
  entityType: "salon" | "product";
  onSubmitSuccess?: () => void;
}

export function ReviewForm({ entityId, entityType, onSubmitSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your review");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityId,
          entityType,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");

      // Reset form
      setRating(0);
      setComment("");
      
      // Notify parent component
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <StarRating 
          rating={rating} 
          onRatingChange={setRating} 
          editable={true}
        />
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your Review
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}