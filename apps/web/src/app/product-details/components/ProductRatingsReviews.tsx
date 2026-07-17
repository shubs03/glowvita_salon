import React from "react";
import { Star, Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
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

  // Question states
  const [questionText, setQuestionText] = React.useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = React.useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

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
          <div className="mt-8 space-y-4">
            {productReviews.length > 0 ? (
              productReviews.map((review: any) => (
                <div key={review._id} className="border border-gray-200 border-t-[3px] border-t-[#422A3C] rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-2">
                  <div className="flex w-full justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center text-primary font-bold shadow-inner">
                        {review.userImage ? (
                          <img src={review.userImage} alt={review.userName} className="w-full h-full object-cover" />
                        ) : review.userName ? (
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
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < (review.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full pl-[60px]">
                    <p className="text-sm text-black leading-relaxed">
                      {review.comment || "No review text available"}
                    </p>

                    {/* Review Images (if any) */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img: string, i: number) => (
                          <div key={i} className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                            <img src={img} className="w-full h-full object-cover" alt="Review photo" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {productReviews.length > 0 && (
             <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-[13px] font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View All Reviews <ChevronRight className="h-4 w-4" />
                </button>
             </div>
          )}
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