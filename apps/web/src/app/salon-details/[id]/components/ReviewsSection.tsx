import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { ReviewForm } from '@/components/ReviewForm';
import { Skeleton } from "@repo/ui/skeleton";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  vendorId: string;
  vendorData: any;
  reviewsData: any;
  isLoading: boolean;
  error: any;
  refetchReviews: () => void;
}

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
};

const ReviewSkeleton = () => (
  <div className="border-t pt-4 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-12 w-full" />
  </div>
);

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  vendorId,
  vendorData,
  reviewsData,
  isLoading,
  error,
  refetchReviews,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Calculate review metrics
  const salonReviews = reviewsData?.reviews || [];
  
  const reviewMetrics = React.useMemo(() => {
    if (salonReviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRating = salonReviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / salonReviews.length;

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: salonReviews.length
    };
  }, [salonReviews]);

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false);
    refetchReviews();
  };

  return (
    <section id="reviews">
      <h2 className="text-4xl font-bold mb-2">Reviews</h2>
      <p className="text-muted-foreground mb-6">
        What our clients are saying about us.
      </p>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              {reviewMetrics.averageRating || 0}
            </div>
            <div>
              <StarRating rating={reviewMetrics.averageRating || 0} />
              <p className="text-sm text-muted-foreground">
                Based on {reviewMetrics.totalReviews || 0} reviews
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-t pt-4">
                  <ReviewSkeleton />
                </div>
              ))}
            </div>
          ) : salonReviews.length > 0 ? (
            salonReviews.map((review: Review) => (
              <div key={review._id} className="border-t pt-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-primary">
                      {review.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {review.userName || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating || 0} />
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "{review.comment || "No review text available"}"
                </p>
              </div>
            ))
          ) : (
            // Show placeholder when no reviews available
            <div className="text-center py-12">
              <div className="bg-secondary/20 rounded-lg p-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No reviews yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to leave a review!
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {showReviewForm ? (
            <div className="w-full">
              <ReviewForm
                entityId={vendorData?._id || ''}
                entityType="salon"
                onSubmitSuccess={handleReviewSubmitSuccess}
              />
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowReviewForm(true)}
            >
              {salonReviews.length > 0
                ? "Write a Review"
                : "Write a Review"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </section>
  );
};

export default ReviewsSection;