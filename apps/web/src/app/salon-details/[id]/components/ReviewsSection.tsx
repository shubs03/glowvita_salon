import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Star, ArrowRight, Edit } from "lucide-react";
import { ReviewForm } from '@/components/ReviewForm';
import { Skeleton } from "@repo/ui/skeleton";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  entityType?: "salon" | "service";
  entityLabel?: string;
  serviceName?: string;
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
          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-black"}`}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2
            className="relative inline-block text-2xl md:text-3xl font-serif font-bold pb-3 mb-2"
            style={{ color: "#252B42" }}
          >
            Client Feedback
            <span
              className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #252B42 0%, #252B42 40%, transparent 100%)",
              }}
            />
          </h2>
          <p className="text-sm md:text-base text-black mt-1">
            Discover genuine experiences from clients who trust us for their beauty and wellness needs.
          </p>
        </div>
        {!showReviewForm && (
          <button
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors"
            onClick={() => setShowReviewForm(true)}
          >
            <img src="/images/pencil 1.png" alt="pencil" className="w-4 h-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-300 rounded-[2rem] p-6 shadow-sm bg-white">
              <ReviewSkeleton />
            </div>
          ))
        ) : salonReviews.length > 0 ? (
          salonReviews.map((review: Review) => (
            <div key={review._id} className="border border-gray-200 border-t-[3px] border-t-[#422A3C] rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-2">
              <div className="flex w-full justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center text-primary font-bold shadow-inner">
                    {review.userName ? (
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=random`} alt={review.userName} className="w-full h-full object-cover" />
                    ) : (
                      "U"
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">
                      {review.userName || "Anonymous"}
                    </p>
                    <div className="bg-gray-100 rounded text-[10px] text-black px-2 py-0.5 mt-0.5 inline-block">
                      {new Date(review.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <StarRating rating={review.rating || 0} />
                </div>
              </div>

              <div className="w-full pl-[60px]">
                {(review.entityLabel || review.entityType === "service") && (
                  <p className="text-xs text-primary font-medium mb-1">
                    {review.entityLabel || (review.serviceName ? `Service review • ${review.serviceName}` : "Service review")}
                  </p>
                )}
                <p className="text-sm text-black leading-relaxed">
                  {review.comment || "No review text available"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-gray-200 rounded-[2rem] bg-white">
            <Star className="h-12 w-12 mx-auto text-black mb-4" />
            <p className="text-black">No reviews yet</p>
            <p className="text-sm text-black mt-2">Be the first to leave a review!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;