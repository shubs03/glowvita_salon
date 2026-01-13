"use client"

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Star, Plus, Minus, Heart, Shield, Truck, ThumbsUp, ThumbsDown, Droplets, Leaf, FlaskConical, Loader2, PackageCheck, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageContainer } from '@repo/ui/page-container';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { useGetPublicProductByIdQuery, useAddToClientCartMutation, useGetProductQuestionsQuery, useSubmitProductQuestionMutation, useGetProductReviewsQuery, useSubmitProductReviewMutation, useGetPublicVendorProductsQuery } from '@repo/store/api';
import { Skeleton } from '@repo/ui/skeleton';
import { useAppDispatch } from "@repo/store/hooks";
import { addToCart as addToLocalCart } from "@repo/store/slices/cartSlice";
import { useAuth } from '@/hooks/useAuth';
import { useCartSync } from "@/hooks/useCartSync";
import { toast } from 'sonner';
import ProductRatingsReviews from '../components/ProductRatingsReviews';
import DiscountBanner from '../components/DiscountBanner';
import RelevantProducts from '../components/RelevantProducts';
import ProductPurchaseActions from '../components/ProductPurchaseActions';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  vendorId: string;
  vendorName: string;
  category: string;
  stock: number;
  rating: number;
  hint: string;
  images?: string[];
}

// Define type for vendor products
interface VendorProduct {
  id: string;
  name: string;
  image: string;
  images?: string[];
  vendorId: string;
  vendorName: string;
  price: number;
  salePrice?: number;
  category: string;
  stock: number;
  rating: number;
  description: string;
}

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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);
  
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

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated && user?._id && id) {
        try {
          const response = await fetch(`/api/client/wishlist/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsWishlisted(data.isInWishlist);
          }
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      }
      setIsWishlistLoading(false);
    };

    checkWishlistStatus();
  }, [id, isAuthenticated, user]);

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      router.push("/client-login");
      return;
    }

    try {
      setIsWishlistLoading(true);
      const url = isWishlisted ? `/api/client/wishlist/${id}/remove` : '/api/client/wishlist';
      const method = isWishlisted ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist", {
          description: isWishlisted ? "Product removed from your wishlist" : "Product added to your wishlist"
        });
      } else {
        const errorData = await response.json();
        toast.error("Wishlist Update Failed", {
          description: errorData.message || "Failed to update wishlist"
        });
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Wishlist Update Failed", {
        description: "Failed to update wishlist. Please try again."
      });
    } finally {
      setIsWishlistLoading(false);
    }
  };

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
  const handleAddToCart = async (selectedProduct?: any) => {
    const prod = selectedProduct || product;
    const qty = selectedProduct ? 1 : quantity; // Use 1 for related products
    
    // Validate product data is available
    if (!prod) {
      toast.error("Product data not available. Please try again.");
      return;
    }

    // Validate required fields
    const productId = prod.id || prod._id || id;
    const productPrice = prod.salePrice || prod.price;
    
    if (!productId) {
      toast.error("Product ID is missing. Please refresh the page.");
      return;
    }

    if (!productPrice || productPrice === 0) {
      toast.error("Product price is not available.");
      return;
    }

    if (!qty || qty < 1) {
      toast.error("Please select a valid quantity.");
      return;
    }

    const availableStock = prod.stock || 0;
    if (availableStock === 0 && !selectedProduct) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (qty > availableStock && !selectedProduct) {
      toast.error(`Only ${availableStock} units available. Please adjust the quantity.`);
      return;
    }

    const isAddingToCartState = selectedProduct ? false : isAddingToCart;
    const setIsAddingToCartState = selectedProduct ? () => {} : setIsAddingToCart;

    setIsAddingToCartState(true as any);
    try {
      if (isAuthenticated && user?._id) {
        // User is authenticated - use API
        const cartItem = {
          productId: productId,
          productName: prod.name || "Product",
          productImage: Array.isArray(prod.images) && prod.images.length > 0 
            ? prod.images[0] 
            : "",
          quantity: qty,
          price: productPrice,
          vendorId: prod.vendorId || "",
          supplierName: prod.vendorName || "Unknown Vendor",
        };

        console.log("Adding to cart (API):", cartItem); // Debug log

        await addToCartAPI(cartItem).unwrap();
        
        // Show success toast
        toast.success(`${prod.name} added to cart!`, {
          description: `${qty} ${qty > 1 ? 'items' : 'item'} added to your cart.`,
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
          productName: prod.name || "Product",
          price: productPrice,
          quantity: qty,
          productImage: Array.isArray(prod.images) && prod.images.length > 0 
            ? prod.images[0] 
            : "",
          vendorId: prod.vendorId || "",
          supplierName: prod.vendorName || "Unknown Vendor",
          // Additional details for better cart management
          category: prod.category,
          stock: prod.stock,
          hint: prod.description,
        };

        console.log("Adding to cart (Local):", cartItem); // Debug log

        // Dispatch to Redux store (will also save to localStorage)
        dispatch(addToLocalCart(cartItem));

        // Show success toast
        toast.success(`${prod.name} added to cart!`, {
          description: `${qty} ${qty > 1 ? 'items' : 'item'} added to your cart.`,
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
      if (!selectedProduct) {
        setIsAddingToCart(false);
      }
    }
  };

  // Handle buy now with stock validation
  const handleBuyNow = (selectedProduct?: any) => {
    const prod = selectedProduct || product;
    if (!prod) {
      toast.error("Product data not available. Please try again.");
      return;
    }

    if (isOutOfStock && !selectedProduct) {
      toast.error("This product is currently out of stock.");
      return;
    }

    const availableStock = prod.stock || 0;
    if (quantity > availableStock && !selectedProduct) {
      toast.error(`Only ${availableStock} units available. Please adjust the quantity.`);
      return;
    }

    setIsBuyingNow(true);
    try {
      // Store product details in local storage for checkout
      // Match the structure used in salon-details page
      const productForCheckout = {
        id: prod.id || id, // Product ID (MongoDB ObjectId)
        name: prod.name,
        price: prod.salePrice || prod.price, // Use sale price if available
        image: Array.isArray(prod.images) && prod.images.length > 0 
          ? prod.images[0] 
          : "https://placehold.co/320x224/e2e8f0/64748b?text=Product",
        vendorId: prod.vendorId,
        vendorName: prod.vendorName || "Unknown Vendor",
        quantity: selectedProduct ? 1 : quantity, // Use 1 for related products
        // Additional fields that might be useful
        description: prod.description || "",
        category: prod.category || "Beauty Products",
        stock: prod.stock,
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
        description: "Your review will be visible in your profile after approval by the product owner.",
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

  // Fetch other products from the same vendor
  const { data: vendorProductsResponse, isLoading: vendorProductsLoading } = useGetPublicVendorProductsQuery(product?.vendorId || '', {
    skip: !product?.vendorId
  });

  const vendorProducts = vendorProductsResponse?.products?.filter((prod: any) => prod.id !== id) || [];

  if (isLoading) {
    return (
      <PageContainer className='max-w-7xl'>
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start py-12">
          <div className="space-y-4">
            <Skeleton className="w-full h-96" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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

      <DiscountBanner/>
      
      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start py-12">
        {/* Left Column: Image Gallery (Sticky) */}
        <div className="lg:sticky top-24">
          <div className="flex gap-4">
            {/* Vertical Thumbnails */}
            <div className="flex flex-col gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {product.images?.map((img: any, index: any) => (
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
            <div className="flex w-full h-96 relative rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={mainImage} 
                alt={product.name} 
                layout="fill" 
                objectFit="cover"
                className="w-full h-full"
                data-ai-hint="skincare product"
              />
            </div>
          </div>
          
          {/* Product Purchase Actions - Below Main Image */}
          <ProductPurchaseActions
            handleWishlistToggle={handleWishlistToggle}
            isWishlisted={isWishlisted}
            isWishlistLoading={isWishlistLoading}
            handleBuyNow={handleBuyNow}
            handleAddToCart={handleAddToCart}
            isOutOfStock={isOutOfStock}
            isBuyingNow={isBuyingNow}
            isAddingToCart={isAddingToCart}
          />
          
          {/* Other Products from Same Vendor Section */}
          {vendorProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg text-right font-semibold mb-4">More from {product.vendorName}</h3>
              <div className="flex justify-end gap-4">
                {(vendorProducts as any[]).slice(0, 4).map((prod: any) => (
                  <div 
                    key={prod.id} 
                    className="relative group cursor-pointer"
                    onClick={() => router.push(`/product-details/${prod.id}`)}
                  >
                    <div className="w-20 h-20 overflow-hidden rounded-md shadow-sm">
                      <Image 
                        src={Array.isArray(prod.images) && prod.images.length > 0 
                          ? prod.images[0] 
                          : prod.image || "https://placehold.co/80x80/e2e8f0/64748b?text=Product"}
                        alt={prod.name} 
                        width={80}
                        height={80}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      {prod.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column: Product Details (Scrollable) */}
        <div className="mt-8 lg:mt-0 space-y-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold font-headline text-primary">{product.name}</h1>
            
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
                  <p className="text-4xl font-bold text-primary">₹{product.salePrice.toFixed(2)}</p>
                  <p className="text-2xl text-muted-foreground line-through">₹{product.price.toFixed(2)}</p>
                  <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <p className="text-4xl font-bold">₹{product.price.toFixed(2)}</p>
              )}
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

          <ProductRatingsReviews 
            averageRating={product.rating || 0} 
            totalRatings={product.reviews || 0} 
            totalReviews={product.reviews || 0}
            productReviews={productReviews}
            productQuestions={productQuestions}
            productId={id}
            onRefetchReviews={refetchReviews}
            onRefetchQuestions={refetchQuestions}
            onSubmitReview={async (reviewData: { productId: string; rating: number; comment: string }) => {
              await submitReview(reviewData).unwrap();
            }}
            onSubmitQuestion={async (questionData: { productId: string; question: string }) => {
              await submitQuestion(questionData).unwrap();
            }}
          />
        </div>
      </div>

      {/* Relevant Products Section */}
      <RelevantProducts 
        currentProductId={product.id || id}
        vendorId={product.vendorId || ''}
        vendorName={product.vendorName || ''}
        category={product.category || ''}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCart}
        isSubscriptionExpired={false}
      />
    </PageContainer>
  );
}