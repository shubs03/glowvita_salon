import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addToCart } from "@repo/store/slices/cartSlice";
import { cn } from "@repo/ui/cn";
import { useAddToClientCartMutation } from "@repo/store/services/api";

const PRODUCT_PLACEHOLDER = "/images/product-placeholder.png";

interface ProductCardProps {
  product: any;
  onBuyNow: (product: any) => void;
  onAddToCart: (product: any) => void;
  vendorId: string;
  vendorName: string;
  isSubscriptionExpired?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuyNow,
  onAddToCart,
  vendorId,
  vendorName,
  isSubscriptionExpired = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartAdded, setIsCartAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    (product.image && product.image.trim()) ? product.image : PRODUCT_PLACEHOLDER
  );
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const [addToCartAPI] = useAddToClientCartMutation();
  const localCartItems = useAppSelector((state: any) => state.cart.items);

  const isProductInCart = useMemo(() => {
    if (!localCartItems?.length) return false;
    return localCartItems.some((item: any) => {
      const itemId = item?.productId || item?._id || item?.id;
      return String(itemId) === String(product.id);
    });
  }, [localCartItems, product.id]);

  const showCartActiveIcon = isCartAdded || isProductInCart;

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated && user?._id) {
        try {
          const response = await fetch(`/api/client/wishlist/${product.id}`, {
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
  }, [product.id, isAuthenticated, user]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      router.push("/client-login");
      return;
    }

    try {
      setIsLoading(true);
      const url = isLiked ? `/api/client/wishlist/${product.id}/remove` : '/api/client/wishlist';
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id }),
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

    if (!isSubscriptionExpired) {
      setIsCartAdded(true);
      onAddToCart(product);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isSubscriptionExpired) {
      onBuyNow(product);
    }
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden hover:shadow-lg rounded-none rounded-tr-2xl rounded-bl-2xl border border-gray-200 bg-white transition-shadow flex flex-col text-left relative",
        isSubscriptionExpired ? "cursor-not-allowed opacity-90" : "cursor-pointer"
      )}
      onClick={() => {
        if (isSubscriptionExpired) {
          toast.error("Salon Unavailable", {
            description: "This salon is currently not available. Products cannot be viewed or purchased until the subscription is renewed."
          });
          return;
        }
        router.push(`/product-details/${product.id}`);
      }}
    >
      <div className="relative aspect-square overflow-hidden rounded-md m-2">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(PRODUCT_PLACEHOLDER)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          data-ai-hint={product.hint}
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-primary">
            {product.category}
          </p>
          <div className="flex items-center gap-1" style={{ color: "#BA7894" }}>
            <img src="/images/Vector (2).png" alt="star" className="w-3 h-3 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <Star className="w-3 h-3 hidden" fill="#BA7894" stroke="#BA7894" />
            <span className="text-xs font-semibold">
              {product.rating || "0.0"}
            </span>
          </div>
        </div>

        <h4 className="text-sm font-semibold flex-grow mb-2">
          {product.name}
        </h4>

        <p className="text-xs text-black line-clamp-2 mb-2">
          {product.description}
        </p>

        <div className="flex flex-col gap-0.5 mt-auto mb-2">
          {product.salePrice > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-primary">
                ₹{product.salePrice.toFixed(2)}
              </p>
              <p className="text-xs text-black line-through">
                ₹{product.price.toFixed(2)}
              </p>
              <Badge variant="secondary" className="bg-green-100 text-black text-[10px] px-1 py-0 h-4 hover:bg-green-100">
                {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
              </Badge>
            </div>
          ) : (
            <p className="font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className={`rounded-none rounded-tr-xl rounded-bl-xl text-xs px-6 ${isSubscriptionExpired ? 'opacity-50' : ''}`}
            onClick={handleBuyNow}
            disabled={isSubscriptionExpired}
            style={!isSubscriptionExpired ? { borderColor: '#422A3C', color: '#422A3C' } : {}}
          >
            {isSubscriptionExpired ? 'Unavailable' : 'Buy Now'}
          </Button>

          <div className="flex items-center gap-2">
            <button
              className={`flex items-center justify-center w-7 h-7 hover:text-red-500 transition-opacity ${isLoading ? 'opacity-50' : ''}`}
              onClick={handleWishlistToggle}
              disabled={isLoading}
            >
              {isLiked ? (
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              ) : (
                <>
                  <img src="/images/heart.png" alt="heart" className="w-4 h-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                  <Heart className="w-4 h-4 hidden text-black" />
                </>
              )}
            </button>

            <button
              className={`flex items-center justify-center w-7 h-7 hover:opacity-70 transition-opacity ${isSubscriptionExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleAddToCart}
              disabled={isSubscriptionExpired}
            >
              {showCartActiveIcon ? (
                <img src="/images/add-to-cart (6).png" alt="cart" className="w-4 h-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              ) : (
                <img src="/images/add-to-cart (5).png" alt="add to cart" className="w-4 h-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              )}
              <ShoppingCart className="h-4 w-4 hidden text-black" />
            </button>
          </div>
        </div>

        {isSubscriptionExpired && (
          <p className="text-[10px] text-black mt-2 text-center font-medium">
            This product is temporarily closed
          </p>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;