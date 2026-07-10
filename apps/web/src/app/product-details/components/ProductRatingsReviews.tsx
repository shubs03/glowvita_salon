import React from "react";
import { Star, Loader2, ThumbsUp, ChevronRight, User } from "lucide-react";
import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductRatingsReviewsProps {
  averageRating?: number;
  totalRatings?: number;
  totalReviews?: number;
  ratingsBreakdown?: Array<{
    stars: number;
    count: number;
    percentage: number;
  }> | null;
  productReviews?: Array<any>;
  productQuestions?: Array<any>;
  productId?: string | string[] | null;
  onRefetchReviews?: (() => void) | null;
  onRefetchQuestions?: (() => void) | null;
  onSubmitReview?: ((reviewData: any) => Promise<void>) | null;
  onSubmitQuestion?: ((questionData: any) => Promise<void>) | null;
}

const ProductRatingsReviews: React.FC<ProductRatingsReviewsProps> = ({
  averageRating = 4.3,
  totalRatings = 23863,
  totalReviews = 13954,
  ratingsBreakdown = null,
  productReviews = [],
  productQuestions = [],
  productId = null,
  onRefetchReviews = null,
  onRefetchQuestions = null,
  onSubmitReview = null,
  onSubmitQuestion = null,
}) => {
  // Calculate breakdown based on actual product reviews
  const calculateBreakdown = () => {
    if (productReviews && productReviews.length > 0) {
      // Count ratings for each star value
      const ratingCounts: { [key: number]: number } = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      productReviews.forEach((review: any) => {
        const rating = review.rating;
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating]++;
        }
      });

      // Calculate percentages
      const totalReviews = productReviews.length;
      return [
        { stars: 5, count: ratingCounts[5], percentage: totalReviews > 0 ? Math.round((ratingCounts[5] / totalReviews) * 100) : 0 },
        { stars: 4, count: ratingCounts[4], percentage: totalReviews > 0 ? Math.round((ratingCounts[4] / totalReviews) * 100) : 0 },
        { stars: 3, count: ratingCounts[3], percentage: totalReviews > 0 ? Math.round((ratingCounts[3] / totalReviews) * 100) : 0 },
        { stars: 2, count: ratingCounts[2], percentage: totalReviews > 0 ? Math.round((ratingCounts[2] / totalReviews) * 100) : 0 },
        { stars: 1, count: ratingCounts[1], percentage: totalReviews > 0 ? Math.round((ratingCounts[1] / totalReviews) * 100) : 0 },
      ];
    } else {
      // Use provided breakdown or zero values
      return ratingsBreakdown || [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 },
      ];
    }
  };

  const ratingsData = {
    averageRating: averageRating,
    totalRatings: totalRatings,
    totalReviews: totalReviews,
    breakdown: calculateBreakdown(),
  };

  // Review states
  const [reviewRating, setReviewRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState("");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

  // Question states
  const [questionText, setQuestionText] = React.useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = React.useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to write a review", {
        action: {
          label: "Log In",
          onClick: () => router.push("/client-login"),
        },
      });
      return;
    }

    // Validate rating
    if (!reviewRating || reviewRating < 1) {
      toast.error("Please select a rating");
      return;
    }

    // Validate comment
    if (!reviewComment.trim()) {
      toast.error("Please write a review");
      return;
    }

    if (reviewComment.trim().length < 10) {
      toast.error("Review must be at least 10 characters long");
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (onSubmitReview) {
        await onSubmitReview({
          productId: Array.isArray(productId) ? productId[0] : productId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
      }

      toast.success("Review submitted successfully!", {
        description:
          "Your review will be visible in your profile after approval by the product owner.",
      });

      // Reset form
      setReviewRating(0);
      setHoveredRating(0);
      setReviewComment("");
      if (onRefetchReviews) onRefetchReviews();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast.error(
        error?.data?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle question submission
  const handleSubmitQuestion = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to ask a question", {
        action: {
          label: "Log In",
          onClick: () => router.push("/client-login"),
        },
      });
      return;
    }

    if (!questionText.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (questionText.trim().length < 10) {
      toast.error("Question must be at least 10 characters long");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      if (onSubmitQuestion) {
        await onSubmitQuestion({
          productId: Array.isArray(productId) ? productId[0] : productId,
          question: questionText.trim(),
        });
      }

      toast.success("Question submitted successfully!", {
        description: "The vendor will answer your question soon.",
      });

      setQuestionText("");
      if (onRefetchQuestions) onRefetchQuestions();
    } catch (error: any) {
      console.error("Failed to submit question:", error);
      toast.error(
        error?.data?.message || "Failed to submit question. Please try again."
      );
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* Product Ratings & Reviews Card */}
      <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Product Ratings & Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 mb-8">
            {/* Left - Average Rating */}
            <div className="flex flex-col items-center md:items-start justify-center">
              <div className="text-6xl font-bold text-green-700 mb-2">
                {ratingsData.averageRating}
              </div>
              <div className="text-[11px] text-gray-500 leading-tight">
                {ratingsData.totalRatings.toLocaleString()} Ratings,<br />
                {ratingsData.totalReviews.toLocaleString()} Reviews
              </div>
            </div>

            {/* Right - Star Distribution Bars */}
            <div className="space-y-3">
              {[
                { label: "Excellent", data: ratingsData.breakdown.find(b => b.stars === 5) || { count: 0, percentage: 0 }, color: "bg-green-500" },
                { label: "Very Good", data: ratingsData.breakdown.find(b => b.stars === 4) || { count: 0, percentage: 0 }, color: "bg-green-500" },
                { label: "Good",      data: ratingsData.breakdown.find(b => b.stars === 3) || { count: 0, percentage: 0 }, color: "bg-orange-400" },
                { label: "Average",   data: ratingsData.breakdown.find(b => b.stars === 2) || { count: 0, percentage: 0 }, color: "bg-gray-300" },
                { label: "Poor",      data: ratingsData.breakdown.find(b => b.stars === 1) || { count: 0, percentage: 0 }, color: "bg-red-500" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-xs text-gray-600 font-medium">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.data.percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-gray-500 text-xs">
                    {item.data.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Reviews List */}
          <div className="mt-8 space-y-8">
            {productReviews.length > 0 ? (
              productReviews.map((review: any) => (
                <div key={review._id} className="border-b border-gray-100 pb-8 last:border-b-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                       {review.userImage ? (
                         <img src={review.userImage} alt={review.userName} className="w-full h-full object-cover" />
                       ) : (
                         <User className="h-5 w-5 text-gray-400" />
                       )}
                    </div>
                    <div className="font-semibold text-[13px] text-gray-800">{review.userName || "User"}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-700 text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 text-[10px] font-bold">
                      {review.rating.toFixed(1)} <Star className="h-2.5 w-2.5 fill-white text-white" />
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">
                      - Posted on {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <p className="text-[13px] text-gray-800 font-medium mb-4 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Review Images (if any) */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((img: string, i: number) => (
                        <div key={i} className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <img src={img} className="w-full h-full object-cover" alt="Review photo" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium cursor-pointer hover:text-gray-800">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Helpful ({review.helpfulCount || Math.floor(Math.random() * 50)})
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {productReviews.length > 0 && (
             <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-[13px] font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View All Reviews <ChevronRight className="h-4 w-4" />
                </button>
             </div>
          )}

          {/* Write a Review Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Label
              htmlFor="write-review"
              className="font-semibold mb-2 block"
            >
              Write a Review
            </Label>

            {/* Star Rating Input */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">
                Your Rating:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${star <= (hoveredRating || reviewRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                        }`}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({reviewRating} {reviewRating === 1 ? "star" : "stars"})
                </span>
              )}
            </div>

            {/* Review Text Input */}
            <Textarea
              id="write-review"
              placeholder="Share your experience with this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              className="mb-2"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={
                  isSubmittingReview || !reviewComment.trim() || !reviewRating
                }
                className="flex-1"
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>

            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground mt-2">
                Please{" "}
                <button
                  onClick={() => router.push("/client-login")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  log in
                </button>{" "}
                to write a review
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions & Answers Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Questions & Answers</h2>
        <Card>
          <CardContent className="p-6 space-y-6">
            {productQuestions.length > 0 ? (
              productQuestions.map((item: any) => (
                <div key={item._id} className="border-b pb-4 last:border-b-0">
                  <p className="font-semibold">Q: {item.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Asked by {item.userName}
                  </p>
                  {item.answer && (
                    <>
                      <p className="text-sm text-muted-foreground mt-2">
                        A: {item.answer}
                      </p>

                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No questions yet. Be the first to ask!
              </p>
            )}
            <div className="pt-4 border-t">
              <Label htmlFor="ask-question" className="font-semibold">
                Have a question?
              </Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  id="ask-question"
                  placeholder="Ask a question about this product..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitQuestion();
                    }
                  }}
                  className="flex-1 border border-input rounded-md px-3 py-2 text-sm"
                />
                <Button
                  onClick={handleSubmitQuestion}
                  disabled={isSubmittingQuestion || !questionText.trim()}
                >
                  {isSubmittingQuestion ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please{" "}
                  <button
                    onClick={() => router.push("/client-login")}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    log in
                  </button>{" "}
                  to ask a question
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProductRatingsReviews;