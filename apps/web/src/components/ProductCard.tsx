import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Heart, ShoppingCart, Star, Store } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addToCart } from "@repo/store/slices/cartSlice";
import { useGetClientCartQuery, useAddToClientCartMutation, useGetPublicVendorByIdQuery } from "@repo/store/api";
import { cn } from "@repo/ui/cn";
import { useMemo } from "react";
import { AlertCircle } from "lucide-react";

const PRODUCT_PLACEHOLDER = "/images/product-placeholder.png";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  hint: string;
  rating: number;
  reviewCount: number;
  vendorName: string;
  vendorId: string;
  isNew?: boolean;
  description?: string;
  category?: string;
  salePrice?: number;
  stock?: number;
  bodyPartType?: string;
  forBodyPart?: string;
  onBuyNow?: (product: any) => void;
  onAddToCart?: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  salePrice,
  image,
  hint,
  rating,
  reviewCount,
  vendorName,
  vendorId,
  isNew = false,
  description,
  category,
  stock,
  bodyPartType,
  forBodyPart,
  onBuyNow,
  onAddToCart,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState<string>(image || PRODUCT_PLACEHOLDER);

  useEffect(() => {
    setImgSrc(image || PRODUCT_PLACEHOLDER);
  }, [image]);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const [addToCartAPI] = useAddToClientCartMutation();
  const localCartItems = useAppSelector((state) => state.cart.items);
  const { data: cartData } = useGetClientCartQuery(undefined, {
    skip: !isAuthenticated || !user?._id,
  });

  const cartItems = isAuthenticated && user?._id ? (cartData?.data?.items || []) : localCartItems;

  // Fetch vendor data to check subscription
  const { data: vendorResponse } = useGetPublicVendorByIdQuery(vendorId, {
    skip: !vendorId,
  });

  const vendorData = vendorResponse?.vendor;

  const isSubscriptionExpired = useMemo(() => {
    if (!vendorData) return false;

    const subscription = vendorData.subscription;
    if (!subscription) return false;

    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const status = (subscription.status || '').toLowerCase().trim();

    const isStatusActive = status === 'active';
    const expiredStatuses = ['expired', 'expaired', 'inactive', 'suspended', 'cancelled', 'canceled'];
    const isStatusExpired = expiredStatuses.includes(status);
    const isDateExpired = endDate ? endDate < now : false;

    if (isStatusActive && !isDateExpired) return false;
    return isStatusExpired || isDateExpired;
  }, [vendorData]);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated && user?._id) {
        try {
          const response = await fetch(`/api/client/wishlist/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setIsLiked(data.isInWishlist);
          }
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      }
      setIsLoading(false);
    };

    checkWishlistStatus();
  }, [id, isAuthenticated, user]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      router.push("/client-login");
      return;
    }

    try {
      setIsLoading(true);
      const url = isLiked ? `/api/client/wishlist/${id}/remove` : '/api/client/wishlist';
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        toast.success(isLiked ? "Removed from Wishlist" : "Added to Wishlist", {
          description: isLiked ? "Product removed from your wishlist" : "Product added to your wishlist"
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
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSubscriptionExpired) {
      toast.error("Salon Unavailable", {
        description: "This product is temporarily closed due to salon subscription expiry."
      });
      return;
    }

    // Check if cart already has items from a different vendor
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      const currentVendorId = firstItem.vendorId;
      const currentVendorName = firstItem.vendorName || firstItem.supplierName || "another vendor";

      if (vendorId && currentVendorId && vendorId !== currentVendorId) {
        toast.error("Cannot add products from different vendors", {
          description: `Your cart already contains products from ${currentVendorName}. Please checkout or remove existing items first.`,
          duration: 5000,
        });
        return;
      }
    }

    try {
      if (isAuthenticated && user?._id) {
        // User is authenticated - use API
        const cartItem = {
          productId: id,
          productName: name,
          productImage: image,
          quantity: 1,
          price: salePrice || price,
          vendorId: vendorId,
          supplierName: vendorName,
        };

        await addToCartAPI(cartItem).unwrap();

        // Show success toast
        toast.success(`${name} added to cart!`, {
          description: `You can view all items in your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
      } else {
        // User is not authenticated - use local storage
        const cartItem = {
          _id: id,
          productName: name,
          price: salePrice && salePrice > 0 ? salePrice : price,
          originalPrice: price,
          hasSale: salePrice && salePrice > 0 ? true : false,
          quantity: 1,
          productImage: image,
          vendorId: vendorId,
          supplierName: vendorName,
          // Additional details for better cart management
          category: category,
          stock: stock,
          hint: description,
        };

        // Dispatch to Redux store (will also save to localStorage)
        dispatch(addToCart(cartItem));

        // Show success toast
        toast.success(`${name} added to cart!`, {
          description: `You can view all items in your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
          },
        });
      }
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      const errorMessage = error.data?.message || "Failed to add item to cart. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSubscriptionExpired) {
      toast.error("Salon Unavailable", {
        description: "This product is temporarily closed due to salon subscription expiry."
      });
      return;
    }

    if (!isAuthenticated) {
      router.push(`/client-login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Check if cart already has items from a different vendor
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      const currentVendorId = firstItem.vendorId;
      const currentVendorName = firstItem.vendorName || firstItem.supplierName || "another vendor";

      if (vendorId && currentVendorId && vendorId !== currentVendorId) {
        toast.error("Cannot proceed with mixed vendors", {
          description: `Your cart already contains products from ${currentVendorName}. Please checkout or remove existing items first.`,
          duration: 5000,
        });
        return;
      }
    }

    console.log('Buy Now clicked for product:', { id, name, vendorId });
    // Store product details in local storage
    try {
      const productData = {
        id,
        name,
        price: salePrice && salePrice > 0 ? salePrice : price,
        originalPrice: price,
        hasSale: salePrice && salePrice > 0 ? true : false,
        image,
        vendorName,
        vendorId: vendorId || 'unknown-vendor',
        quantity: 1,
      };
      console.log('Storing product data:', productData);
      localStorage.setItem('buyNowProduct', JSON.stringify(productData));
      // Redirect to checkout page
      router.push('/checkout');
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      alert('Could not process your request. Please ensure you are not in private browsing mode.');
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>
      <Card
        className={cn(
          "group overflow-hidden hover:shadow-lg w-[260px] h-[360px] rounded-none rounded-tr-[11px] rounded-bl-[11px] transition-shadow flex flex-col text-left relative",
          isSubscriptionExpired ? "cursor-not-allowed opacity-90" : "cursor-pointer"
        )}
        onClick={() => {
          if (isSubscriptionExpired) {
            toast.error("Salon Unavailable", {
              description: "This product is temporarily closed due to salon subscription expiry."
            });
            return;
          }
          router.push(`/product-details/${id}`);
        }}
      >
        <div className="relative h-[185px] w-full overflow-hidden flex-shrink-0">
          <img
            src={imgSrc}
            alt={name}
            onError={() => setImgSrc(PRODUCT_PLACEHOLDER)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={hint}
          />

          {salePrice && salePrice > 0 && price > salePrice && (
            <div className="absolute top-0 right-0 bg-[#422A3C] text-white text-[10px] font-bold px-2 py-1 rounded-bl-[11px] flex flex-col items-center justify-center leading-tight">
              <span>{Math.round(((price - salePrice) / price) * 100)}%</span>
              <span>OFF</span>
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-grow" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider truncate mr-2">
              {category || "Product"}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0" style={{ color: "#BA7894" }}>
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[12px] font-semibold">{rating > 0 ? rating.toFixed(1) : "0.0"}</span>
            </div>
          </div>

          <h4 className="text-[15px] font-bold text-gray-900 mb-0.5 line-clamp-1 leading-tight">
            {name}
          </h4>

          <p className="text-[12px] text-gray-500 line-clamp-2 leading-snug mb-1">
            {description || hint || "Explore high-quality beauty products crafted to elevate your daily self-care."}
          </p>

          <div className="flex items-center gap-1.5 mt-auto mb-2">
            {salePrice && salePrice > 0 ? (
              <>
                <p className="text-[12px] text-gray-400 line-through">
                  ₹ {price.toFixed(0)}/-
                </p>
                <p className="text-[14px] font-bold text-gray-900">
                  ₹ {salePrice.toFixed(0)}/-
                </p>
              </>
            ) : (
              <p className="text-[14px] font-bold text-gray-900">
                ₹ {price.toFixed(0)}/-
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "text-[10px] font-semibold rounded-none hover:bg-[#422A3C] hover:text-white transition-colors",
                isSubscriptionExpired && "opacity-50 cursor-not-allowed"
              )}
              style={{
                width: "100px",
                height: "36px",
                borderTopRightRadius: "7px",
                borderBottomLeftRadius: "7px",
                borderTopLeftRadius: "0px",
                borderBottomRightRadius: "0px",
                border: "1px solid #422A3C",
                padding: "0",
              }}
              onClick={handleBuyNow}
              disabled={isSubscriptionExpired}
            >
              {isSubscriptionExpired ? "Unavailable" : "Buy Now"}
            </Button>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={handleWishlistToggle}
                disabled={isLoading}
              >
                <Heart
                  className={cn("h-3.5 w-3.5", isLiked && "fill-red-500 text-red-500")}
                />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-7 w-7 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100",
                  isSubscriptionExpired && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleAddToCart}
                disabled={isSubscriptionExpired}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {isSubscriptionExpired && (
            <div className="flex items-center gap-1 mt-1.5 text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Closed</span>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default ProductCard;