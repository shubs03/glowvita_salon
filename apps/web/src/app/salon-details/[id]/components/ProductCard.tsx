import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@repo/store/hooks";
import { addToCart } from "@repo/store/slices/cartSlice";
import Image from "next/image";
import { useAddToClientCartMutation } from "@repo/store/services/api";

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
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const [addToCartAPI] = useAddToClientCartMutation();

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
      className="group overflow-hidden hover:shadow-lg rounded-none rounded-tr-2xl rounded-bl-2xl transition-shadow flex flex-col text-left cursor-pointer relative"
      onClick={() => router.push(`/product-details/${product.id}`)}
    >
      <div className="relative aspect-square overflow-hidden rounded-md m-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="group-hover:scale-105 transition-transform duration-300 object-cover"
          data-ai-hint={product.hint}
        />
        <Badge
          variant={
            product.stock > 0 ? "secondary" : "default"
          }
          className="absolute top-2 right-2 text-xs"
        >
          {product.stock > 0 ? `In Stock` : "Out of Stock"}
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-1 left-1 h-8 w-8 rounded-full bg-white/20 text-primary backdrop-blur-sm hover:bg-white/30 transition-all"
          onClick={handleWishlistToggle}
          disabled={isLoading}
        >
          <Heart
            className={`h-4 w-4 ${isLiked ? "fill-current text-primary" : ""}`}
          />
        </Button>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <p className="text-xs font-bold text-primary mb-1">
          {product.category}
        </p>
        <h4 className="text-sm font-semibold flex-grow mb-2">
          {product.name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <p className="font-bold text-primary">
            ₹{product.price.toFixed(2)}
          </p>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary fill-current" />
            <span className="text-xs text-muted-foreground font-medium">
              {product.rating}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex justify-between w-full">
            <Button
              size="sm"
              variant="outline"
              className={`w-full hover:border-none rounded-none rounded-tr-xl rounded-bl-xl text-xs lg:mr-3 ${isSubscriptionExpired ? 'opacity-50' : ''}`}
              onClick={handleBuyNow}
              disabled={isSubscriptionExpired}
            >
              {isSubscriptionExpired ? 'Unavailable' : 'Buy Now'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className={`w-fit border-none text-xs rounded-none rounded-tr-2xl rounded-bl-2xl ${isSubscriptionExpired ? 'opacity-50' : ''}`}
              onClick={handleAddToCart}
              disabled={isSubscriptionExpired}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isSubscriptionExpired && (
          <p className="text-xs text-red-600 mt-2 text-center">
            Not available at the moment
          </p>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;