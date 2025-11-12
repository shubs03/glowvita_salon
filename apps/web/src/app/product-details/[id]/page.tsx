
"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Star, Plus, Minus, Heart, Shield, Truck, ThumbsUp, ThumbsDown, Droplets, Leaf, FlaskConical, Loader2, PackageCheck, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@repo/ui/page-container';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { useGetPublicProductByIdQuery, useAddToClientCartMutation, useGetProductQuestionsQuery, useSubmitProductQuestionMutation, useGetProductReviewsQuery, useSubmitProductReviewMutation } from '@repo/store/api';
import { Skeleton } from '@repo/ui/skeleton';
import { useAppDispatch } from "@repo/store/hooks";
import { addToCart as addToLocalCart } from "@repo/store/slices/cartSlice";
import { useAuth } from '@/hooks/useAuth';
import { useCartSync } from "@/hooks/useCartSync";
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  
  // Review states
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Fetch product data
  const { data: productResponse, isLoading, error } = useGetPublicProductByIdQuery(id as string);
  const [addToCartAPI] = useAddToClientCartMutation();
  
  // Fetch product questions
  const { data: questionsResponse, refetch: refetchQuestions } = useGetProductQuestionsQuery(id as string);
  const [submitQuestion] = useSubmitProductQuestionMutation();

  // Fetch product reviews
  const { data: reviewsResponse, refetch: refetchReviews } = useGetProductReviewsQuery(id as string);
  const [submitReview] = useSubmitProductReviewMutation();

  const productQuestions = questionsResponse?.questions || [];
  const productReviews = reviewsResponse?.reviews || [];

  console.log("Product Response:", productResponse);
  
  // Initialize cart sync
  useCartSync();
  
  const product = productResponse?.product;
  const availableStock = product?.stock || 0;
  const isOutOfStock = availableStock === 0;

  // Update main image when product loads
  React.useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  // Handle quantity increase with stock validation
  const handleIncreaseQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    } else {
      toast.warning(`Only ${availableStock} units available in stock.`);
    }
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = () => {
    setQuantity(Math.max(1, quantity - 1));
  };

  // Handle add to cart with stock validation
  const handleAddToCart = async () => {
    // Validate product data is available
    if (!product) {
      toast.error("Product data not available. Please try again.");
      return;
    }

    // Validate required fields
    const productId = product.id || product._id || id;
    const productPrice = product.salePrice || product.price;
    
    if (!productId) {
      toast.error("Product ID is missing. Please refresh the page.");
      return;
    }

    if (!productPrice || productPrice === 0) {
      toast.error("Product price is not available.");
      return;
    }

    if (!quantity || quantity < 1) {
      toast.error("Please select a valid quantity.");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} units available. Please adjust the quantity.`);
      return;
    }

    setIsAddingToCart(true);
    try {
      if (isAuthenticated && user?._id) {
        // User is authenticated - use API
        const cartItem = {
          productId: productId,
          productName: product.name || "Product",
          productImage: Array.isArray(product.images) && product.images.length > 0 
            ? product.images[0] 
            : "",
          quantity: quantity,
          price: productPrice,
          vendorId: product.vendorId || "",
          supplierName: product.vendorName || "Unknown Vendor",
        };

        console.log("Adding to cart (API):", cartItem); // Debug log

        await addToCartAPI(cartItem).unwrap();
        
        // Show success toast
        toast.success(`${product.name} added to cart!`, {
          description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/profile/cart"),
          },
        });
      } else {
        // User is not authenticated - use local storage
        const cartItem = {
          _id: productId,
          productId: productId,
          productName: product.name || "Product",
          price: productPrice,
          quantity: quantity,
          productImage: Array.isArray(product.images) && product.images.length > 0 
            ? product.images[0] 
            : "",
          vendorId: product.vendorId || "",
          supplierName: product.vendorName || "Unknown Vendor",
          // Additional details for better cart management
          category: product.category,
          stock: product.stock,
          hint: product.description,
        };

        console.log("Adding to cart (Local):", cartItem); // Debug log

        // Dispatch to Redux store (will also save to localStorage)
        dispatch(addToLocalCart(cartItem));

        // Show success toast
        toast.success(`${product.name} added to cart!`, {
          description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/profile/cart"),
          },
        });
      }
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      toast.error(error?.data?.message || "Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle buy now with stock validation
  const handleBuyNow = () => {
    if (!product) {
      toast.error("Product data not available. Please try again.");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} units available. Please adjust the quantity.`);
      return;
    }

    setIsBuyingNow(true);
    try {
      // Store product details in local storage for checkout
      // Match the structure used in salon-details page
      const productForCheckout = {
        id: product.id || id, // Product ID (MongoDB ObjectId)
        name: product.name,
        price: product.salePrice || product.price, // Use sale price if available
        image: Array.isArray(product.images) && product.images.length > 0 
          ? product.images[0] 
          : "https://placehold.co/320x224/e2e8f0/64748b?text=Product",
        vendorId: product.vendorId,
        vendorName: product.vendorName || "Unknown Vendor",
        quantity: quantity,
        // Additional fields that might be useful
        description: product.description || "",
        category: product.category || "Beauty Products",
        stock: product.stock,
      };
      
      console.log("Buy Now - Product for checkout:", productForCheckout); // Debug log
      
      localStorage.setItem("buyNowProduct", JSON.stringify(productForCheckout));
      
      // Redirect to checkout page
      router.push("/checkout");
    } catch (error) {
      console.error("Failed to save to localStorage", error);
      toast.error("Could not process your request. Please ensure you are not in private browsing mode.");
      setIsBuyingNow(false);
    }
  };

  // Handle question submission
  const handleSubmitQuestion = async () => {
    // Check if user is logged in
    if (!isAuthenticated || !user) {
      toast.error("Please log in to ask a question", {
        action: {
          label: "Log In",
          onClick: () => router.push("/client-login"),
        },
      });
      return;
    }

    // Validate question
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
      await submitQuestion({
        productId: id as string,
        question: questionText.trim(),
      }).unwrap();

      toast.success("Question submitted successfully!", {
        description: "The vendor will answer your question soon.",
      });
      
      setQuestionText('');
      refetchQuestions();
    } catch (error: any) {
      console.error("Failed to submit question:", error);
      toast.error(error?.data?.message || "Failed to submit question. Please try again.");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    // Check if user is logged in
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
      await submitReview({
        productId: id as string,
        rating: reviewRating,
        comment: reviewComment.trim(),
      }).unwrap();

      toast.success("Review submitted successfully!", {
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setReviewRating(0);
      setHoveredRating(0);
      setReviewComment('');
      refetchReviews();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast.error(error?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer className='max-w-7xl'>
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start py-12">
          <div className="space-y-4">
            <Skeleton className="w-full h-96" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-20" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer className='max-w-7xl'>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => router.push('/')}>Go Back Home</Button>
        </div>
      </PageContainer>
    );
  }

  const details = [
    ...(product.size ? [{ title: 'Size', content: `${product.size}${product.sizeMetric ? ' ' + product.sizeMetric : ''}` }] : []),
    ...(product.keyIngredients && product.keyIngredients.length > 0 ? [{ title: 'Key Ingredients', content: product.keyIngredients.join(', ') }] : []),
  ];

  const specifications = {
    ...(product.productForm ? { 'Form': product.productForm } : {}),
    ...(product.brand ? { 'Brand': product.brand } : {}),
    ...(product.forBodyPart ? { 'Body Part' : product.forBodyPart } : {}),
    ...(product.bodyPartType ? { 'Body Part Type' : product.bodyPartType } : {}),
    // ...(product.category ? { 'Category': product.category } : {}),
    // ...(product.size && product.sizeMetric ? { 'Volume': `${product.size} ${product.sizeMetric}` } : {}),
  };

  return (
    <PageContainer className='max-w-7xl'>
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start py-12">
        {/* Left Column: Image Gallery (Sticky) */}
        <div className="lg:sticky top-24">
          <div className="flex gap-4">
            {/* Vertical Thumbnails */}
            <div className="flex flex-col gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {product.images.map((img: any, index: any) => (
                <div 
                  key={index} 
                  className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${mainImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'}`}
                  onClick={() => setMainImage(img)}
                >
                  <Image 
                    src={img} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    layout="fill" 
                    objectFit="cover"
                    data-ai-hint="product photo"
                  />
                </div>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex w-full h-auto relative rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={mainImage} 
                alt={product.name} 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="skincare product"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Product Details (Scrollable) */}
        <div className="mt-8 lg:mt-0 space-y-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold font-headline">{product.name}</h1>
            
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <p className="text-lg text-muted-foreground">{product.description}</p>
            
            {/* Price Display */}
            <div className="flex items-center gap-4">
              {product.salePrice && product.salePrice < product.price ? (
                <>
                  <p className="text-4xl font-bold text-blue-700">₹{product.salePrice.toFixed(2)}</p>
                  <p className="text-2xl text-muted-foreground line-through">₹{product.price.toFixed(2)}</p>
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <p className="text-4xl font-bold">₹{product.price.toFixed(2)}</p>
              )}
            </div>

            {/* Stock Information */}
            <div className="flex items-center gap-3">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Out of Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PackageCheck className={`h-5 w-5 ${availableStock < 10 ? 'text-orange-500' : 'text-green-600'}`} />
                  <span className={`font-semibold ${availableStock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                    {availableStock < 10 ? `Only ${availableStock} left in stock` : 'In Stock'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border rounded-md p-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleDecreaseQuantity}
                  disabled={isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold w-8 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleIncreaseQuantity}
                  disabled={isOutOfStock || quantity >= availableStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                size="lg" 
                variant="default"
                className="flex-1 bg-blue-600 hover:bg-blue-700" 
                onClick={handleBuyNow}
                disabled={isOutOfStock || isBuyingNow}
              >
                {isBuyingNow ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  'Buy Now'
                )}

              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 border-2 border-blue-600 hover:border-blue-700" 
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12"><Heart className="h-6 w-6" /></Button>
            </div>

            <div className="space-y-3 pt-4 border-t">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {details.map((detail: any) => (
                <div key={detail.title} className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-semibold text-gray-600">{detail.title}</span>
                  <span className="text-muted-foreground col-span-2">{detail.content}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section: Specifications */}
          {Object.keys(specifications).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Specifications</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <p className="font-semibold text-gray-600">{key}</p>
                        <p className="text-muted-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section: Ratings & Reviews */}
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
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <p className="font-semibold">{review.userName}</p>
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reviews yet. Be the first to review!
                  </p>
                )}
                
                {/* Review Submission Form */}
                <div className="pt-4 border-t">
                  <Label htmlFor="write-review" className="font-semibold mb-2 block">Write a Review</Label>
                  
                  {/* Star Rating Input */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">Your Rating:</span>
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
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    {reviewRating > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({reviewRating} {reviewRating === 1 ? 'star' : 'stars'})
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
                      disabled={isSubmittingReview || !reviewComment.trim() || !reviewRating}
                      className="flex-1"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </div>
                  
                  {!isAuthenticated && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Please{' '}
                      <button
                        onClick={() => router.push('/client-login')}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        log in
                      </button>
                      {' '}to write a review
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section: Questions & Answers */}
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
                          <p className="text-sm text-muted-foreground mt-2">A: {item.answer}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">Was this helpful?</span>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs h-auto p-1">
                              <ThumbsUp className="h-3 w-3" /> Yes
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs h-auto p-1">
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
                  <Label htmlFor="ask-question" className="font-semibold">Have a question?</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      id="ask-question" 
                      placeholder="Ask a question about this product..." 
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitQuestion();
                        }
                      }}
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
                        'Submit'
                      )}
                    </Button>
                  </div>
                  {!isAuthenticated && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Please{' '}
                      <button
                        onClick={() => router.push('/client-login')}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        log in
                      </button>
                      {' '}to ask a question
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* NEW SECTIONS ADDED BELOW */}
      <div className="space-y-16 mt-16">
        {/* Section: Why You'll Love It */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Why You'll Love It</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-6">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                <Droplets className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Intense Hydration</h3>
              <p className="text-muted-foreground mt-2">Hyaluronic Acid provides deep, lasting moisture for plump, supple skin.</p>
            </Card>
            <Card className="p-6">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                <Leaf className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Brightens Complexion</h3>
              <p className="text-muted-foreground mt-2">Vitamin C works to fade dark spots and even out skin tone for a radiant look.</p>
            </Card>
            <Card className="p-6">
              <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                <FlaskConical className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Fights Aging</h3>
              <p className="text-muted-foreground mt-2">Powerful antioxidants combat free radicals and reduce the appearance of fine lines.</p>
            </Card>
          </div>
        </section>

        {/* Section: How to Use */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">How to Use</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <Card className="flex items-center p-4">
              <div className="bg-secondary text-secondary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">1</div>
              <div>
                <h4 className="font-semibold">Cleanse</h4>
                <p className="text-sm text-muted-foreground">Start with a clean, dry face.</p>
              </div>
            </Card>
            <Card className="flex items-center p-4">
              <div className="bg-secondary text-secondary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">2</div>
              <div>
                <h4 className="font-semibold">Apply Serum</h4>
                <p className="text-sm text-muted-foreground">Apply 2-3 drops of Aura Serum and gently massage into your skin.</p>
              </div>
            </Card>
            <Card className="flex items-center p-4">
              <div className="bg-secondary text-secondary-foreground font-bold rounded-full w-8 h-8 flex items-center justify-center mr-4">3</div>
              <div>
                <h4 className="font-semibold">Moisturize</h4>
                <p className="text-sm text-muted-foreground">Follow up with your favorite moisturizer to lock in the hydration.</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section: From the Brand */}
        <section>
          <Card className="bg-secondary/50">
            <CardContent className="p-8 grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 text-center">
                <h3 className="text-2xl font-bold font-headline">Aura Cosmetics</h3>
                <p className="text-muted-foreground mt-1">Science-backed skincare</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-lg text-muted-foreground italic">"At Aura, we believe that radiant skin is a reflection of overall wellness. Our mission is to blend cutting-edge science with nature's finest ingredients to create products that not only beautify but also nourish."</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

    </PageContainer>
  );
}
