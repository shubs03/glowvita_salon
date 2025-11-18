"use client";

import Image from "next/image";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { useAddToClientCartMutation } from "@repo/store/api";
import { useAppDispatch } from "@repo/store/hooks";
import { addToCart } from "@repo/store/slices/cartSlice";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NewProductCardProps {
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
}

export function NewProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  hint,
  rating,
  reviewCount,
  isNew = false,
  vendorName,
  vendorId,
  description,
  category,
  stock,
}: NewProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
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

  const handleCardClick = () => {
    router.push(`/product-details/${id}`);
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
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };

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

  return (
    <div 
      className="group relative overflow-hidden rounded-md hover:shadow-md border bg-card transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Upper Half: Image */}
      <div className="aspect-[4/3] relative w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          layout="fill"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        {isNew && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-none text-xs py-0.5 px-2 rounded-full font-bold shadow-lg">
            NEW
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 text-blue-500 backdrop-blur-sm hover:bg-white/30 transition-all",
            isLiked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={handleWishlistToggle}
          disabled={isLoading}
        >
          <Heart
            className={cn("h-4 w-4", isLiked && "fill-current text-blue-500")}
          />
        </Button>
      </div>

      {/* Lower Half: Details */}
      <div className="p-4 flex flex-col justify-between h-fit bg-card">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {vendorName}
          </p>
          <h3 className="font-bold text-base text-foreground line-clamp-1 leading-snug mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>

          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-foreground">
                {rating}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              {salePrice && (
                <span className="text-lg font-bold text-primary">
                  ₹{salePrice.toFixed(2)}
                </span>
              )}
              <span
                className={cn(
                  "font-semibold",
                  salePrice
                    ? "text-xs text-muted-foreground line-through"
                    : "text-md text-foreground"
                )}
              >
                ₹{price.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex justify-between gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-fit rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-fit rounded-lg group-hover:text-primary transition-colors group-hover:border-primary"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}