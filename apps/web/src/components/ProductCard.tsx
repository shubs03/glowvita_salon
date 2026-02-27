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
import { useAddToClientCartMutation } from "@repo/store/api";

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
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const [addToCartAPI] = useAddToClientCartMutation();

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
          price: salePrice || price,
          quantity: 1,
          productImage: image,
          vendorId: vendorId,
          supplierName: vendorName,
          // Additional details for better cart management
          category: category,
          stock: stock,
          hint: hint || description,
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
    console.log('Buy Now clicked for product:', { id, name, vendorId });
    // Store product details in local storage
    try {
      const productData = {
        id,
        name,
        price: salePrice || price,
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
    <Card
      className="group overflow-hidden hover:shadow-lg rounded-none rounded-tr-2xl rounded-bl-2xl transition-shadow flex flex-col text-left cursor-pointer relative"
      onClick={() => router.push(`/product-details/${id}`)}
    >
      <div className="relative aspect-square overflow-hidden rounded-md m-2">
        <Image
          src={image}
          alt={name}
          fill
          className="group-hover:scale-105 transition-transform duration-300 object-cover"
          data-ai-hint={hint}
        />
        <Badge
          variant={
            stock && stock > 0 ? "secondary" : "default"
          }
          className="absolute top-2 right-2 text-xs"
        >
          {stock && stock > 0 ? `In Stock` : "Out of Stock"}
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
          {category}
        </p>
        <h4 className="text-sm font-semibold flex-grow mb-2">
          {name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <p className="font-bold text-primary">
            ₹{(salePrice || price).toFixed(2)}
          </p>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary fill-current" />
            <span className="text-xs text-muted-foreground font-medium">
              {rating}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex justify-between w-full">
            <Button
              size="sm"
              variant="outline"
              className="w-full hover:border-none rounded-none rounded-tr-xl rounded-bl-xl text-xs lg:mr-3"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-fit border-none text-xs rounded-none rounded-tr-2xl rounded-bl-2xl"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;