import React from "react";
import { Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
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
      // Use provided breakdown or default
      return ratingsBreakdown || [
        { stars: 5, count: 15207, percentage: 63.7 },
        { stars: 4, count: 6116, percentage: 25.6 },
        { stars: 3, count: 1547, percentage: 6.5 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 993, percentage: 4.2 },
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
    <section className="space-y-16">
      {/* Rating Distribution Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Rating Distribution</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12">
              {/* Left - Average Rating */}
              <div className="flex flex-col items-center md:items-center">
                <div className="text-7xl font-bold text-primary mb-2">
                  {ratingsData.averageRating}
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(ratingsData.averageRating)
                          ? "fill-primary text-primary"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm text-center">
                  <span className="font-semibold">
                    {ratingsData.totalRatings.toLocaleString()}
                  </span> Ratings
                </p>
                <p className="text-muted-foreground text-sm text-center">
                  <span className="font-semibold">
                    {ratingsData.totalReviews.toLocaleString()}
                  </span> Reviews
                </p>
              </div>

              {/* Right - Star Distribution Bars */}
              <div className="space-y-4">
                {ratingsData.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {/* Star Rating Label */}
                    <div className="w-8 flex items-center">
                      <span className="text-sm font-medium">
                        {item.stars}
                        <Star className="w-3 h-3 ml-0.5 inline fill-current" />
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    {/* Count */}
                    <div className="w-14 text-right text-foreground text-sm font-semibold">
                      {item.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings & Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Ratings & Reviews</h2>
        <Card>
          <CardContent className="p-6 space-y-6">
            {productReviews.length > 0 ? (
              productReviews.map((review: any) => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="font-semibold">{review.userName}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reviews yet. Be the first to review!
              </p>
            )}
            
            {/* Review Submission Form */}
            <div className="pt-4 border-t">
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
                        className={`h-6 w-6 ${
                          star <= (hoveredRating || reviewRating)
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
      </div>

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
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Was this helpful?
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-xs h-auto p-1"
                        >
                          <ThumbsUp className="h-3 w-3" /> Yes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-xs h-auto p-1"
                        >
                          <ThumbsDown className="h-3 w-3" /> No
                        </Button>
                      </div>
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