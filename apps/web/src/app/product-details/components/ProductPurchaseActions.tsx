'use client';

import React from 'react';
import { Button } from '@repo/ui/button';
import { cn } from "@repo/ui/cn";
import { Heart, Loader2 } from 'lucide-react';

interface ProductPurchaseActionsProps {
  handleWishlistToggle: () => void;
  isWishlisted: boolean;
  isWishlistLoading: boolean;
  handleBuyNow: () => void;
  handleAddToCart: () => void;
  isOutOfStock: boolean;
  isBuyingNow: boolean;
  isAddingToCart: boolean;
}

const ProductPurchaseActions: React.FC<ProductPurchaseActionsProps> = ({
  handleWishlistToggle,
  isWishlisted,
  isWishlistLoading,
  handleBuyNow,
  handleAddToCart,
  isOutOfStock,
  isBuyingNow,
  isAddingToCart,
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 text-red-500"
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
        </Button>

        <Button
          size="lg"
          variant="default"
          className="flex-1 bg-primary hover:bg-primary/95"
          onClick={() => handleBuyNow()}
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
          className="flex-1 border-2 border-primary hover:border-primary/95"
          onClick={() => handleAddToCart()}
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
      </div>
    </div>
  );
};

export default ProductPurchaseActions;